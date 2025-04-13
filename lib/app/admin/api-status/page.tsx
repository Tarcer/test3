"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { checkApiHealth } from "@/lib/services/api-health-check"

export default function ApiStatusPage() {
  const [status, setStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkStatus = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const results = await checkApiHealth()
      setStatus(results)
    } catch (error) {
      console.error("Erreur lors de la vérification de l'état des API:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const handleRefresh = () => {
    checkStatus(true)
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">État des API</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Rafraîchir
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : status ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Coinbase Commerce API
                <Badge variant={status.coinbase ? "success" : "destructive"}>
                  {status.coinbase ? "Opérationnel" : "Problème détecté"}
                </Badge>
              </CardTitle>
              <CardDescription>État de la connexion à l'API Coinbase Commerce</CardDescription>
            </CardHeader>
            <CardContent>
              {status.coinbase ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>L'API Coinbase Commerce est correctement configurée et opérationnelle.</span>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur de connexion à Coinbase Commerce</AlertTitle>
                  <AlertDescription>Vérifiez votre clé API et votre configuration Coinbase Commerce.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Supabase API
                <Badge variant={status.supabase ? "success" : "destructive"}>
                  {status.supabase ? "Opérationnel" : "Problème détecté"}
                </Badge>
              </CardTitle>
              <CardDescription>État de la connexion à la base de données Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              {status.supabase ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>La connexion à Supabase est correctement configurée et opérationnelle.</span>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur de connexion à Supabase</AlertTitle>
                  <AlertDescription>
                    Vérifiez vos variables d'environnement et votre configuration Supabase.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {status.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Erreurs détectées
                </CardTitle>
                <CardDescription>Liste des erreurs rencontrées lors de la vérification des API</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {status.errors.map((error: string, index: number) => (
                    <li key={index} className="text-destructive">
                      {error}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Impossible de vérifier l'état des API</AlertTitle>
          <AlertDescription>Une erreur s'est produite lors de la vérification de l'état des API.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

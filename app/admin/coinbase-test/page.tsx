"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function CoinbaseTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")

  const testCoinbaseConnection = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // Tester la connexion à l'API Coinbase Commerce
      const response = await fetch("/api/admin/test-coinbase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey || undefined, // Utiliser la clé fournie ou celle configurée sur le serveur
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`)
      }

      setResult(data)
    } catch (error: any) {
      console.error("Erreur lors du test Coinbase:", error)
      setError(error.message || "Une erreur est survenue lors du test")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Test de l'intégration Coinbase Commerce</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Vérifier la configuration</CardTitle>
          <CardDescription>
            Testez la connexion à l'API Coinbase Commerce pour vérifier que votre configuration est correcte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Clé API Coinbase Commerce (optionnel)</Label>
            <Input
              id="api-key"
              placeholder="Laissez vide pour utiliser la clé configurée sur le serveur"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Si vous laissez ce champ vide, le test utilisera la clé API configurée dans les variables d'environnement
            </p>
          </div>

          <Button onClick={testCoinbaseConnection} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              "Tester la connexion"
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur de connexion</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className="bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Connexion réussie</AlertTitle>
              <AlertDescription>
                La connexion à l'API Coinbase Commerce a été établie avec succès.
                {result.apiKeyConfigured && (
                  <p className="mt-2">
                    <strong>Statut:</strong> Clé API correctement configurée
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résolution des problèmes</CardTitle>
          <CardDescription>
            Si vous rencontrez des problèmes avec l'intégration Coinbase Commerce, voici quelques solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">1. Vérifiez votre clé API</h3>
              <p className="text-sm text-muted-foreground">
                Assurez-vous que votre clé API Coinbase Commerce est correctement configurée dans les variables
                d'environnement (COINBASE_COMMERCE_API_KEY).
              </p>
            </div>

            <div>
              <h3 className="font-medium">2. Vérifiez les restrictions d'API</h3>
              <p className="text-sm text-muted-foreground">
                Assurez-vous que votre clé API a les autorisations nécessaires et qu'il n'y a pas de restrictions IP.
              </p>
            </div>

            <div>
              <h3 className="font-medium">3. Vérifiez la configuration du webhook</h3>
              <p className="text-sm text-muted-foreground">
                Si les paiements sont créés mais jamais confirmés, vérifiez la configuration de votre webhook Coinbase
                Commerce.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

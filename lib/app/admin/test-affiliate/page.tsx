"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function TestAffiliatePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState("")
  const [purchaseId, setPurchaseId] = useState("")
  const [amount, setAmount] = useState("100")
  const [result, setResult] = useState<any>(null)
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleRunDiagnostic = async () => {
    setIsLoading(true)
    setError(null)
    setDiagnosticResult(null)

    try {
      const response = await fetch(`/api/admin/diagnose-affiliate-system`)

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setDiagnosticResult(data.data)
        toast({
          title: "Diagnostic terminé",
          description: "Le diagnostic du système d'affiliation a été effectué avec succès",
        })
      } else {
        throw new Error(data.error || "Erreur lors du diagnostic")
      }
    } catch (error: any) {
      console.error("Erreur lors du diagnostic:", error)
      setError(error.message || "Une erreur est survenue")
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestCommission = async () => {
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un ID utilisateur",
        variant: "destructive",
      })
      return
    }

    if (!purchaseId) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un ID d'achat",
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/admin/test-affiliate-commission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          purchaseId,
          amount: Number(amount),
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        toast({
          title: "Test réussi",
          description: "Le test de commission a été effectué avec succès",
        })
      } else {
        throw new Error(data.error || "Erreur lors du test")
      }
    } catch (error: any) {
      console.error("Erreur lors du test:", error)
      setError(error.message || "Une erreur est survenue")
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Test du Système d'Affiliation</h1>

      <Tabs defaultValue="diagnostic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
          <TabsTrigger value="test">Test de Commission</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostic">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic du Système d'Affiliation</CardTitle>
              <CardDescription>
                Exécutez un diagnostic complet du système d'affiliation pour identifier les problèmes potentiels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleRunDiagnostic} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Diagnostic en cours...
                  </>
                ) : (
                  "Exécuter le diagnostic"
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {diagnosticResult && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Diagnostic terminé</AlertTitle>
                    <AlertDescription>
                      Le diagnostic du système d'affiliation a été effectué avec succès.
                    </AlertDescription>
                  </Alert>

                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Structure de la table users</h3>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(diagnosticResult.userStructure, null, 2)}
                    </pre>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Utilisateurs parrainés (échantillon)</h3>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(diagnosticResult.referredUsers, null, 2)}
                    </pre>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Codes de parrainage (échantillon)</h3>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(diagnosticResult.referralCodes, null, 2)}
                    </pre>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Achats d'utilisateurs parrainés (échantillon)</h3>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(diagnosticResult.purchasesOfReferredUsers, null, 2)}
                    </pre>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Commissions existantes (échantillon)</h3>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(diagnosticResult.commissions, null, 2)}
                    </pre>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Transactions de solde liées aux commissions (échantillon)</h3>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(diagnosticResult.balanceTransactions, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test de Commission d'Affiliation</CardTitle>
              <CardDescription>
                Testez le traitement des commissions d'affiliation pour un utilisateur et un achat spécifiques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-id">ID Utilisateur</Label>
                <Input
                  id="user-id"
                  placeholder="ID de l'utilisateur qui a fait l'achat"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase-id">ID Achat</Label>
                <Input
                  id="purchase-id"
                  placeholder="ID de l'achat (laissez vide pour en créer un nouveau)"
                  value={purchaseId}
                  onChange={(e) => setPurchaseId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Vous pouvez laisser ce champ vide pour générer un nouvel ID d'achat
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Montant de l'achat"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <Button onClick={handleTestCommission} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  "Tester la commission"
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Test réussi</AlertTitle>
                    <AlertDescription>Le test de commission a été effectué avec succès.</AlertDescription>
                  </Alert>

                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Résultat du test</h3>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

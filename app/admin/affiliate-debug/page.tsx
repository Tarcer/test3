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

export default function AffiliateDebugPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCheckUser = async () => {
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un ID utilisateur",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/admin/check-affiliate-user?userId=${userId}`)

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        toast({
          title: "Succès",
          description: "Informations d'affiliation récupérées avec succès",
        })
      } else {
        throw new Error(data.error || "Erreur lors de la récupération des informations d'affiliation")
      }
    } catch (error: any) {
      console.error("Erreur lors de la vérification de l'utilisateur:", error)
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

  const handleCheckReferralCode = async () => {
    if (!referralCode) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code de parrainage",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/admin/check-referral-code?code=${referralCode}`)

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        toast({
          title: "Succès",
          description: "Informations du code de parrainage récupérées avec succès",
        })
      } else {
        throw new Error(data.error || "Erreur lors de la récupération des informations du code de parrainage")
      }
    } catch (error: any) {
      console.error("Erreur lors de la vérification du code de parrainage:", error)
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

  const handleFixCommissions = async () => {
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un ID utilisateur",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/admin/fix-commissions?userId=${userId}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        toast({
          title: "Succès",
          description: "Commissions corrigées avec succès",
        })
      } else {
        throw new Error(data.error || "Erreur lors de la correction des commissions")
      }
    } catch (error: any) {
      console.error("Erreur lors de la correction des commissions:", error)
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
      <h1 className="text-3xl font-bold mb-6">Débogage du Système d'Affiliation</h1>

      <Tabs defaultValue="user" className="space-y-6">
        <TabsList>
          <TabsTrigger value="user">Vérifier Utilisateur</TabsTrigger>
          <TabsTrigger value="referral">Vérifier Code de Parrainage</TabsTrigger>
          <TabsTrigger value="fix">Corriger Commissions</TabsTrigger>
        </TabsList>

        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>Vérifier les Informations d'Affiliation d'un Utilisateur</CardTitle>
              <CardDescription>
                Vérifiez les informations d'affiliation d'un utilisateur, y compris son parrain et ses filleuls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-id">ID Utilisateur</Label>
                <div className="flex gap-2">
                  <Input
                    id="user-id"
                    placeholder="Entrez l'ID de l'utilisateur"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                  <Button onClick={handleCheckUser} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vérifier"}
                  </Button>
                </div>
              </div>

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
                    <AlertTitle>Informations d'affiliation</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2 space-y-2">
                        <p>
                          <strong>Nom:</strong> {result.name}
                        </p>
                        <p>
                          <strong>Email:</strong> {result.email}
                        </p>
                        <p>
                          <strong>Code de parrainage:</strong> {result.referralCode}
                        </p>
                        <p>
                          <strong>Parrainé par:</strong> {result.referredBy || "Aucun"}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {result.referrals && (
                    <div className="rounded-md border p-4">
                      <h3 className="font-medium mb-2">Filleuls</h3>
                      <div className="space-y-2">
                        <p>
                          <strong>Niveau 1:</strong> {result.referrals.level1Count} filleuls
                        </p>
                        <p>
                          <strong>Niveau 2:</strong> {result.referrals.level2Count} filleuls
                        </p>
                        <p>
                          <strong>Niveau 3:</strong> {result.referrals.level3Count} filleuls
                        </p>
                      </div>
                    </div>
                  )}

                  {result.commissions && (
                    <div className="rounded-md border p-4">
                      <h3 className="font-medium mb-2">Commissions</h3>
                      <div className="space-y-2">
                        <p>
                          <strong>Niveau 1 (1%):</strong> {result.commissions.level1.toFixed(2)} €
                        </p>
                        <p>
                          <strong>Niveau 2 (0.5%):</strong> {result.commissions.level2.toFixed(2)} €
                        </p>
                        <p>
                          <strong>Niveau 3 (0.25%):</strong> {result.commissions.level3.toFixed(2)} €
                        </p>
                        <p>
                          <strong>Total:</strong> {result.commissions.total.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referral">
          <Card>
            <CardHeader>
              <CardTitle>Vérifier un Code de Parrainage</CardTitle>
              <CardDescription>Vérifiez à quel utilisateur appartient un code de parrainage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referral-code">Code de Parrainage</Label>
                <div className="flex gap-2">
                  <Input
                    id="referral-code"
                    placeholder="Entrez le code de parrainage"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                  />
                  <Button onClick={handleCheckReferralCode} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vérifier"}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Informations du code de parrainage</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <p>
                        <strong>Appartient à:</strong> {result.name} ({result.email})
                      </p>
                      <p>
                        <strong>ID Utilisateur:</strong> {result.id}
                      </p>
                      <p>
                        <strong>Nombre de filleuls:</strong> {result.referralCount}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fix">
          <Card>
            <CardHeader>
              <CardTitle>Corriger les Commissions</CardTitle>
              <CardDescription>
                Recalculez et corrigez les commissions d'affiliation pour un utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription>
                  Cette opération va recalculer et potentiellement créer de nouvelles commissions d'affiliation pour
                  l'utilisateur spécifié. Utilisez cette fonction uniquement si vous êtes sûr qu'il y a un problème avec
                  les commissions existantes.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="user-id-fix">ID Utilisateur</Label>
                <div className="flex gap-2">
                  <Input
                    id="user-id-fix"
                    placeholder="Entrez l'ID de l'utilisateur"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                  <Button onClick={handleFixCommissions} disabled={isLoading} variant="destructive">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Corriger les Commissions"}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Commissions corrigées</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <p>
                        <strong>Commissions créées:</strong> {result.created}
                      </p>
                      <p>
                        <strong>Commissions mises à jour:</strong> {result.updated}
                      </p>
                      <p>
                        <strong>Transactions créées:</strong> {result.transactions}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

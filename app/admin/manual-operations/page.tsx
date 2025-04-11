"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createManualDeposit, confirmDeposit } from "@/lib/services/deposit-service"
import { getUserByEmail } from "@/lib/services/user-service"
import { getUserBalance } from "@/lib/services/earnings-service"
import { Loader2, CheckCircle, RefreshCw } from "lucide-react"

export default function ManualOperationsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [userId, setUserId] = useState("")
  const [userName, setUserName] = useState("")
  const [depositId, setDepositId] = useState("")
  const [depositCreated, setDepositCreated] = useState(false)
  const [userBalance, setUserBalance] = useState<number | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const { toast } = useToast()

  const handleFindUser = async () => {
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await getUserByEmail(email)
      if (result.success && result.data) {
        setUserId(result.data.id)
        setUserName(result.data.name || "Utilisateur")
        toast({
          title: "Utilisateur trouvé",
          description: `${result.data.name || "Utilisateur"} (${result.data.email})`,
        })

        // Charger le solde de l'utilisateur
        await fetchUserBalance(result.data.id)
      } else {
        toast({
          title: "Utilisateur non trouvé",
          description: "Aucun utilisateur trouvé avec cette adresse email",
          variant: "destructive",
        })
        setUserId("")
        setUserName("")
        setUserBalance(null)
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de l'utilisateur:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche de l'utilisateur",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserBalance = async (id: string) => {
    setIsLoadingBalance(true)
    try {
      const result = await getUserBalance(id)
      if (result.success && result.data) {
        setUserBalance(result.data.available)
      } else {
        setUserBalance(null)
        toast({
          title: "Erreur",
          description: "Impossible de récupérer le solde de l'utilisateur",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du solde:", error)
      setUserBalance(null)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const handleCreateDeposit = async () => {
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord rechercher un utilisateur",
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
    try {
      const result = await createManualDeposit({
        userId,
        amount: Number(amount),
        description: "Dépôt manuel pour test",
      })

      if (result.success && result.data) {
        setDepositId(result.data.id)
        setDepositCreated(true)
        toast({
          title: "Dépôt créé",
          description: `Dépôt de ${amount} € créé avec succès pour ${userName}`,
        })
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de la création du dépôt",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la création du dépôt:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du dépôt",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDeposit = async () => {
    if (!depositId) {
      toast({
        title: "Erreur",
        description: "Aucun dépôt à confirmer",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await confirmDeposit(depositId)
      if (result.success) {
        toast({
          title: "Dépôt confirmé",
          description: `Le dépôt de ${amount} € a été confirmé avec succès`,
        })

        // Rafraîchir le solde après confirmation
        if (userId) {
          await fetchUserBalance(userId)
        }
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de la confirmation du dépôt",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation du dépôt:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la confirmation du dépôt",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshBalance = async () => {
    if (userId) {
      await fetchUserBalance(userId)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Opérations manuelles</h1>
        <p className="mt-2 text-muted-foreground">Gérez manuellement les dépôts pour les tests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créer un dépôt manuel</CardTitle>
          <CardDescription>Créez un dépôt manuel pour tester les fonctionnalités</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email de l'utilisateur</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  placeholder="utilisateur@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                <Button onClick={handleFindUser} disabled={isLoading || !email}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rechercher"}
                </Button>
              </div>
            </div>

            {userId && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Utilisateur trouvé</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Nom: {userName}</p>
                      <p>ID: {userId}</p>
                      <div className="flex items-center mt-1">
                        <p>Solde actuel: {userBalance !== null ? `${userBalance.toFixed(2)} €` : "Chargement..."}</p>
                        {userId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-6 w-6 p-0"
                            onClick={refreshBalance}
                            disabled={isLoadingBalance}
                          >
                            <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? "animate-spin" : ""}`} />
                            <span className="sr-only">Rafraîchir le solde</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {userId && (
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            {userId && (
              <Button onClick={handleCreateDeposit} disabled={isLoading || !userId || !amount} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer le dépôt"
                )}
              </Button>
            )}

            {depositCreated && (
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Dépôt créé avec succès</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>ID du dépôt: {depositId}</p>
                      <p>Montant: {amount} €</p>
                      <p>Statut: En attente</p>
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={handleConfirmDeposit}
                        disabled={isLoading}
                        variant="outline"
                        className="bg-white text-blue-600 hover:bg-blue-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirmation en cours...
                          </>
                        ) : (
                          "Confirmer le dépôt"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

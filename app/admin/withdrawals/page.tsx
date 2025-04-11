"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getWithdrawalStats,
} from "@/lib/services/withdrawal-service"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const { toast } = useToast()

  const fetchWithdrawals = async () => {
    setIsLoading(true)
    try {
      const result = await getPendingWithdrawals()
      if (result.success) {
        setWithdrawals(result.data)
      }

      const statsResult = await getWithdrawalStats()
      if (statsResult.success) {
        setStats(statsResult.data)
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      const result = await approveWithdrawal(id)
      if (result.success) {
        toast({
          title: "Retrait approuvé",
          description: "Le retrait a été approuvé avec succès.",
        })
        fetchWithdrawals()
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de l'approbation du retrait",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving withdrawal:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'approbation du retrait",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      const result = await rejectWithdrawal(id)
      if (result.success) {
        toast({
          title: "Retrait rejeté",
          description: "Le retrait a été rejeté avec succès.",
        })
        fetchWithdrawals()
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors du rejet du retrait",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting withdrawal:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rejet du retrait",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des retraits</h1>
        <p className="mt-2 text-muted-foreground">Validez manuellement les demandes de retrait des utilisateurs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions de validation</CardTitle>
          <CardDescription>Comment valider les demandes de retrait</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Vérification des informations</h3>
                <p className="text-sm text-muted-foreground">
                  Vérifiez que l'adresse de portefeuille fournie par l'utilisateur est valide et que le montant
                  correspond à ce qui est disponible pour l'utilisateur.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Approbation</h3>
                <p className="text-sm text-muted-foreground">
                  Une fois les informations vérifiées, approuvez le retrait pour débiter le compte de l'utilisateur.
                  Vous devrez ensuite effectuer le transfert manuellement vers l'adresse de portefeuille de
                  l'utilisateur.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Rejet</h3>
                <p className="text-sm text-muted-foreground">
                  Si les informations sont invalides ou si le retrait ne peut pas être traité pour une autre raison,
                  rejetez la demande. Aucun montant ne sera débité du compte de l'utilisateur.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Retraits en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCount}</div>
              <p className="text-xs text-muted-foreground">Montant total: {formatCurrency(stats.totalPending)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Retraits approuvés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCount}</div>
              <p className="text-xs text-muted-foreground">Montant total: {formatCurrency(stats.totalCompleted)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Frais perçus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalFees)}</div>
              <p className="text-xs text-muted-foreground">Total des frais de retrait (10%)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Montant net versé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalNetAmount)}</div>
              <p className="text-xs text-muted-foreground">Total des montants nets versés</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="pending" onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending">En attente ({stats?.pendingCount || 0})</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Retraits en attente</CardTitle>
              <CardDescription>Approuvez ou rejetez les demandes de retrait</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Chargement...</p>
              ) : withdrawals.length === 0 ? (
                <p>Aucun retrait en attente.</p>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-7 gap-4 p-4 font-medium">
                    <div>Date</div>
                    <div>Utilisateur</div>
                    <div>Montant</div>
                    <div>Frais (10%)</div>
                    <div>Montant net</div>
                    <div>Adresse</div>
                    <div>Actions</div>
                  </div>
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="grid grid-cols-7 gap-4 border-t p-4">
                      <div className="flex items-center">{formatDate(withdrawal.created_at)}</div>
                      <div>
                        <div className="font-medium">{withdrawal.users?.name}</div>
                        <div className="text-sm text-muted-foreground">{withdrawal.users?.email}</div>
                      </div>
                      <div className="flex items-center font-medium">{formatCurrency(withdrawal.amount)}</div>
                      <div className="flex items-center">{formatCurrency(withdrawal.fee)}</div>
                      <div className="flex items-center font-medium">{formatCurrency(withdrawal.net_amount)}</div>
                      <div className="flex items-center">
                        <span className="truncate text-xs">{withdrawal.wallet_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                          onClick={() => handleApprove(withdrawal.id)}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approuver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleReject(withdrawal.id)}
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des retraits</CardTitle>
              <CardDescription>Consultez l'historique des retraits traités</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Fonctionnalité à implémenter: historique des retraits approuvés et rejetés</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

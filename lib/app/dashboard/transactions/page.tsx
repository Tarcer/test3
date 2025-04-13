"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { getUserTransactions, type Transaction } from "@/lib/services/transaction-service"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/supabase/auth"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user } = useAuth()

  const fetchTransactions = useCallback(
    async (showLoading = true) => {
      if (!user) return

      if (showLoading) setIsLoading(true)
      else setIsRefreshing(true)

      try {
        const result = await getUserTransactions(user.id)
        if (result.success && result.data) {
          setTransactions(result.data)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des transactions:", error)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [user],
  )

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleRefresh = () => {
    fetchTransactions(false)
  }

  // Filtrer les transactions par type
  const deposits = transactions.filter((tx) => tx.type === "deposit")
  const purchases = transactions.filter((tx) => tx.type === "purchase")
  const other = transactions.filter((tx) => tx.type !== "deposit" && tx.type !== "purchase")

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    if (status === "completed" || status === "confirmed") {
      return <Badge variant="default">Complété</Badge>
    } else if (status === "pending") {
      return <Badge variant="outline">En attente</Badge>
    } else if (status === "rejected" || status === "failed") {
      return <Badge variant="destructive">Rejeté</Badge>
    }

    return <Badge variant="secondary">{status}</Badge>
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Historique des transactions</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="deposits">Dépôts</TabsTrigger>
          <TabsTrigger value="purchases">Achats</TabsTrigger>
          <TabsTrigger value="other">Autres</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TransactionList transactions={transactions} isLoading={isLoading} getStatusBadge={getStatusBadge} />
        </TabsContent>

        <TabsContent value="deposits">
          <TransactionList
            transactions={deposits}
            isLoading={isLoading}
            getStatusBadge={getStatusBadge}
            emptyMessage="Aucun dépôt trouvé."
          />
        </TabsContent>

        <TabsContent value="purchases">
          <TransactionList
            transactions={purchases}
            isLoading={isLoading}
            getStatusBadge={getStatusBadge}
            emptyMessage="Aucun achat trouvé."
          />
        </TabsContent>

        <TabsContent value="other">
          <TransactionList
            transactions={other}
            isLoading={isLoading}
            getStatusBadge={getStatusBadge}
            emptyMessage="Aucune autre transaction trouvée."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TransactionListProps {
  transactions: Transaction[]
  isLoading: boolean
  getStatusBadge: (status?: string) => React.ReactNode
  emptyMessage?: string
}

function TransactionList({
  transactions,
  isLoading,
  getStatusBadge,
  emptyMessage = "Aucune transaction trouvée.",
}: TransactionListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="py-6">
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="font-medium">{transaction.description}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(transaction.created_at)}
                  {transaction.transaction_id && (
                    <span className="ml-2 text-xs">(Réf: {transaction.transaction_id.substring(0, 8)}...)</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${Number(transaction.amount) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {transaction.type === "purchase" ? "-" : ""}
                  {formatCurrency(transaction.amount)}
                </div>
                <div>{getStatusBadge(transaction.status)}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

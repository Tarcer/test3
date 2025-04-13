"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/supabase/auth"
import { getUserDeposits } from "@/lib/services/deposit-service"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function DepositHistory() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchDeposits = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const result = await getUserDeposits(user.id)
        if (result.success) {
          setDeposits(result.data)
        }
      } catch (error) {
        console.error("Error fetching deposits:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeposits()
  }, [user])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des dépôts</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (deposits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des dépôts</CardTitle>
          <CardDescription>Vous n'avez pas encore effectué de dépôt.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des dépôts</CardTitle>
        <CardDescription>Consultez l'historique de vos dépôts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="grid grid-cols-4 gap-4 p-4 font-medium">
            <div>Date</div>
            <div>Montant</div>
            <div>Statut</div>
            <div>Transaction</div>
          </div>
          {deposits.map((deposit) => (
            <div key={deposit.id} className="grid grid-cols-4 gap-4 border-t p-4">
              <div className="flex items-center">{formatDate(deposit.created_at)}</div>
              <div className="flex items-center">{formatCurrency(deposit.amount)}</div>
              <div className="flex items-center">
                <Badge
                  variant={
                    deposit.status === "confirmed"
                      ? "default"
                      : deposit.status === "pending"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {deposit.status === "confirmed" ? "Confirmé" : deposit.status === "pending" ? "En attente" : "Rejeté"}
                </Badge>
              </div>
              <div className="flex items-center">
                {deposit.transaction_hash ? (
                  <span className="truncate text-xs">{deposit.transaction_hash}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Non spécifié</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/supabase/auth"
import { getUserWithdrawals } from "@/lib/services/withdrawal-service"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function WithdrawalHistory() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchWithdrawals = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const result = await getUserWithdrawals(user.id)
        if (result.success) {
          setWithdrawals(result.data)
        }
      } catch (error) {
        console.error("Error fetching withdrawals:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWithdrawals()
  }, [user])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des retraits</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (withdrawals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des retraits</CardTitle>
          <CardDescription>Vous n'avez pas encore effectué de retrait.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des retraits</CardTitle>
        <CardDescription>Consultez l'historique de vos retraits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="grid grid-cols-6 gap-4 p-4 font-medium">
            <div>Date</div>
            <div>Montant</div>
            <div>Frais</div>
            <div>Montant net</div>
            <div>Statut</div>
            <div>Adresse</div>
          </div>
          {withdrawals.map((withdrawal) => (
            <div key={withdrawal.id} className="grid grid-cols-6 gap-4 border-t p-4">
              <div className="flex items-center">{formatDate(withdrawal.created_at)}</div>
              <div className="flex items-center">{formatCurrency(withdrawal.amount)}</div>
              <div className="flex items-center">{formatCurrency(withdrawal.fee)}</div>
              <div className="flex items-center">{formatCurrency(withdrawal.net_amount)}</div>
              <div className="flex items-center">
                <Badge
                  variant={
                    withdrawal.status === "completed"
                      ? "default"
                      : withdrawal.status === "pending"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {withdrawal.status === "completed"
                    ? "Approuvé"
                    : withdrawal.status === "pending"
                      ? "En attente"
                      : "Rejeté"}
                </Badge>
              </div>
              <div className="flex items-center">
                <span className="truncate text-xs">{withdrawal.wallet_address}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

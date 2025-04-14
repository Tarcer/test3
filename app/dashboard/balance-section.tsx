"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useUser } from "@auth0/nextjs-auth0/client"
import { useBalance } from "@/hooks/useBalance"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface BalanceSectionProps {
  currency: string
}

const BalanceSection: React.FC<BalanceSectionProps> = ({ currency }) => {
  const { user } = useUser()
  const { balance, fetchBalance, isLoading } = useBalance()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Modifier la section de solde pour ajouter un rafraîchissement plus fréquent

  // Remplacer l'intervalle de 30 secondes par 15 secondes
  useEffect(() => {
    fetchBalance()

    // Rafraîchir le solde toutes les 15 secondes
    const intervalId = setInterval(() => fetchBalance(true), 15000)

    return () => clearInterval(intervalId)
  }, [fetchBalance])

  // Ajouter un écouteur d'événement pour les mises à jour de transactions
  useEffect(() => {
    const handleTransactionUpdate = (event: CustomEvent) => {
      if (user && event.detail.userId === user.id) {
        console.log("Transaction update detected in BalanceSection, refreshing balance")
        fetchBalance(true)
      }
    }

    // Ajouter l'écouteur d'événement
    window.addEventListener("transaction-update", handleTransactionUpdate as EventListener)

    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener("transaction-update", handleTransactionUpdate as EventListener)
    }
  }, [fetchBalance, user])

  if (!isMounted) {
    return null
  }

  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-x-2">
          <p className="text-sm font-medium">Balance</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground inline-block cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent className="w-80">
                <p>This is your current account balance. It reflects all transactions made to date.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <h2 className="text-3xl font-bold">
          {isLoading ? <Skeleton className="h-8 w-[100px]" /> : `${currency} ${balance}`}
        </h2>
      </CardContent>
    </Card>
  )
}

export default BalanceSection

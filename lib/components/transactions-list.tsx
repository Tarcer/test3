"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, XCircle } from "lucide-react"

interface Transaction {
  id: string
  date: string
  user: {
    id: string
    name: string
    email: string
  }
  type: "purchase" | "earning" | "withdrawal" | "commission"
  amount: number
  status: "completed" | "pending" | "rejected"
  description: string
}

interface TransactionsListProps {
  type: "all" | "purchases" | "earnings" | "withdrawals" | "commissions"
}

export default function TransactionsList({ type }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx-1",
      date: "10/04/2025 14:32",
      user: {
        id: "user-1",
        name: "Jean Dupont",
        email: "jean.d@example.com",
      },
      type: "purchase",
      amount: 499,
      status: "completed",
      description: "Achat: E-Boutique Pro",
    },
    {
      id: "tx-2",
      date: "09/04/2025 10:15",
      user: {
        id: "user-2",
        name: "Marie Martin",
        email: "marie.m@example.com",
      },
      type: "purchase",
      amount: 299,
      status: "completed",
      description: "Achat: BlogMaster",
    },
    {
      id: "tx-3",
      date: "08/04/2025 16:45",
      user: {
        id: "user-1",
        name: "Jean Dupont",
        email: "jean.d@example.com",
      },
      type: "earning",
      amount: 11.09,
      status: "completed",
      description: "Revenu quotidien: E-Boutique Pro",
    },
    {
      id: "tx-4",
      date: "07/04/2025 09:30",
      user: {
        id: "user-3",
        name: "Sophie Petit",
        email: "sophie.p@example.com",
      },
      type: "withdrawal",
      amount: 200,
      status: "pending",
      description: "Demande de retrait",
    },
    {
      id: "tx-5",
      date: "06/04/2025 11:20",
      user: {
        id: "user-4",
        name: "Thomas Bernard",
        email: "thomas.b@example.com",
      },
      type: "commission",
      amount: 4.99,
      status: "completed",
      description: "Commission d'affiliation (Niveau 1)",
    },
    {
      id: "tx-6",
      date: "05/04/2025 15:10",
      user: {
        id: "user-2",
        name: "Marie Martin",
        email: "marie.m@example.com",
      },
      type: "withdrawal",
      amount: 150,
      status: "completed",
      description: "Retrait traité",
    },
    {
      id: "tx-7",
      date: "04/04/2025 13:45",
      user: {
        id: "user-5",
        name: "Lucas Moreau",
        email: "lucas.m@example.com",
      },
      type: "commission",
      amount: 2.5,
      status: "completed",
      description: "Commission d'affiliation (Niveau 2)",
    },
  ])

  const filteredTransactions =
    type === "all" ? transactions : transactions.filter((tx) => tx.type === type.slice(0, -1)) // Remove 's' from type

  const handleApprove = (id: string) => {
    setTransactions(transactions.map((tx) => (tx.id === id ? { ...tx, status: "completed" } : tx)))
  }

  const handleReject = (id: string) => {
    setTransactions(transactions.map((tx) => (tx.id === id ? { ...tx, status: "rejected" } : tx)))
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md">
          <div className="grid grid-cols-7 gap-4 p-4 font-medium">
            <div>ID</div>
            <div>Date</div>
            <div>Utilisateur</div>
            <div>Type</div>
            <div>Montant</div>
            <div>Statut</div>
            <div>Actions</div>
          </div>
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="grid grid-cols-7 gap-4 border-t p-4">
              <div className="flex items-center text-sm">{transaction.id}</div>
              <div className="flex items-center text-sm">{transaction.date}</div>
              <div>
                <div className="font-medium">{transaction.user.name}</div>
                <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
              </div>
              <div className="flex items-center">
                <Badge variant="outline">
                  {transaction.type === "purchase"
                    ? "Achat"
                    : transaction.type === "earning"
                      ? "Revenu"
                      : transaction.type === "withdrawal"
                        ? "Retrait"
                        : "Commission"}
                </Badge>
              </div>
              <div className="flex items-center font-medium">{transaction.amount.toFixed(2)} €</div>
              <div className="flex items-center">
                <Badge
                  variant={
                    transaction.status === "completed"
                      ? "default"
                      : transaction.status === "pending"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {transaction.status === "completed"
                    ? "Complété"
                    : transaction.status === "pending"
                      ? "En attente"
                      : "Rejeté"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="mr-1 h-3 w-3" />
                  Détails
                </Button>
                {transaction.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600"
                      onClick={() => handleApprove(transaction.id)}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Approuver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleReject(transaction.id)}
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Rejeter
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

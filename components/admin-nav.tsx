"use client"

import { buttonVariants } from "@/components/ui/button"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Calendar,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Settings,
  Wallet,
  Wrench,
  RefreshCw,
  LineChart,
  AlertCircle,
  Users,
} from "lucide-react"

interface AdminNavProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed?: boolean
}

export default function AdminNav({ className, isCollapsed = false, ...props }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("grid items-start gap-2", className)} {...props}>
      <Link
        href="/admin"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <LayoutDashboard className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>Tableau de bord</span>}
      </Link>
      <Link
        href="/admin/transactions"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin/transactions" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <CreditCard className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>Transactions</span>}
      </Link>
      <Link
        href="/admin/deposits"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin/deposits" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <Wallet className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>Dépôts</span>}
      </Link>
      <Link
        href="/admin/withdrawals"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin/withdrawals" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <CreditCard className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>Retraits</span>}
      </Link>
      <Link
        href="/admin/payments"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin/payments" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <DollarSign className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>Paiements</span>}
      </Link>
      <Link
        href="/admin/earnings-generator"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin/earnings-generator" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <LineChart className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>Générateur de Revenus</span>}
      </Link>
      <Link
        href="/admin/withdrawal-days"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin/withdrawal-days" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <Calendar className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>Jours de retrait</span>}
      </Link>
      <Link
        href="/admin/sync-transactions"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin/sync-transactions" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <RefreshCw className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>Synchroniser transactions</span>}
      </Link>
      <Link
        href="/admin/affiliate-debug"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin/affiliate-debug" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <Users className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>Débogage Affiliation</span>}
      </Link>
      <Link
        href="/admin/payment-settings"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin/payment-settings" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <Settings className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>Paramètres de paiement</span>}
      </Link>
      <Link
        href="/admin/crypto-settings"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin/crypto-settings" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <Settings className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>Paramètres crypto</span>}
      </Link>
      <Link
        href="/admin/api-status"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin/api-status" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <AlertCircle className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>État des API</span>}
      </Link>
      <Link
        href="/admin/manual-operations"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/admin/manual-operations" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          "justify-start",
        )}
      >
        <Wrench className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
        {!isCollapsed && <span>Opérations manuelles</span>}
      </Link>
    </nav>
  )
}

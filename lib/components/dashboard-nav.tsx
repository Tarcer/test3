"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingBag, LineChart, Users, CreditCard, Settings, Wallet } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export default function DashboardNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "Vue d'ensemble",
      href: "/dashboard",
      icon: <ShoppingBag className="mr-2 h-4 w-4" />,
    },
    {
      title: "Mes revenus",
      href: "/dashboard/earnings",
      icon: <LineChart className="mr-2 h-4 w-4" />,
    },
    {
      title: "Dépôts",
      href: "/dashboard/deposits",
      icon: <Wallet className="mr-2 h-4 w-4" />,
    },
    {
      title: "Programme d'affiliation",
      href: "/dashboard/affiliate",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Retraits",
      href: "/dashboard/withdrawals",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      title: "Paramètres",
      href: "/dashboard/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <ScrollArea className="h-full py-6">
      <div className="flex flex-col gap-2">
        <h2 className="px-4 text-lg font-semibold tracking-tight">Tableau de bord</h2>
        <div className="flex flex-col gap-1 pt-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("justify-start", pathname === item.href && "bg-muted font-medium")}
              asChild
            >
              <Link href={item.href}>
                {item.icon}
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}

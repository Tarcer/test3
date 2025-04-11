import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import RegisterForm from "@/components/register-form"

export const metadata: Metadata = {
  title: "Inscription | WebMarket Pro",
  description: "Créez un nouveau compte sur WebMarket Pro",
}

export default function RegisterPage() {
  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center py-8">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>Entrez vos informations pour créer un nouveau compte</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Chargement...</div>}>
            <RegisterForm />
          </Suspense>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm text-muted-foreground">
            Vous avez déjà un compte?{" "}
            <Link href="/account/login" className="text-primary underline">
              Se connecter
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

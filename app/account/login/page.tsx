import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "@/components/login-form"

export const metadata: Metadata = {
  title: "Connexion | WebMarket Pro",
  description: "Connectez-vous à votre compte WebMarket Pro",
}

export default function LoginPage() {
  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center py-8">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>Entrez votre email et mot de passe pour accéder à votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm text-muted-foreground">
            Vous n&apos;avez pas de compte?{" "}
            <Link href="/account/register" className="text-primary underline">
              S&apos;inscrire
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

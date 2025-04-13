"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { InfoIcon as InfoCircle, Copy } from "lucide-react"

interface WebhookSetupPageProps {
  session: any
}

export default function WebhookSetupClientPage({ session }: WebhookSetupPageProps) {
  const [webhookSecret, setWebhookSecret] = useState(process.env.COINBASE_COMMERCE_WEBHOOK_SECRET || "")
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const webhookUrl = `${siteUrl}/api/webhook/coinbase`

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Configuration du Webhook Coinbase</h1>

      <div className="grid gap-6">
        <Alert>
          <InfoCircle className="h-4 w-4" />
          <AlertTitle>Instructions</AlertTitle>
          <AlertDescription>
            Pour que les dépôts soient automatiquement confirmés, vous devez configurer un webhook dans votre compte
            Coinbase Commerce. Suivez les instructions ci-dessous pour configurer correctement le webhook.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Étape 1: Connectez-vous à votre compte Coinbase Commerce</CardTitle>
            <CardDescription>
              Accédez à{" "}
              <a
                href="https://commerce.coinbase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                commerce.coinbase.com
              </a>{" "}
              et connectez-vous à votre compte.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Étape 2: Accédez aux paramètres des webhooks</CardTitle>
            <CardDescription>Dans le menu de navigation, cliquez sur "Settings", puis sur "Webhooks".</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Étape 3: Ajoutez un nouveau webhook</CardTitle>
            <CardDescription>Cliquez sur "Add an endpoint" et saisissez l'URL du webhook ci-dessous.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={webhookUrl} readOnly />
              <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(webhookUrl)}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copier</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Étape 4: Vérifiez la clé secrète du webhook</CardTitle>
            <CardDescription>
              Après avoir sauvegardé le webhook, Coinbase Commerce générera une clé secrète. Assurez-vous que cette clé
              correspond à celle configurée dans vos variables d'environnement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Clé secrète configurée:</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={
                      webhookSecret
                        ? webhookSecret.substring(0, 4) + "..." + webhookSecret.substring(webhookSecret.length - 4)
                        : "Non configurée"
                    }
                    readOnly
                  />
                </div>
              </div>

              <Alert variant={webhookSecret ? "default" : "destructive"}>
                {webhookSecret ? (
                  <AlertDescription>
                    La clé secrète est configurée dans vos variables d'environnement. Assurez-vous qu'elle correspond à
                    celle générée par Coinbase Commerce.
                  </AlertDescription>
                ) : (
                  <AlertDescription>
                    La clé secrète n'est pas configurée dans vos variables d'environnement. Veuillez ajouter la variable
                    COINBASE_COMMERCE_WEBHOOK_SECRET.
                  </AlertDescription>
                )}
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Étape 5: Activez les événements</CardTitle>
            <CardDescription>
              Dans Coinbase Commerce, assurez-vous que l'événement "charge:confirmed" est activé pour votre webhook.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

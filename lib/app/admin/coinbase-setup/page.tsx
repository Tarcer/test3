"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CoinbaseSetupPage() {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const webhookUrl = `${siteUrl}/api/webhook/coinbase`

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "Copié!",
      description: "L'URL a été copiée dans le presse-papiers",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Configuration de Coinbase Commerce</h1>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup">Configuration initiale</TabsTrigger>
          <TabsTrigger value="webhook">Configuration du Webhook</TabsTrigger>
          <TabsTrigger value="settings">Paramètres avancés</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Configuration initiale de Coinbase Commerce</CardTitle>
              <CardDescription>
                Suivez ces étapes pour configurer Coinbase Commerce et accepter les paiements par carte bancaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium text-lg">1. Créer un compte Coinbase Commerce</h3>
                <p className="text-sm text-muted-foreground">
                  Si vous n'avez pas encore de compte, rendez-vous sur{" "}
                  <a
                    href="https://commerce.coinbase.com/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center"
                  >
                    commerce.coinbase.com/signup <ExternalLink className="ml-1 h-3 w-3" />
                  </a>{" "}
                  pour créer un compte.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-lg">2. Configurer votre portefeuille</h3>
                <p className="text-sm text-muted-foreground">
                  Dans votre tableau de bord Coinbase Commerce, allez dans "Settings" > "Payment methods" et configurez
                  les cryptomonnaies que vous souhaitez accepter (BTC, ETH, USDT, etc.).
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-lg">3. Obtenir votre clé API</h3>
                <p className="text-sm text-muted-foreground">
                  Allez dans "Settings" > "API keys" et créez une nouvelle clé API. Copiez cette clé et ajoutez-la à vos
                  variables d'environnement sous le nom COINBASE_COMMERCE_API_KEY.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-lg">4. Configurer les variables d'environnement</h3>
                <p className="text-sm text-muted-foreground">
                  Assurez-vous que les variables suivantes sont configurées dans votre fichier .env:
                </p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  COINBASE_COMMERCE_API_KEY=votre_clé_api
                  <br />
                  COINBASE_COMMERCE_WEBHOOK_SECRET=votre_secret_webhook
                  <br />
                  NEXT_PUBLIC_SITE_URL=url_de_votre_site
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Après avoir configuré votre clé API, passez à l'onglet "Configuration du Webhook" pour configurer les
                  notifications de paiement.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Webhook Coinbase Commerce</CardTitle>
              <CardDescription>
                Configurez un webhook pour recevoir des notifications automatiques lorsqu'un paiement est confirmé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium text-lg">1. Accéder aux paramètres de webhook</h3>
                <p className="text-sm text-muted-foreground">
                  Dans votre tableau de bord Coinbase Commerce, allez dans "Settings" > "Webhooks".
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-lg">2. Ajouter un nouvel endpoint</h3>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur "Add an endpoint" et utilisez l'URL suivante:
                </p>
                <div className="flex items-center gap-2">
                  <Input value={webhookUrl} readOnly />
                  <Button variant="outline" size="icon" onClick={() => handleCopy(webhookUrl)}>
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-lg">3. Configurer le secret du webhook</h3>
                <p className="text-sm text-muted-foreground">
                  Après avoir créé le webhook, Coinbase Commerce générera un "Webhook Shared Secret". Copiez ce secret
                  et ajoutez-le à vos variables d'environnement sous le nom COINBASE_COMMERCE_WEBHOOK_SECRET.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-lg">4. Sélectionner les événements</h3>
                <p className="text-sm text-muted-foreground">
                  Assurez-vous que l'événement "charge:confirmed" est activé pour votre webhook.
                </p>
              </div>

              <Alert className="bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Conseil</AlertTitle>
                <AlertDescription>
                  Pour tester votre webhook, vous pouvez utiliser le bouton "Send test webhook" dans l'interface de
                  Coinbase Commerce.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres avancés</CardTitle>
              <CardDescription>
                Configurez des options avancées pour personnaliser l'expérience de paiement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium text-lg">1. Personnalisation de l'expérience de paiement</h3>
                <p className="text-sm text-muted-foreground">
                  Dans votre tableau de bord Coinbase Commerce, allez dans "Settings" > "Checkout appearance" pour
                  personnaliser l'apparence de la page de paiement.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-lg">2. Configuration des devises</h3>
                <p className="text-sm text-muted-foreground">
                  Allez dans "Settings" > "Payment currencies" pour configurer les devises que vous souhaitez accepter
                  et dans lesquelles vous souhaitez être payé.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-lg">3. Conversion automatique</h3>
                <p className="text-sm text-muted-foreground">
                  Si vous souhaitez que les paiements soient automatiquement convertis en une cryptomonnaie spécifique,
                  configurez cette option dans "Settings" > "Payment methods".
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Remarque</AlertTitle>
                <AlertDescription>
                  Coinbase Commerce permet aux clients de payer en monnaie fiduciaire (EUR, USD) via leur carte
                  bancaire, tandis que vous recevez l'équivalent en cryptomonnaie. Des frais de conversion peuvent
                  s'appliquer.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

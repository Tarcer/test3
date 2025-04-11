"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { updatePaymentSettings } from "./actions"

interface PaymentSettingsFormProps {
  initialSettings: {
    coinbaseCommerce: {
      enabled: boolean
      displayName: string
      cryptoCurrency: string
    }
    directCrypto: {
      enabled: boolean
      displayName: string
      walletAddress: string
    }
  }
}

export default function PaymentSettingsForm({ initialSettings }: PaymentSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updatePaymentSettings(settings)

      if (result.success) {
        toast({
          title: "Paramètres mis à jour",
          description: "Les paramètres de paiement ont été mis à jour avec succès",
        })
      } else {
        throw new Error(result.error || "Erreur lors de la mise à jour des paramètres")
      }
    } catch (error: any) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour des paramètres",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="coinbase" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="coinbase">Coinbase Commerce</TabsTrigger>
          <TabsTrigger value="direct">Paiement direct en crypto</TabsTrigger>
        </TabsList>

        <TabsContent value="coinbase" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Coinbase Commerce</CardTitle>
              <CardDescription>
                Configurez les paramètres pour accepter les paiements par carte bancaire via Coinbase Commerce
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="coinbase-enabled"
                  checked={settings.coinbaseCommerce.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      coinbaseCommerce: {
                        ...settings.coinbaseCommerce,
                        enabled: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="coinbase-enabled">Activer les paiements via Coinbase Commerce</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coinbase-display-name">Nom affiché</Label>
                <Input
                  id="coinbase-display-name"
                  value={settings.coinbaseCommerce.displayName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      coinbaseCommerce: {
                        ...settings.coinbaseCommerce,
                        displayName: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coinbase-crypto-currency">Crypto-monnaie de réception</Label>
                <Select
                  value={settings.coinbaseCommerce.cryptoCurrency}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      coinbaseCommerce: {
                        ...settings.coinbaseCommerce,
                        cryptoCurrency: value,
                      },
                    })
                  }
                >
                  <SelectTrigger id="coinbase-crypto-currency">
                    <SelectValue placeholder="Sélectionnez une crypto-monnaie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                    <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  La crypto-monnaie dans laquelle vous souhaitez recevoir les paiements
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="direct" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du paiement direct en crypto</CardTitle>
              <CardDescription>
                Configurez les paramètres pour accepter les paiements directs en crypto-monnaie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="direct-enabled"
                  checked={settings.directCrypto.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      directCrypto: {
                        ...settings.directCrypto,
                        enabled: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="direct-enabled">Activer les paiements directs en crypto</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direct-display-name">Nom affiché</Label>
                <Input
                  id="direct-display-name"
                  value={settings.directCrypto.displayName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      directCrypto: {
                        ...settings.directCrypto,
                        displayName: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet-address">Adresse du portefeuille</Label>
                <Input
                  id="wallet-address"
                  placeholder="Entrez votre adresse de portefeuille crypto"
                  value={settings.directCrypto.walletAddress}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      directCrypto: {
                        ...settings.directCrypto,
                        walletAddress: e.target.value,
                      },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Adresse de portefeuille où les paiements directs en crypto seront envoyés
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer les paramètres"
          )}
        </Button>
      </div>
    </form>
  )
}

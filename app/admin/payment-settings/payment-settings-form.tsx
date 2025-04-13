"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { updatePaymentSettings } from "./actions"

interface PaymentSettingsFormProps {
  initialSettings: {
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
      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="direct">Paiement direct en crypto</TabsTrigger>
        </TabsList>

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

PaymentSettingsForm.defaultProps = {
  initialSettings: {
    directCrypto: {
      enabled: true,
      displayName: "Paiement direct en crypto",
      walletAddress: "",
    },
  },
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { updateCryptoSettings } from "./actions"

interface CryptoSettingsFormProps {
  initialSettings: {
    minimumAmount: number
    walletAddress: string
    autoConvert: boolean
  }
}

export default function CryptoSettingsForm({ initialSettings }: CryptoSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateCryptoSettings(settings)

      if (result.success) {
        toast({
          title: "Settings updated",
          description: "Crypto conversion settings have been updated successfully",
        })
      } else {
        throw new Error(result.error || "Error updating settings")
      }
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto Conversion Configuration</CardTitle>
        <CardDescription>Configure settings for automatic conversion of payments to cryptocurrency</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="wallet-address">Crypto wallet address</Label>
            <Input
              id="wallet-address"
              placeholder="Enter your wallet address"
              value={settings.walletAddress}
              onChange={(e) => setSettings({ ...settings, walletAddress: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">Address where funds will be transferred after conversion</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimum-amount">Minimum amount for conversion (€)</Label>
            <Input
              id="minimum-amount"
              type="number"
              min="1"
              step="1"
              placeholder="100"
              value={settings.minimumAmount}
              onChange={(e) => setSettings({ ...settings, minimumAmount: Number(e.target.value) })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum amount to reach before triggering automatic conversion
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-convert"
              checked={settings.autoConvert}
              onCheckedChange={(checked) => setSettings({ ...settings, autoConvert: checked })}
            />
            <Label htmlFor="auto-convert">Enable automatic conversion</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save settings"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

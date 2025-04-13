"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/supabase/auth"
import { createDeposit } from "@/lib/services/deposit-service"

const manualDepositSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number.parseFloat(val)), {
      message: "Le montant doit être un nombre",
    })
    .refine((val) => Number.parseFloat(val) >= 10, {
      message: "Le montant minimum est de 10 €",
    })
    .refine((val) => Number.parseFloat(val) <= 10000, {
      message: "Le montant maximum est de 10 000 €",
    }),
  transactionHash: z.string().min(1, "Le hash de transaction est requis"),
})

export default function DepositForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Récupérer les paramètres de l'URL pour afficher des messages de succès/échec
  const success = searchParams.get("success")
  const depositId = searchParams.get("deposit_id")

  const manualForm = useForm<z.infer<typeof manualDepositSchema>>({
    resolver: zodResolver(manualDepositSchema),
    defaultValues: {
      amount: "",
      transactionHash: "",
    },
  })

  async function onManualSubmit(values: z.infer<typeof manualDepositSchema>) {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer un dépôt",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const amount = Number.parseFloat(values.amount)

      // Créer un dépôt manuel
      const result = await createDeposit({
        userId: user.id,
        amount,
        transactionHash: values.transactionHash,
      })

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la création du dépôt")
      }

      // Rediriger vers la page de dépôts avec un message de succès
      router.push(`/dashboard/deposits?success=true&deposit_id=${result.data.id}`)

      toast({
        title: "Dépôt créé",
        description: "Votre demande de dépôt a été créée avec succès et est en attente de validation.",
      })
    } catch (error: any) {
      console.error("Erreur lors du dépôt:", error)
      setError(error.message || "Une erreur est survenue lors du dépôt")
      toast({
        title: "Erreur de dépôt",
        description: error.message || "Une erreur est survenue lors du dépôt",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Déposer des fonds</CardTitle>
        <CardDescription>Ajoutez des fonds à votre compte pour effectuer des achats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success === "true" && depositId && (
          <Alert className="bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Dépôt en cours de traitement</AlertTitle>
            <AlertDescription>
              Votre dépôt a été initié avec succès. Les fonds seront disponibles dans votre compte après validation. ID
              de référence: {depositId}
            </AlertDescription>
          </Alert>
        )}

        {success === "false" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Dépôt annulé</AlertTitle>
            <AlertDescription>Votre dépôt a été annulé. Aucun montant n'a été débité.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur lors du dépôt</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border p-4 mb-4 bg-muted/30">
          <h3 className="font-medium mb-2">Dépôt manuel en cryptomonnaie</h3>
          <p className="text-sm text-muted-foreground">
            Envoyez des cryptomonnaies directement et soumettez le hash de transaction pour validation. Ce processus
            nécessite une validation manuelle par un administrateur.
          </p>
        </div>

        <Form {...manualForm}>
          <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-6">
            <FormField
              control={manualForm.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant (€)</FormLabel>
                  <FormControl>
                    <Input placeholder="100" {...field} type="number" min="10" step="1" />
                  </FormControl>
                  <FormDescription>Entrez le montant que vous souhaitez déposer (minimum 10 €)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={manualForm.control}
              name="transactionHash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hash de transaction</FormLabel>
                  <FormControl>
                    <Input placeholder="0x1234..." {...field} />
                  </FormControl>
                  <FormDescription>Entrez le hash de transaction de votre paiement en crypto-monnaie</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Soumettre le dépôt manuel
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

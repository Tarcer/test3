"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/supabase/auth"
import { requestWithdrawal } from "@/lib/services/withdrawal-service"

const withdrawalSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number.parseFloat(val)), {
      message: "Le montant doit être un nombre",
    })
    .refine((val) => Number.parseFloat(val) >= 10, {
      message: "Le montant minimum est de 10 €",
    }),
  walletAddress: z.string().min(1, "L'adresse de portefeuille est requise"),
})

export default function WithdrawalForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Récupérer les paramètres de l'URL pour afficher des messages de succès/échec
  const success = searchParams.get("success")
  const withdrawalId = searchParams.get("withdrawal_id")

  const form = useForm<z.infer<typeof withdrawalSchema>>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      walletAddress: user?.solanaUsdtAddress || "",
    },
  })

  async function onSubmit(values: z.infer<typeof withdrawalSchema>) {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer un retrait",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const amount = Number.parseFloat(values.amount)

      // Créer une demande de retrait
      const result = await requestWithdrawal(user.id, amount, values.walletAddress)

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la création de la demande de retrait")
      }

      // Rediriger vers la page de retraits avec un message de succès
      router.push(`/dashboard/withdrawals?success=true&withdrawal_id=${result.data.id}`)

      toast({
        title: "Demande de retrait créée",
        description: "Votre demande de retrait a été créée avec succès et est en attente de validation.",
      })
    } catch (error: any) {
      console.error("Erreur lors du retrait:", error)
      setError(error.message || "Une erreur est survenue lors de la demande de retrait")
      toast({
        title: "Erreur de retrait",
        description: error.message || "Une erreur est survenue lors de la demande de retrait",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demander un retrait</CardTitle>
        <CardDescription>Retirez des fonds de votre compte vers votre portefeuille crypto</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success === "true" && withdrawalId && (
          <Alert className="bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Demande de retrait en cours de traitement</AlertTitle>
            <AlertDescription>
              Votre demande de retrait a été créée avec succès. Elle sera examinée par notre équipe et traitée dans les
              24-48 heures ouvrables. ID de référence: {withdrawalId}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur lors de la demande de retrait</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant (€)</FormLabel>
                  <FormControl>
                    <Input placeholder="100" {...field} type="number" min="10" step="1" />
                  </FormControl>
                  <FormDescription>Entrez le montant que vous souhaitez retirer (minimum 10 €)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse de portefeuille</FormLabel>
                  <FormControl>
                    <Input placeholder="Votre adresse de portefeuille crypto" {...field} />
                  </FormControl>
                  <FormDescription>
                    Entrez l'adresse de votre portefeuille crypto où vous souhaitez recevoir les fonds
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">
                <span className="font-medium">Frais de retrait:</span> 10% du montant retiré
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">Montant net:</span>{" "}
                {form.watch("amount") ? `${(Number(form.watch("amount")) * 0.9).toFixed(2)} €` : "0.00 €"}
              </p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Demander un retrait
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-sm text-muted-foreground">
          Les retraits sont traités manuellement par notre équipe et peuvent prendre jusqu'à 48 heures ouvrables. Des
          frais de 10% sont appliqués à tous les retraits.
        </p>
      </CardFooter>
    </Card>
  )
}

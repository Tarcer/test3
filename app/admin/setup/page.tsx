"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { runAllSeeds } from "@/lib/seed-data"
import { useToast } from "@/hooks/use-toast"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const { toast } = useToast()

  const handleSetup = async () => {
    setIsLoading(true)
    try {
      const seedResults = await runAllSeeds()
      setResults(seedResults)

      toast({
        title: "Configuration terminée",
        description: "La base de données a été initialisée avec succès.",
      })
    } catch (error) {
      console.error("Setup error:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'initialisation de la base de données.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Initialisation de la base de données</CardTitle>
          <CardDescription>
            Cette page vous permet d'initialiser la base de données avec des données de test.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Cette opération va créer :</p>
          <ul className="mb-4 list-disc pl-6">
            <li>Des jours de retrait (5, 10, 15, 20, 25, 30 de chaque mois)</li>
            <li>Des produits de démonstration (templates de sites web)</li>
            <li>Des paramètres système (période de rémunération, frais de retrait, etc.)</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Note : Les données ne seront ajoutées que si elles n'existent pas déjà.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSetup} disabled={isLoading}>
            {isLoading ? "Initialisation en cours..." : "Initialiser la base de données"}
          </Button>
        </CardFooter>
      </Card>

      {results && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Jours de retrait</h3>
                <p>
                  {results.withdrawalDays.success
                    ? "✅ " + results.withdrawalDays.message
                    : "❌ " + results.withdrawalDays.error}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Produits</h3>
                <p>{results.products.success ? "✅ " + results.products.message : "❌ " + results.products.error}</p>
              </div>
              <div>
                <h3 className="font-medium">Paramètres système</h3>
                <p>{results.settings.success ? "✅ " + results.settings.message : "❌ " + results.settings.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

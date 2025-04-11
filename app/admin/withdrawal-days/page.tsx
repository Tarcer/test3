import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import WithdrawalDaysCalendar from "@/components/withdrawal-days-calendar"

export default function WithdrawalDaysPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jours de Retrait</h1>
        <p className="mt-2 text-muted-foreground">
          Configurez les jours où les utilisateurs peuvent effectuer des retraits
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configurer les Jours de Retrait</CardTitle>
            <CardDescription>Définissez les jours du mois où les retraits sont autorisés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <Label htmlFor="withdrawal-days">Jours de retrait (séparés par des virgules)</Label>
                <Input id="withdrawal-days" defaultValue="5, 10, 15, 20, 25, 30" />
                <p className="text-xs text-muted-foreground">
                  Entrez les jours du mois où les retraits sont autorisés, séparés par des virgules.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-withdrawal">Montant minimum de retrait (€)</Label>
                <Input id="min-withdrawal" type="number" defaultValue="50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawal-fee">Frais de retrait (%)</Label>
                <Input id="withdrawal-fee" type="number" defaultValue="10" />
              </div>

              <Button>Enregistrer les modifications</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendrier des Retraits</CardTitle>
            <CardDescription>Visualisez les jours de retrait pour le mois en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <WithdrawalDaysCalendar />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Modifications</CardTitle>
          <CardDescription>Dernières modifications apportées aux jours de retrait</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-4 gap-4 p-4 font-medium">
              <div>Date</div>
              <div>Administrateur</div>
              <div>Modification</div>
              <div>Détails</div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-4 gap-4 border-t p-4">
                <div className="flex items-center">10/0{i}/2025</div>
                <div className="flex items-center">Admin {i}</div>
                <div className="flex items-center">Modification des jours de retrait</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  {i === 1
                    ? "Ajout du jour 30"
                    : i === 2
                      ? "Suppression du jour 1"
                      : "Modification des frais de 8% à 10%"}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

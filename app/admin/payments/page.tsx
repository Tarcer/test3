import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export default async function AdminPaymentsPage() {
  const supabase = await createServerSupabaseClient()

  // Vérifier si l'utilisateur est connecté et est administrateur
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/account/login?redirectTo=/admin/payments")
  }

  // Récupérer les paiements
  const { data: payments, error } = await supabase
    .from("payment_references")
    .select(`
      *,
      users:user_id (
        name,
        email
      ),
      products:product_id (
        name,
        price
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Erreur lors de la récupération des paiements:", error)
  }

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Gestion des paiements</h1>

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
          <CardDescription>Consultez l'historique des paiements effectués sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Aucun paiement trouvé</p>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-6 gap-4 p-4 font-medium">
                <div>Date</div>
                <div>Client</div>
                <div>Produit</div>
                <div>Montant</div>
                <div>Statut</div>
                <div>ID Charge</div>
              </div>
              {payments.map((payment) => (
                <div key={payment.id} className="grid grid-cols-6 gap-4 border-t p-4">
                  <div className="flex items-center">{payment.created_at ? formatDate(payment.created_at) : "N/A"}</div>
                  <div>
                    <div className="font-medium">{payment.users?.name || "Utilisateur inconnu"}</div>
                    <div className="text-sm text-muted-foreground">{payment.users?.email || "Email inconnu"}</div>
                  </div>
                  <div className="flex items-center">{payment.products?.name || "Produit inconnu"}</div>
                  <div className="flex items-center font-medium">
                    {payment.amount ? formatCurrency(payment.amount) : "N/A"}
                  </div>
                  <div className="flex items-center">
                    <Badge
                      variant={
                        payment.status === "completed"
                          ? "default"
                          : payment.status === "pending"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {payment.status === "completed"
                        ? "Complété"
                        : payment.status === "pending"
                          ? "En attente"
                          : "Échoué"}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs truncate">{payment.charge_id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

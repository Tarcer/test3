import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, TrendingUp, ArrowRight, Wallet } from "lucide-react"

export const metadata: Metadata = {
  title: "Programme d'Affiliation |  ViralAds",
  description: "Gagnez des commissions en parrainant de nouveaux utilisateurs",
}

export default function AffiliateProgramPage() {
  return (
    <Card>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Programme d'Affiliation</h1>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
              Gagnez des commissions en parrainant de nouveaux utilisateurs sur notre plateforme.
            </p>
          </div>

          {/* Hero Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">Parrainez des Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Partagez votre lien d'affiliation unique avec vos amis, votre famille ou sur les réseaux sociaux.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">Gagnez des Commissions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Recevez des commissions sur les achats effectués par vos filleuls, jusqu'au 3ème niveau.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">Retirez vos Gains</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Retirez vos commissions lors des jours de retrait définis par l'administration.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Commission Structure */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">Structure des Commissions</h2>
            <p className="mt-2 font-bold  text-center mb-5 text-[#00BFFF]">Bénéficiez de 30€/mois pendant 1 an (360 jours) offerts pour 4 parrainages, sans limite de cumul au gré de vos filleuls.</p>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Niveau 1</CardTitle>
                  <CardDescription>Filleuls directs</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-primary">1%</p>
                  <p className="mt-2 text-muted-foreground">
                    Sur tous les achats effectués par les utilisateurs que vous avez directement parrainés.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Niveau 2</CardTitle>
                  <CardDescription>Filleuls de vos filleuls</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-primary">0.5%</p>
                  <p className="mt-2 text-muted-foreground">
                    Sur tous les achats effectués par les filleuls de vos filleuls directs.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Niveau 3</CardTitle>
                  <CardDescription>Filleuls de niveau 3</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-primary">0.25%</p>
                  <p className="mt-2 text-muted-foreground">
                    Sur tous les achats effectués par les filleuls de vos filleuls de niveau 2.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Example Calculation */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">Exemple de Calcul</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Scénario</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>Votre filleul direct (Niveau 1) achète un site à 500 €</li>
                      <li>Un filleul de niveau 2 achète un site à 300 €</li>
                      <li>Un filleul de niveau 3 achète un site à 200 €</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Vos Commissions</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Niveau 1 (1% de 500 €)</span>
                        <span className="font-medium">5.00 €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Niveau 2 (0.5% de 300 €)</span>
                        <span className="font-medium">1.50 €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Niveau 3 (0.25% de 200 €)</span>
                        <span className="font-medium">0.50 €</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>7.00 €</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">Questions Fréquentes</h2>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="commissions">Commissions</TabsTrigger>
                <TabsTrigger value="payments">Paiements</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Comment rejoindre le programme d'affiliation ?</h3>
                  <p className="text-muted-foreground">
                    Tous les utilisateurs inscrits sur Viralads sont automatiquement inscrits au programme
                    d'affiliation. Vous pouvez trouver votre lien d'affiliation unique dans votre tableau de bord.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Comment fonctionne le système de niveaux ?</h3>
                  <p className="text-muted-foreground">
                    Le programme d'affiliation fonctionne sur 3 niveaux. Vous gagnez des commissions sur les achats de
                    vos filleuls directs (niveau 1), sur les achats des filleuls de vos filleuls (niveau 2), et sur les
                    achats des filleuls de niveau 3. 
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="commissions" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Quand mes commissions sont-elles calculées ?</h3>
                  <p className="text-muted-foreground">
                    Les commissions sont calculées instantanément après chaque achat effectué par vos filleuls, quel que
                    soit leur niveau.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Y a-t-il un plafond de commissions ?</h3>
                  <p className="text-muted-foreground">
                    Non, il n'y a pas de plafond. Vous pouvez gagner des commissions illimitées en fonction des achats
                    de vos filleuls.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Combien de fois puis-je bénéficier de l’offre de 30€ par mois pendant 12 mois ?</h3>
                  <p className="text-muted-foreground">
                  Vous pouvez bénéficier de cette offre autant de fois que vous parrainez un groupe de 4 personnes, et l’offre est cumulable à l’infini. Par exemple, si vous parrainez 8 personnes, vous recevrez 60€/mois pendant 12 mois.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="payments" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Comment puis-je retirer mes commissions ?</h3>
                  <p className="text-muted-foreground">
                    Les commissions peuvent être retirées lors des jours de retrait définis par l'administration. Les
                    retraits sont soumis à des frais de 10%.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Quel est le montant minimum de retrait ?</h3>
                  <p className="text-muted-foreground">Le montant minimum pour effectuer un retrait est de 5 €.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Quand retirer mes bénéfices ?</h3>
                  <p className="text-muted-foreground">Voici les plages horaires de retrait disponibles selon les jours :<br />

                  • Lundi : 5 à 10 USDT<br />
                  •  Mardi : 50 à 500 USDT<br />
                  • Mercredi : 1 000 à 10 000 USDT<br />
                  • Jeudi : 50 000 à 500 000 USDT<br />
                  • Vendredi : Jusqu'à 100 000 USDT</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Prêt à Commencer ?</h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground mb-6">
              Rejoignez notre programme d'affiliation dès aujourd'hui et commencez à gagner des commissions sur les
              achats de vos filleuls.
            </p>
            <Button size="lg" asChild>
              <Link href="/account/register">
                S'inscrire Maintenant <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

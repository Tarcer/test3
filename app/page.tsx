import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Users, Wallet } from "lucide-react"
import FeaturedProducts from "@/components/featured-products"
import EarningsCalculator from "@/components/earnings-calculator"

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-[#09090b] to-[#1a1a1c]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-white">
              Achetez des Sites Web et Gagnez des Revenus Quotidiens
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl text-gray-400">
              Notre plateforme unique vous permet d'acheter des sites web prêts à l'emploi et de recevoir des revenus
              quotidiens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/products">
                  Voir les Sites Disponibles <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/account/register">Créer un Compte</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Revenus Quotidiens</h3>
            <p className="text-muted-foreground">
            Recevez des revenus quotidiens pendant 360 jours dès l'achat de votre boutique.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Programme d'Affiliation</h3>
            <p className="text-muted-foreground">
              Gagnez des commissions sur 3 niveaux de parrainage : 1%, 0,5% et 0,25%.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Paiements Sécurisés</h3>
            <p className="text-muted-foreground">
            Payer directement avec vos cryptomonnaies en toute sérénité.
            </p>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="container px-4 md:px-6 py-8 bg-muted/50 rounded-lg">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Calculez Vos Revenus Potentiels</h2>
            <p className="mt-2 text-muted-foreground">
              Estimez vos revenus quotidiens et totaux en fonction du prix d'achat
            </p>
          </div>
          <EarningsCalculator />
        </div>
      </section>

      {/* Featured Products */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Sites Web Populaires</h2>
            <Link href="/products" className="text-primary hover:underline">
              Voir tous les sites
            </Link>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* How It Works */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Comment Ça Marche</h2>
            <p className="mt-2 text-muted-foreground">Notre processus simple en 4 étapes</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold">Créez un Compte</h3>
              <p className="text-sm text-muted-foreground">
                Inscrivez-vous gratuitement et configurez votre profil utilisateur.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold">Choisissez un Site</h3>
              <p className="text-sm text-muted-foreground">
                Parcourez notre catalogue et sélectionnez le site qui vous intéresse.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold">Effectuez l'Achat</h3>
              <p className="text-sm text-muted-foreground">
                Payez en toute sécurité par carte bancaire et recevez votre site.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-semibold">Recevez des Revenus</h3>
              <p className="text-sm text-muted-foreground">
                Gagnez des revenus quotidiens et des commissions d'affiliation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-6 rounded-lg bg-primary p-8 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold">Prêt à Commencer?</h2>
          <p className="max-w-[600px] text-primary-foreground/90">
            Rejoignez notre plateforme dès aujourd'hui et commencez à gagner des revenus quotidiens avec nos sites web
            de qualité.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/account/register">S'inscrire Maintenant</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

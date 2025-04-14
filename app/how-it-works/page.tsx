import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, CreditCard, Download, Wallet } from "lucide-react"

export const metadata: Metadata = {
  title: "How It Works | WebCrypto Market",
  description: "Learn how to purchase and use website templates with cryptocurrency",
}

export default function HowItWorksPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Comment ça marche ?</h1>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mt-4">1. Parcourir les boutiques</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
               Découvrez notre collection de boutiques en ligne premium et trouvez celle qui correspond parfaitement à votre projet.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mt-4">2. Alimenter votre portefeuille</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Déposez des cryptomonnaies sur votre portefeuille Viralads en utilisant Bitcoin, Ethereum ou USDT. 
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mt-4">3. Finaliser l'achat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
              Réglez vos boutiques sélectionnées avec le solde de votre portefeuille. La transaction est sécurisée et instantanée.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mt-4">4. Suivi de vos performances et rendements</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
               Accédez immédiatement à vos boutiques achetées depuis votre tableau de bord et commencez à suivre vos performances et rendements.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold">Questions fréquemment posées</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">Quelles cryptomonnaies acceptez-vous?</h3>
              <p className="mt-2 text-muted-foreground">
                Déposez des cryptomonnaies sur votre portefeuille Viralads en utilisant Bitcoin (BTC), Ethereum (ETH) ou Solana (SOL).
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Comment se passe une Vente de Produits ?</h3>
              <p className="mt-2 text-muted-foreground">
              Vous vendez des produits via notre réseau sur TikTok, eBay et Amazon
              L'usine partenaire prend en charge :
              • L'emballage
              • L'expédition
              • Le service client
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Quel est mon rôle en tant que gérant ?</h3>
              <p className="mt-2 text-muted-foreground">
              Vos responsabilités quotidiennes incluent :

              • Validation des commandes de votre boutique
              • Suivi des performances de vente
              • Développement de votre réseau de boutiques affiliées
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Comment fonctionne le système d'affiliation?</h3>
              <p className="mt-2 text-muted-foreground">
              • Développez votre réseau en invitant d'autres personnes à devenir propriétaires de boutiques
              • Partagez votre lien d'affiliation pour sponsoriser de nouveaux vendeurs
              • Bénéficiez d'une rémunération complémentaire grâce au parrainage
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

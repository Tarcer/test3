import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, CreditCard, Download, Wallet } from "lucide-react"

export const metadata: Metadata = {
  title: "Comment ça marche ? | ViralAds",
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
                Déposez des cryptomonnaies sur votre portefeuille Viralads en utilisant:<br />
                • Bitcoin (BTC)<br />
                • Ethereum (ETH)<br />
                • Solana (SOL)
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Comment se passe une Vente de Produits ?</h3>
              <p className="mt-2 text-muted-foreground">
              Vous vendez des produits via notre réseau sur TikTok, eBay et Amazon
              L'usine partenaire prend en charge :<br />
              • L'emballage<br />
              • L'expédition<br />
              • Le service client
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Quel est mon rôle en tant que gérant ?</h3>
              <p className="mt-2 text-muted-foreground">
                Vos responsabilités quotidiennes incluent :<br />
               • Validation des commandes de votre boutique<br />
               • Suivi des performances de vente<br />
               • Développement de votre réseau de boutiques affiliées
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Comment fonctionne le système d'affiliation?</h3>
              <p className="mt-2 text-muted-foreground">
              • Développez votre réseau en invitant d'autres personnes à devenir propriétaires de boutiques<br />
              • Partagez votre lien d'affiliation pour sponsoriser de nouveaux vendeurs<br />
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Guide d'utilisation : Acheter et Envoyer de la Cryptomonnaie avec Phantom Wallet</h3>
              <p className="mt-2 text-muted-foreground">
              • Étape 1 : Télécharger et Installer Phantom Wallet<br />
1. Téléchargez l'application Phantom Wallet :<br />
   - Pour ordinateur : Rendez-vous sur [phantom.app](https://phantom.app) et téléchargez l'extension pour votre navigateur (Chrome, Firefox, Brave, etc.).<br />
   - Pour mobile : Allez sur l'App Store (iOS) ou le Google Play Store (Android) et recherchez "Phantom Wallet".<br />
              • Étape 2 : Créer un Nouveau Wallet<br />
1. Lancez l'application Phantom et cliquez sur "Créer un nouveau wallet".<br />
2. Suivez les instructions pour définir un mot de passe sécurisé. Ce mot de passe protège l'accès à votre wallet.<br />
3. Notez votre phrase de récupération (Seed Phrase) :<br />
   - Une série de 12 mots vous sera affichée. Ces mots sont essentiels pour récupérer votre wallet en cas de perte ou de changement d'appareil.<br />
   - Écrivez-les soigneusement dans un endroit sûr et confidentiel. Ne les partagez jamais avec personne.<br />
4. Confirmez votre phrase de récupération en la réorganisant dans l'ordre correct.<br />
              </p>
            </div>
            <div>
              <p className="mt-2 text-muted-foreground">
              •  Étape 3 : Ajouter des Fonds à Votre Wallet<br />
Il existe deux façons principales d'ajouter des cryptomonnaies à votre wallet :<br />

 Option 1 : Achat Direct via Phantom (Solana uniquement)<br />
1. Dans l'application Phantom, cliquez sur "Acheter".<br />
2. Sélectionnez la méthode de paiement (carte bancaire ou autre, selon les options disponibles).<br />
3. Entrez le montant que vous souhaitez acheter (en SOL ou autre devise supportée).<br />
4. Suivez les instructions pour finaliser l'achat. Les fonds seront directement crédités dans votre wallet.<br />

Option 2 : Transfert depuis un Autre Wallet ou une Plateforme d'Échange<br />
1. Obtenez l'adresse de votre wallet Phantom :<br />
   - Cliquez sur "Recevoir" dans l'application.<br />
   - Copiez ou partagez l'adresse publique (une chaîne de caractères commençant généralement par "SOL" pour Solana).<br />
2. Connectez-vous à votre compte sur une plateforme d'échange (comme Binance, Coinbase, etc.) ou un autre wallet.<br />
3. Effectuez un transfert vers l'adresse copiée depuis Phantom.<br />
4. Attendez quelques minutes pour que la transaction soit confirmée sur la blockchain.<br />
              • Étape 4 : Envoyer de la Cryptomonnaie<br />
1. Dans l'application Phantom, sélectionnez la cryptomonnaie que vous souhaitez envoyer (par exemple, SOL ou USDC).<br />
2. Cliquez sur "Envoyer".<br />
3. Entrez l'adresse du destinataire (assurez-vous qu'elle est correcte, car les transactions sont irréversibles).<br />
4. Spécifiez le montant à envoyer.<br />
5. Confirmez la transaction et approuvez les frais de réseau (généralement très bas sur Solana).<br />

              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

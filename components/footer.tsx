import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background mt-auto">
      <div className="container flex flex-col gap-8 py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">ViralAds</h3>
            <p className="text-sm text-muted-foreground">
              Plateforme d'achat de sites web avec système de rémunération et programme d'affiliation
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">Produits</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/products" className="text-sm text-muted-foreground hover:underline">
                Tous les Sites
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">Informations</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:underline">
                Comment Ça Marche
              </Link>
              <Link href="/affiliate" className="text-sm text-muted-foreground hover:underline">
                Programme d'Affiliation
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:underline">
                FAQ
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">Légal</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
                Conditions d'Utilisation
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
                Politique de Confidentialité
              </Link>
              <Link href="/refund" className="text-sm text-muted-foreground hover:underline">
                Politique de Remboursement
              </Link>
            </nav>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ViralAds. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Paiements sécurisés.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

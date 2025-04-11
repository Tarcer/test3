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
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">How It Works</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
            Learn how to purchase and use website templates with cryptocurrency
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mt-4">1. Browse Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Explore our collection of premium website templates and find the perfect one for your project.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mt-4">2. Fund Your Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Deposit cryptocurrency to your WebCrypto wallet using Bitcoin, Ethereum, or USDT.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mt-4">3. Complete Purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Pay for your selected templates using your wallet balance. The transaction is secure and instant.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mt-4">4. Download & Use</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Instantly access your purchased templates from your account dashboard and start using them.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">What cryptocurrencies do you accept?</h3>
              <p className="mt-2 text-muted-foreground">
                We currently accept Bitcoin (BTC), Ethereum (ETH), and Tether (USDT). We plan to add more options in the
                future.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">How do I receive my purchased templates?</h3>
              <p className="mt-2 text-muted-foreground">
                After purchase, templates are immediately available in your account dashboard for download.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Can I request customizations to the templates?</h3>
              <p className="mt-2 text-muted-foreground">
                Yes, we offer customization services for an additional fee. Contact our support team for details.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">What if I need help with my template?</h3>
              <p className="mt-2 text-muted-foreground">
                All templates come with documentation. If you need additional help, our support team is available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

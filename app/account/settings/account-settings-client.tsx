"use client"

interface AccountSettingsClientProps {
  user: {
    id: string
    email: string
    name: string
    solana_usdt_address: string | null
  }
}

export default function AccountSettingsClient({ user }: AccountSettingsClientProps) {
  return (
    <div className="container max-w-5xl py-8">
      <h1 className="mb-6 text-3xl font-bold">Paramètres du compte</h1>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Informations personnelles</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p>{user.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Nom</p>
            <p>{user.name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">ID Utilisateur</p>
            <p className="font-mono text-sm">{user.id}</p>
          </div>

          {user.solana_usdt_address && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Adresse USDT Solana</p>
              <p className="font-mono text-sm break-all">{user.solana_usdt_address}</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-lg font-medium">Paramètres de paiement</h3>
          <p className="text-muted-foreground">
            Nous utilisons la blockchain pour une meilleure fluidité et rapidité des transactions.
          </p>
        </div>
      </div>
    </div>
  )
}

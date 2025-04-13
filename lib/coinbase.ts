import { Client } from "coinbase-commerce-node"

// Assurons-nous que la clé API est disponible et valide
const apiKey = process.env.COINBASE_COMMERCE_API_KEY || ""

// Déclaration de stubClient en dehors des blocs conditionnels
let coinbaseClient
const stubClient = {
  createCharge: async () => {
    throw new Error("Configuration Coinbase Commerce manquante. Vérifiez votre clé API.")
  },
}

if (!apiKey || apiKey.trim() === "") {
  console.error("Clé API Coinbase Commerce manquante ou invalide")
  // Exporter le client stub au lieu du vrai client
  coinbaseClient = stubClient
} else {
  // Initialiser normalement avec la clé API valide
  try {
    Client.init(apiKey)
    coinbaseClient = Client.resources.Charge
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Coinbase Commerce:", error)
    coinbaseClient = stubClient
  }
}

export { coinbaseClient }

// Fonction pour formater les données de charge
export function formatChargeData(
  productName: string,
  price: number,
  userId: string,
  productId: string,
  paymentReferenceId: string,
  siteUrl: string,
) {
  return {
    name: productName,
    description: `Achat de ${productName} sur WebMarket Pro`,
    pricing_type: "fixed_price",
    local_price: {
      amount: price.toString(),
      currency: "EUR",
    },
    metadata: {
      userId,
      productId,
      paymentId: paymentReferenceId,
    },
    redirect_url: `${siteUrl}/payment/success?charge_id=${paymentReferenceId}`,
    cancel_url: `${siteUrl}/payment/cancel`,
  }
}

// Fonction pour créer une charge Coinbase
export async function createCoinbaseCharge(apiKey: string, chargeData: any) {
  const response = await fetch("https://api.commerce.coinbase.com/charges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CC-Api-Key": apiKey,
      "X-CC-Version": "2018-03-22",
    },
    body: JSON.stringify(chargeData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || "Erreur lors de la création de la charge Coinbase")
  }

  return await response.json()
}

// Fonction pour vérifier la signature d'un webhook
export function verifyWebhookSignature(signature: string, rawBody: string, secret: string) {
  const crypto = require("crypto")
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(rawBody)
  const computedSignature = hmac.digest("hex")
  return computedSignature === signature
}

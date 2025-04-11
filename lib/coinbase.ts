import { Client } from "coinbase-commerce-node"

// Assurons-nous que la clé API est disponible et valide
const apiKey = process.env.COINBASE_COMMERCE_API_KEY || ""
if (!apiKey || apiKey.trim() === "") {
  console.error("Clé API Coinbase Commerce manquante ou invalide")
  // Créer une fonction stub pour éviter les erreurs de runtime
  const stubClient = {
    createCharge: async () => {
      throw new Error("Configuration Coinbase Commerce manquante. Vérifiez votre clé API.")
    },
  }

  // Exporter le client stub au lieu du vrai client
  export const coinbaseClient = stubClient;
} else {
  // Initialiser normalement avec la clé API valide
  Client.init(apiKey)
  export const coinbaseClient = Client.resources.Charge;
}

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

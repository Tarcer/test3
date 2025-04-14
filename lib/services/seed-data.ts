"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function seedWithdrawalDays() {
  const supabase = await createServerSupabaseClient()

  // Define the withdrawal days (5, 10, 15, 20, 25, 30 of each month)
  const withdrawalDays = [5, 10, 15, 20, 25, 30]

  try {
    // Check if there are already withdrawal days in the database
    const { data: existingDays, error: checkError } = await supabase.from("withdrawal_days").select("day_of_month")

    if (checkError) {
      console.error("Error checking withdrawal days:", checkError)
      return { success: false, error: checkError.message }
    }

    // If there are already days, we don't need to seed
    if (existingDays.length > 0) {
      return { success: true, message: "Withdrawal days already exist" }
    }

    // Insert withdrawal days
    const daysToInsert = withdrawalDays.map((day) => ({ day_of_month: day }))
    const { error: insertError } = await supabase.from("withdrawal_days").insert(daysToInsert)

    if (insertError) {
      console.error("Error seeding withdrawal days:", insertError)
      return { success: false, error: insertError.message }
    }

    return { success: true, message: "Withdrawal days seeded successfully" }
  } catch (error: any) {
    console.error("Error in seedWithdrawalDays:", error)
    return { success: false, error: error.message }
  }
}

export async function seedWithdrawalLimits() {
  const supabase = await createServerSupabaseClient()

  try {
    // Check if withdrawal limits already exist
    const { data: existingLimits, error: checkError } = await supabase
      .from("system_settings")
      .select("*")
      .eq("key", "withdrawalLimits")

    if (checkError) {
      console.error("Error checking withdrawal limits:", checkError)
      return { success: false, error: checkError.message }
    }

    // If limits already exist, we don't need to seed
    if (existingLimits.length > 0) {
      return { success: true, message: "Withdrawal limits already exist" }
    }

    // Define default withdrawal limits
    const withdrawalLimits = {
      minAmount: 10,
      maxAmount: 10000,
      dailyLimit: 1000,
    }

    // Insert withdrawal limits into system_settings
    const { error: insertError } = await supabase.from("system_settings").insert({
      key: "withdrawalLimits",
      value: withdrawalLimits,
    })

    if (insertError) {
      console.error("Error seeding withdrawal limits:", insertError)
      return { success: false, error: insertError.message }
    }

    return { success: true, message: "Withdrawal limits seeded successfully" }
  } catch (error: any) {
    console.error("Error in seedWithdrawalLimits:", error)
    return { success: false, error: error.message }
  }
}

export async function seedProducts() {
  const supabase = await createServerSupabaseClient()

  // Define the products
  const products = [
    {
      name: "E-Boutique Pro",
      description: "Template e-commerce complet avec catalogue produits, panier et processus de paiement.",
      price: 499,
      category: "E-commerce",
      image_url: "/placeholder.svg?height=400&width=600",
      features: [
        "Catalogue produits",
        "Panier d'achat",
        "Processus de paiement",
        "Comptes utilisateurs",
        "Suivi de commandes",
        "Liste de souhaits",
      ],
      demo_url: "/demo/eboutique-pro",
    },
    {
      name: "BlogMaster",
      description: "Un template de blog élégant conçu pour les créateurs de contenu et les écrivains.",
      price: 299,
      category: "Blog",
      image_url: "/placeholder.svg?height=400&width=600",
      features: [
        "Mise en page d'articles",
        "Pages de catégories",
        "Profils d'auteurs",
        "Section commentaires",
        "Inscription à la newsletter",
        "Articles connexes",
      ],
      demo_url: "/demo/blogmaster",
    },
    {
      name: "Portfolio Créatif",
      description: "Présentez votre travail avec ce template de portfolio élégant et minimaliste.",
      price: 349,
      category: "Portfolio",
      image_url: "/placeholder.svg?height=400&width=600",
      features: [
        "Galerie de projets",
        "Section À propos",
        "Affichage des compétences",
        "Formulaire de contact",
        "Intégration de blog",
        "Liens de médias sociaux",
      ],
      demo_url: "/demo/portfolio-creatif",
    },
    {
      name: "Business Elite",
      description: "Un site professionnel pour entreprises avec design moderne et mise en page responsive.",
      price: 599,
      category: "Business",
      image_url: "/placeholder.svg?height=400&width=600",
      features: [
        "Design responsive",
        "Formulaire de contact",
        "Page À propos",
        "Section services",
        "Membres de l'équipe",
        "Témoignages",
      ],
      demo_url: "/demo/business-elite",
    },
    {
      name: "MarketPlace Plus",
      description: "Template pour place de marché multi-vendeurs avec fonctionnalités avancées.",
      price: 799,
      category: "E-commerce",
      image_url: "/placeholder.svg?height=400&width=600",
      features: [
        "Multi-vendeurs",
        "Commissions personnalisables",
        "Tableau de bord vendeur",
        "Système de notation",
        "Messagerie intégrée",
        "Paiements sécurisés",
      ],
      demo_url: "/demo/marketplace-plus",
    },
    {
      name: "Designer Showcase",
      description: "Mettez en valeur vos travaux de design avec ce template de portfolio visuellement impressionnant.",
      price: 449,
      category: "Portfolio",
      image_url: "/placeholder.svg?height=400&width=600",
      features: [
        "Présentation de projets",
        "Études de cas",
        "Section CV",
        "Témoignages",
        "Services proposés",
        "Formulaire de contact",
      ],
      demo_url: "/demo/designer-showcase",
    },
  ]

  try {
    // Check if there are already products in the database
    const { data: existingProducts, error: checkError } = await supabase.from("products").select("id").limit(1)

    if (checkError) {
      console.error("Error checking products:", checkError)
      return { success: false, error: checkError.message }
    }

    // If there are already products, we don't need to seed
    if (existingProducts.length > 0) {
      return { success: true, message: "Products already exist" }
    }

    // Insert products
    const { error: insertError } = await supabase.from("products").insert(
      products.map((product) => ({
        ...product,
        features: JSON.stringify(product.features),
      })),
    )

    if (insertError) {
      console.error("Error seeding products:", insertError)
      return { success: false, error: insertError.message }
    }

    return { success: true, message: "Products seeded successfully" }
  } catch (error: any) {
    console.error("Error in seedProducts:", error)
    return { success: false, error: error.message }
  }
}

export async function seedSystemSettings() {
  const supabase = await createServerSupabaseClient()

  // Define the system settings
  const settings = [
    {
      key: "earningsPeriod",
      value: { days: 360 },
    },
    {
      key: "withdrawalFee",
      value: { percentage: 10 },
    },
    {
      key: "minWithdrawalAmount",
      value: { amount: 50 },
    },
    {
      key: "affiliateCommissions",
      value: {
        level1: 1, // 1%
        level2: 0.5, // 0.5%
        level3: 0.25, // 0.25%
      },
    },
  ]

  try {
    // Check if there are already settings in the database
    const { data: existingSettings, error: checkError } = await supabase.from("system_settings").select("id").limit(1)

    if (checkError) {
      console.error("Error checking system settings:", checkError)
      return { success: false, error: checkError.message }
    }

    // If there are already settings, we don't need to seed
    if (existingSettings.length > 0) {
      return { success: true, message: "System settings already exist" }
    }

    // Insert settings
    const { error: insertError } = await supabase.from("system_settings").insert(settings)

    if (insertError) {
      console.error("Error seeding system settings:", insertError)
      return { success: false, error: insertError.message }
    }

    return { success: true, message: "System settings seeded successfully" }
  } catch (error: any) {
    console.error("Error in seedSystemSettings:", error)
    return { success: false, error: error.message }
  }
}

export async function runAllSeeds() {
  const withdrawalDaysResult = await seedWithdrawalDays()
  const withdrawalLimitsResult = await seedWithdrawalLimits()
  const productsResult = await seedProducts()
  const settingsResult = await seedSystemSettings()

  return {
    withdrawalDays: withdrawalDaysResult,
    withdrawalLimits: withdrawalLimitsResult,
    products: productsResult,
    settings: settingsResult,
  }
}

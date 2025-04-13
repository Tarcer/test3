"use server"

import { createServerSupabaseClient } from "./server"
import { generateReferralCode } from "@/lib/utils"

// User authentication and registration
export async function registerUser(userData: {
  name: string
  email: string
  password: string
  solanaUsdtAddress?: string
  referredBy?: string
}) {
  const supabase = await createServerSupabaseClient()

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
      },
    },
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  // Generate unique referral code
  const referralCode = generateReferralCode(userData.name)

  // Insert into users table
  const { error: dbError } = await supabase.from("users").insert({
    id: authData.user?.id,
    email: userData.email,
    name: userData.name,
    password_hash: "stored_in_auth", // We don't store actual passwords
    solana_usdt_address: userData.solanaUsdtAddress || null,
    referral_code: referralCode,
    referred_by: userData.referredBy || null,
  })

  if (dbError) {
    return { success: false, error: dbError.message }
  }

  return { success: true, referralCode }
}

// Product operations
export async function getProducts() {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getProductById(id: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// Purchase operations
export async function createPurchase(userId: string, productId: string, amount: number) {
  const supabase = await createServerSupabaseClient()

  // Begin transaction
  // 1. Create purchase record
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      user_id: userId,
      product_id: productId,
      amount,
    })
    .select()
    .single()

  if (purchaseError) {
    return { success: false, error: purchaseError.message }
  }

  // 2. Generate daily earnings (45 days)
  const dailyAmount = amount / 45
  const earningsInserts = Array.from({ length: 45 }, (_, i) => ({
    user_id: userId,
    purchase_id: purchase.id,
    amount: dailyAmount,
    day_number: i + 1,
    status: "pending",
  }))

  const { error: earningsError } = await supabase.from("earnings").insert(earningsInserts)

  if (earningsError) {
    return { success: false, error: earningsError.message }
  }

  // 3. Process affiliate commissions if user was referred
  // Get user info to check if they were referred
  const { data: user, error: userError } = await supabase.from("users").select("referred_by").eq("id", userId).single()

  if (userError) {
    return { success: false, error: userError.message }
  }

  if (user.referred_by) {
    // Process level 1 commission (1%)
    await processAffiliateCommission(user.referred_by, purchase.id, amount, 1)

    // Find level 2 referrer
    const { data: level1User } = await supabase
      .from("users")
      .select("referred_by")
      .eq("referral_code", user.referred_by)
      .single()

    if (level1User?.referred_by) {
      // Process level 2 commission (0.5%)
      await processAffiliateCommission(level1User.referred_by, purchase.id, amount, 2)

      // Find level 3 referrer
      const { data: level2User } = await supabase
        .from("users")
        .select("referred_by")
        .eq("referral_code", level1User.referred_by)
        .single()

      if (level2User?.referred_by) {
        // Process level 3 commission (0.25%)
        await processAffiliateCommission(level2User.referred_by, purchase.id, amount, 3)
      }
    }
  }

  return { success: true, purchaseId: purchase.id }
}

async function processAffiliateCommission(
  referralCode: string,
  purchaseId: string,
  purchaseAmount: number,
  level: number,
) {
  const supabase = await createServerSupabaseClient()

  // Get the user ID for the referrer
  const { data: referrer } = await supabase.from("users").select("id").eq("referral_code", referralCode).single()

  if (!referrer) return

  // Calculate commission based on level
  let commissionRate
  switch (level) {
    case 1:
      commissionRate = 0.01 // 1%
      break
    case 2:
      commissionRate = 0.005 // 0.5%
      break
    case 3:
      commissionRate = 0.0025 // 0.25%
      break
    default:
      commissionRate = 0
  }

  const commissionAmount = purchaseAmount * commissionRate

  // Insert commission record
  await supabase.from("affiliate_commissions").insert({
    user_id: referrer.id,
    purchase_id: purchaseId,
    amount: commissionAmount,
    level,
    status: "pending",
  })
}

// Get user's available balance
export async function getUserBalance(userId: string) {
  const supabase = await createServerSupabaseClient()

  // Get the sum of all pending earnings
  const { data: earnings, error: earningsError } = await supabase
    .from("earnings")
    .select("amount")
    .eq("user_id", userId)
    .eq("status", "pending")

  if (earningsError) {
    return { success: false, error: earningsError.message }
  }

  // Get the sum of all pending affiliate commissions
  const { data: commissions, error: commissionsError } = await supabase
    .from("affiliate_commissions")
    .select("amount")
    .eq("user_id", userId)
    .eq("status", "pending")

  if (commissionsError) {
    return { success: false, error: commissionsError.message }
  }

  // Calculate total available balance
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0)
  const totalCommissions = commissions.reduce((sum, item) => sum + item.amount, 0)
  const availableBalance = totalEarnings + totalCommissions

  return {
    success: true,
    balance: {
      available: availableBalance,
      earnings: totalEarnings,
      commissions: totalCommissions,
    },
  }
}

// Request a withdrawal
export async function requestWithdrawal(userId: string, amount: number, walletAddress: string) {
  const supabase = await createServerSupabaseClient()

  // Check if today is a valid withdrawal day
  const today = new Date()
  const dayOfMonth = today.getDate()

  const { data: withdrawalDay, error: dayError } = await supabase
    .from("withdrawal_days")
    .select("*")
    .eq("day_of_month", dayOfMonth)

  if (dayError) {
    return { success: false, error: dayError.message }
  }

  if (withdrawalDay.length === 0) {
    return {
      success: false,
      error: "Les retraits ne sont pas disponibles aujourd'hui. Veuillez réessayer lors d'un jour de retrait.",
    }
  }

  // Check if user has sufficient balance
  const { success, balance, error } = await getUserBalance(userId)

  if (!success) {
    return { success: false, error }
  }

  if (balance.available < amount) {
    return { success: false, error: "Solde insuffisant pour ce retrait." }
  }

  // Calculate fee (10%)
  const fee = amount * 0.1
  const netAmount = amount - fee

  // Create withdrawal record
  const { error: withdrawalError } = await supabase.from("withdrawals").insert({
    user_id: userId,
    amount,
    fee,
    net_amount: netAmount,
    wallet_address: walletAddress,
    status: "pending",
  })

  if (withdrawalError) {
    return { success: false, error: withdrawalError.message }
  }

  return { success: true, amount, fee, netAmount }
}

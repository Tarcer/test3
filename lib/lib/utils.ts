import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateReferralCode(name: string): string {
  // Generate a referral code based on the user's name
  // Format: First 4 letters of name (uppercase) + random 4-digit number
  const prefix = name
    .replace(/[^a-zA-Z0-9]/g, "") // Remove special characters
    .substring(0, 4)
    .toUpperCase()

  const randomNumber = Math.floor(1000 + Math.random() * 9000) // 4-digit random number

  return `${prefix}${randomNumber}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function calculateDailyEarnings(price: number): number {
  // Retour quotidien de 1/45 de l'investissement
  return price / 45
}

export function calculateTotalEarnings(price: number): number {
  // Le retour total est égal à l'investissement initial
  return price
}

export function calculateNetProfit(price: number): number {
  // Total earnings minus 10% withdrawal fee
  const totalEarnings = calculateTotalEarnings(price)
  const fee = totalEarnings * 0.1
  return totalEarnings - fee
}

export function calculateDaysToFullReturn(price: number, dailyReturn: number): number {
  // Nombre de jours pour récupérer l'investissement complet
  return Math.ceil(price / dailyReturn)
}

export function isValidUSDTAddress(address: string): boolean {
  // Basic validation for Solana addresses
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

export function formatReferralUrl(referralCode: string, baseUrl?: string): string {
  const url = baseUrl || (typeof window !== "undefined" ? window.location.origin : "")
  return `${url}/account/register?ref=${referralCode}`
}

export function getDatesBetween(startDate: Date, endDate: Date): string[] {
  const dates = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

export function getCommissionRate(level: number): number {
  switch (level) {
    case 1:
      return 0.01 // 1%
    case 2:
      return 0.005 // 0.5%
    case 3:
      return 0.0025 // 0.25%
    default:
      return 0
  }
}

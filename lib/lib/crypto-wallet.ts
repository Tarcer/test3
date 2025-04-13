// This is a mock implementation of a crypto wallet service
// In a real application, this would integrate with actual cryptocurrency APIs

export interface WalletBalance {
  currency: string
  amount: number
}

export interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "purchase"
  amount: number
  currency: string
  timestamp: Date
  status: "pending" | "completed" | "failed"
  description?: string
}

// Mock user wallet data
const mockWalletData = {
  balances: [
    { currency: "USDT", amount: 250 },
    { currency: "BTC", amount: 0.005 },
    { currency: "ETH", amount: 0.1 },
  ],
  transactions: [
    {
      id: "tx1",
      type: "purchase",
      amount: 199,
      currency: "USDT",
      timestamp: new Date("2025-04-05"),
      status: "completed",
      description: "Purchase: Corporate Pro",
    },
    {
      id: "tx2",
      type: "deposit",
      amount: 500,
      currency: "USDT",
      timestamp: new Date("2025-04-01"),
      status: "completed",
      description: "Deposit",
    },
    {
      id: "tx3",
      type: "purchase",
      amount: 129,
      currency: "USDT",
      timestamp: new Date("2025-03-22"),
      status: "completed",
      description: "Purchase: BlogPress",
    },
  ],
}

export const getWalletBalances = async (): Promise<WalletBalance[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockWalletData.balances
}

export const getTransactionHistory = async (): Promise<Transaction[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockWalletData.transactions
}

export const depositFunds = async (amount: number, currency: string): Promise<Transaction> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newTransaction: Transaction = {
    id: `tx${Date.now()}`,
    type: "deposit",
    amount,
    currency,
    timestamp: new Date(),
    status: "completed",
    description: "Deposit",
  }

  return newTransaction
}

export const withdrawFunds = async (amount: number, currency: string, address: string): Promise<Transaction> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newTransaction: Transaction = {
    id: `tx${Date.now()}`,
    type: "withdrawal",
    amount,
    currency,
    timestamp: new Date(),
    status: "completed",
    description: `Withdrawal to ${address.substring(0, 8)}...`,
  }

  return newTransaction
}

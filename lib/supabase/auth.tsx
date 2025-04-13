"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "./client"

type User = {
  id: string
  email: string
  name: string
  referralCode: string
  referredBy?: string
  solanaUsdtAddress?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache for storing user data
let userCache: User | null = null

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize authentication on load
  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        // If we already have a user cache, use it immediately
        if (userCache) {
          setUser(userCache)
          setIsLoading(false)
          return
        }

        const { data } = await supabaseClient.auth.getSession()

        if (data.session?.user) {
          // Use a single query to get user data
          const { data: userData, error } = await supabaseClient
            .from("users")
            .select("id, email, name, referral_code, referred_by, solana_usdt_address")
            .eq("id", data.session.user.id)
            .single()

          if (userData && !error) {
            const formattedUser = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              referralCode: userData.referral_code,
              referredBy: userData.referred_by || undefined,
              solanaUsdtAddress: userData.solana_usdt_address || undefined,
            }

            // Update cache and state
            userCache = formattedUser
            setUser(formattedUser)
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Set up listener for auth state changes
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Avoid making another request if we already have user data
        if (userCache && userCache.id === session.user.id) {
          setUser(userCache)
          return
        }

        try {
          const { data, error } = await supabaseClient
            .from("users")
            .select("id, email, name, referral_code, referred_by, solana_usdt_address")
            .eq("id", session.user.id)
            .single()

          if (data && !error) {
            const formattedUser = {
              id: data.id,
              email: data.email,
              name: data.name,
              referralCode: data.referral_code,
              referredBy: data.referred_by || undefined,
              solanaUsdtAddress: data.solana_usdt_address || undefined,
            }

            // Update cache and state
            userCache = formattedUser
            setUser(formattedUser)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else if (event === "SIGNED_OUT") {
        userCache = null
        setUser(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return {
          success: false,
          error: error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect" : error.message,
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Sign in error:", error)
      return { success: false, error: error.message || "Erreur lors de la connexion" }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await supabaseClient.auth.signOut()
      userCache = null
      router.push("/") // Redirect to home page after sign out
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={{ ...value } as AuthContextType}>{children}</AuthContext.Provider> 
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

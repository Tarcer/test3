"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
  referralCode: string
  referredBy?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, referralCode?: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful login
      const mockUser: User = {
        id: "user123",
        name: "John Doe",
        email: email,
        referralCode: "JOHN123",
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      setIsLoading(false)
      return true
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const register = async (name: string, email: string, password: string, referralCode?: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful registration
      const mockUser: User = {
        id: "user" + Date.now(),
        name: name,
        email: email,
        referralCode: name.toUpperCase().substring(0, 4) + Math.floor(Math.random() * 1000),
        referredBy: referralCode,
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      setIsLoading(false)
      return true
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

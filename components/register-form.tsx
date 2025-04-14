"use client"

import Link from "next/link"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { registerUser } from "@/lib/supabase/actions"

export default function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [solanaUsdtAddress, setSolanaUsdtAddress] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get referral code from URL on client side
    const ref = searchParams.get("ref")
    if (ref) {
      setReferralCode(ref)
    }
  }, [searchParams])

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas")
      return false
    }
    if (password.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères")
      return false
    }
    setPasswordError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!validatePassword()) {
      setIsLoading(false)
      return
    }

    try {
      const result = await registerUser({
        name,
        email,
        password,
        solanaUsdtAddress: solanaUsdtAddress || undefined,
        referredBy: referralCode || undefined,
      })

      if (result.success) {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Erreur d'inscription",
          description: result.error || "Une erreur est survenue lors de l'inscription",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-10">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input id="name" placeholder="Jean Dupont" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="nom@exemple.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="solana-usdt-address">Adresse USDT (Solana)</Label>
        <Input
          id="solana-usdt-address"
          placeholder="Adresse de portefeuille USDT sur Solana"
          value={solanaUsdtAddress}
          onChange={(e) => setSolanaUsdtAddress(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Votre adresse de portefeuille USDT sur la blockchain Solana pour recevoir vos retraits
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={validatePassword}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
        <Input
          id="confirm-password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={validatePassword}
        />
        {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="referral-code">Code de parrainage (optionnel)</Label>
        <Input
          id="referral-code"
          placeholder="Entrez un code de parrainage si vous en avez un"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Si vous avez été invité par un membre, entrez son code de parrainage ici
        </p>
      </div>
      {referralCode && (
        <div className="rounded-md bg-muted p-3">
          <p className="text-sm">
            Vous vous inscrivez avec le code de parrainage: <strong>{referralCode}</strong>
          </p>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" required />
        <Label htmlFor="terms" className="text-sm">
          J&apos;accepte les{" "}
          <Link href="/terms" className="text-primary underline">
            conditions d&apos;utilisation
          </Link>{" "}
          et la{" "}
          <Link href="/privacy" className="text-primary underline">
            politique de confidentialité
          </Link>
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Création du compte..." : "Créer un compte"}
      </Button>
    </form>
  )
}

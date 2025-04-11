"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EarningsGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [customUserId, setCustomUserId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleGenerateForUser = async () => {
    if (!selectedUserId && !customUserId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner ou saisir un ID utilisateur",
        variant: "destructive",
      })
      return
    }

    const userId = selectedUserId || customUserId

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/generate-daily-earnings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, date }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast({
          title: "Succès",
          description: data.message || "Revenus générés avec succès",
        })
      } else {
        throw new Error(data.error || "Une erreur est survenue")
      }
    } catch (error: any) {
      console.error("Error generating earnings:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la génération des revenus",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateForPeriod = async () => {
    if (!selectedUserId && !customUserId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner ou saisir un ID utilisateur",
        variant: "destructive",
      })
      return
    }

    const userId = selectedUserId || customUserId

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "Erreur",
        description: "La date de début doit être antérieure à la date de fin",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/generate-daily-earnings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, startDate, endDate }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast({
          title: "Succès",
          description: data.message || "Revenus générés avec succès pour la période",
        })
      } else {
        throw new Error(data.error || "Une erreur est survenue")
      }
    } catch (error: any) {
      console.error("Error generating earnings for period:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la génération des revenus",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateForAll = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/generate-daily-earnings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ generateForAll: true }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast({
          title: "Succès",
          description: data.message || "Revenus générés avec succès pour tous les utilisateurs",
        })
      } else {
        throw new Error(data.error || "Une erreur est survenue")
      }
    } catch (error: any) {
      console.error("Error generating earnings for all users:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la génération des revenus",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Générateur de Revenus Quotidiens</h1>

      <Tabs defaultValue="user" className="space-y-6">
        <TabsList>
          <TabsTrigger value="user">Utilisateur Spécifique</TabsTrigger>
          <TabsTrigger value="period">Période</TabsTrigger>
          <TabsTrigger value="all">Tous les Utilisateurs</TabsTrigger>
        </TabsList>

        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>Générer des Revenus pour un Utilisateur</CardTitle>
              <CardDescription>
                Générer les revenus quotidiens pour un utilisateur spécifique à une date donnée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-id">ID Utilisateur</Label>
                <div className="flex gap-2">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user123">John Doe (user123)</SelectItem>
                      <SelectItem value="user456">Jane Smith (user456)</SelectItem>
                      <SelectItem value="custom">Personnalisé...</SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedUserId === "custom" && (
                    <Input
                      id="custom-user-id"
                      placeholder="Entrez l'ID utilisateur"
                      value={customUserId}
                      onChange={(e) => setCustomUserId(e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <Button onClick={handleGenerateForUser} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  "Générer les Revenus"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="period">
          <Card>
            <CardHeader>
              <CardTitle>Générer des Revenus pour une Période</CardTitle>
              <CardDescription>
                Générer les revenus quotidiens pour un utilisateur sur une période donnée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-id-period">ID Utilisateur</Label>
                <div className="flex gap-2">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user123">John Doe (user123)</SelectItem>
                      <SelectItem value="user456">Jane Smith (user456)</SelectItem>
                      <SelectItem value="custom">Personnalisé...</SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedUserId === "custom" && (
                    <Input
                      id="custom-user-id-period"
                      placeholder="Entrez l'ID utilisateur"
                      value={customUserId}
                      onChange={(e) => setCustomUserId(e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Date de début</Label>
                  <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">Date de fin</Label>
                  <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <Button onClick={handleGenerateForPeriod} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  "Générer les Revenus pour la Période"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Générer des Revenus pour Tous les Utilisateurs</CardTitle>
              <CardDescription>Générer les revenus quotidiens pour tous les utilisateurs (aujourd'hui)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription>
                  Cette opération peut prendre du temps si vous avez beaucoup d'utilisateurs. Elle générera les revenus
                  quotidiens pour tous les utilisateurs ayant des achats actifs.
                </AlertDescription>
              </Alert>

              <Button onClick={handleGenerateForAll} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  "Générer les Revenus pour Tous"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Résultat</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

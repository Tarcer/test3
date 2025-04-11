import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Package, History, User } from "lucide-react"

export const metadata: Metadata = {
  title: "Account Dashboard | WebCrypto Market",
  description: "Manage your account, view purchases, and check your wallet balance",
}

// This is a mock function - in a real app, this would check for authentication
const isAuthenticated = () => {
  // Mock authentication check - always returns true for demo
  return true
}

export default function AccountPage() {
  // In a real app, redirect unauthenticated users to login
  if (!isAuthenticated()) {
    redirect("/account/login")
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account, view purchases, and check your wallet balance
          </p>
        </div>

        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Your Wallet
                </CardTitle>
                <CardDescription>Manage your crypto wallet and funds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <div className="text-2xl font-bold">250.00 USDT</div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button>Deposit Funds</Button>
                      <Button variant="outline">Withdraw</Button>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="mb-2 font-medium">Deposit Address</h3>
                      <p className="break-all text-sm text-muted-foreground">
                        0x7F367cC41522cE07553e823bf3be79A889DEbe1B
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Your Purchases
                </CardTitle>
                <CardDescription>View and download your purchased templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">Corporate Pro</h3>
                        <p className="text-sm text-muted-foreground">Purchased on April 5, 2025</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">BlogPress</h3>
                        <p className="text-sm text-muted-foreground">Purchased on March 22, 2025</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
                <CardDescription>View your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">Purchase: Corporate Pro</h3>
                        <p className="text-sm text-muted-foreground">April 5, 2025</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-500">-199.00 USDT</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">Deposit</h3>
                        <p className="text-sm text-muted-foreground">April 1, 2025</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-500">+500.00 USDT</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">Purchase: BlogPress</h3>
                        <p className="text-sm text-muted-foreground">March 22, 2025</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-500">-129.00 USDT</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium">Name</h3>
                      <p className="text-muted-foreground">John Doe</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Email</h3>
                      <p className="text-muted-foreground">john.doe@example.com</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Member Since</h3>
                      <p className="text-muted-foreground">March 15, 2025</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Account Type</h3>
                      <p className="text-muted-foreground">Standard</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Edit Profile</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

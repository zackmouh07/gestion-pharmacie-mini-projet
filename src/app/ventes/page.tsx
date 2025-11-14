"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Receipt, TrendingUp, ShoppingCart, Package, Loader2, Moon, Sun, User as UserIcon, LogOut, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useSession, authClient } from "@/lib/auth-client"
import Link from "next/link"

interface Vente {
  id: number
  medicamentId: number
  nomMedicament: string
  quantiteVendue: number
  prixUnitaire: number
  prixTotal: number
  nomClient: string | null
  dateVente: string
  createdAt: string
  updatedAt: string
}

export default function VentesPage() {
  const router = useRouter()
  const { data: session, isPending: sessionLoading, refetch } = useSession()
  const [ventes, setVentes] = useState<Vente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  // Check authentication
  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login")
    }
  }, [session, sessionLoading, router])

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    setDarkMode(shouldBeDark)
    document.documentElement.classList.toggle("dark", shouldBeDark)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle("dark", newDarkMode)
    localStorage.setItem("theme", newDarkMode ? "dark" : "light")
  }

  const fetchVentes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ventes")
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des ventes")
      }
      const data = await response.json()
      setVentes(data)
    } catch (error) {
      console.error("Error fetching ventes:", error)
      toast.error("Erreur lors du chargement des ventes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVentes()
  }, [])

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token")
    
    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })
    
    if (error?.code) {
      toast.error("Erreur lors de la déconnexion")
    } else {
      localStorage.removeItem("bearer_token")
      refetch()
      toast.success("Déconnexion réussie")
      router.push("/login")
    }
  }

  const calculateStats = () => {
    const totalVentes = ventes.length
    const totalRevenue = ventes.reduce((sum, vente) => sum + vente.prixTotal, 0)
    const totalUnitsVendues = ventes.reduce((sum, vente) => sum + vente.quantiteVendue, 0)
    
    // Get unique medications sold
    const uniqueMedicaments = new Set(ventes.map(v => v.medicamentId))
    const medicamentsDifferents = uniqueMedicaments.size

    // Group ventes by date for trend analysis
    const ventesToday = ventes.filter(v => {
      const venteDate = new Date(v.dateVente)
      const today = new Date()
      return venteDate.toDateString() === today.toDateString()
    })
    const revenueDuJour = ventesToday.reduce((sum, v) => sum + v.prixTotal, 0)
    
    return {
      totalVentes,
      totalRevenue,
      totalUnitsVendues,
      medicamentsDifferents,
      revenueDuJour,
    }
  }

  const stats = calculateStats()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price) + " DA"
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-chart-2/5">
      <div className="container mx-auto py-8 px-4 max-w-[1600px]">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/">
                <Button variant="outline" size="icon" className="rounded-full transition-all-smooth hover:scale-110">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-2 via-chart-3 to-chart-2 bg-clip-text text-transparent">
                📊 Historique des Ventes
              </h1>
            </div>
            <p className="text-muted-foreground text-lg ml-14">
              Consultez toutes vos ventes et statistiques
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <UserIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{session.user.name}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full transition-all-smooth hover:scale-110"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="transition-all-smooth hover:scale-105 hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="overflow-hidden hover:shadow-lg transition-all-smooth animate-in fade-in slide-in-from-bottom-4 duration-500 border-l-4 border-l-chart-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ventes</CardTitle>
              <div className="p-2 rounded-full bg-chart-2/10">
                <Receipt className="h-4 w-4 text-chart-2" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-2">{stats.totalVentes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ventes enregistrées
              </p>
              <Progress value={100} className="mt-3 h-1 [&>div]:bg-chart-2" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-lg transition-all-smooth animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 border-l-4 border-l-chart-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
              <div className="p-2 rounded-full bg-chart-3/10">
                <TrendingUp className="h-4 w-4 text-chart-3" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-3">{formatPrice(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                chiffre d&apos;affaires
              </p>
              <Progress value={85} className="mt-3 h-1 [&>div]:bg-chart-3" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-lg transition-all-smooth animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unités Vendues</CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalUnitsVendues}</div>
              <p className="text-xs text-muted-foreground mt-1">
                unités au total
              </p>
              <Progress value={70} className="mt-3 h-1 [&>div]:bg-primary" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-lg transition-all-smooth animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 border-l-4 border-l-chart-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenu du Jour</CardTitle>
              <div className="p-2 rounded-full bg-chart-4/10">
                <Calendar className="h-4 w-4 text-chart-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-4">{formatPrice(stats.revenueDuJour)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                aujourd&apos;hui
              </p>
              <Progress value={60} className="mt-3 h-1 [&>div]:bg-chart-4" />
            </CardContent>
          </Card>
        </div>

        {/* Ventes Table */}
        <Card className="overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
          <CardHeader className="bg-gradient-to-r from-chart-2/5 via-transparent to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Receipt className="h-6 w-6 text-chart-2" />
                  Liste des ventes
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {ventes.length} vente(s) enregistrée(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : ventes.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
                <p className="text-muted-foreground text-lg">
                  Aucune vente enregistrée pour le moment
                </p>
                <Link href="/">
                  <Button className="mt-4 transition-all-smooth hover:scale-105">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour au dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/70">
                      <TableHead className="w-[80px] font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Médicament</TableHead>
                      <TableHead className="font-semibold">Client</TableHead>
                      <TableHead className="font-semibold">Quantité</TableHead>
                      <TableHead className="font-semibold">Prix Unitaire</TableHead>
                      <TableHead className="font-semibold">Prix Total</TableHead>
                      <TableHead className="font-semibold">Date de vente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ventes.map((vente, index) => (
                      <TableRow
                        key={vente.id}
                        className="transition-all-smooth hover:bg-muted/30 animate-in fade-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium">#{vente.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{vente.nomMedicament}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {vente.nomClient ? (
                            <span className="font-medium">{vente.nomClient}</span>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Anonyme
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">
                            {vente.quantiteVendue} unités
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground">
                          {formatPrice(vente.prixUnitaire)}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-chart-2 text-lg">
                            {formatPrice(vente.prixTotal)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(vente.dateVente)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
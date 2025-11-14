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
import { Input } from "@/components/ui/input"
import { MedicationDialog } from "@/components/MedicationDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, Pencil, Trash2, Loader2, Package, AlertTriangle, TrendingUp, ShoppingCart, Moon, Sun, Activity, LogOut, User, Receipt } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { authClient, useSession } from "@/lib/auth-client"
import { VenteDialog } from "@/components/VenteDialog"
import Link from "next/link"

interface Medication {
  id: number
  nom: string
  prix: number
  quantite: number
  dateExpiration: string
  createdAt: string
  updatedAt: string
}

type FilterStatus = "all" | "expired" | "low-stock" | "in-stock"

export function PharmacyDashboard() {
  const router = useRouter()
  const { data: session, isPending: sessionLoading, refetch } = useSession()
  
  const [medications, setMedications] = useState<Medication[]>([])
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [venteDialogOpen, setVenteDialogOpen] = useState(false)

  // Check authentication
  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login")
    }
  }, [session, sessionLoading, router])

  useEffect(() => {
    // Check for saved theme preference or default to system
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

  const fetchMedications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/medicaments")
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des médicaments")
      }
      const data = await response.json()
      setMedications(data)
      setFilteredMedications(data)
    } catch (error) {
      console.error("Error fetching medications:", error)
      toast.error("Erreur lors du chargement des médicaments")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMedications()
  }, [])

  useEffect(() => {
    let filtered = medications

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((med) =>
        med.nom.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((med) => {
        const status = getMedicationStatus(med)
        return status === filterStatus
      })
    }

    setFilteredMedications(filtered)
  }, [searchQuery, filterStatus, medications])

  const getMedicationStatus = (medication: Medication): FilterStatus => {
    const today = new Date()
    const expirationDate = new Date(medication.dateExpiration)
    
    if (expirationDate < today) {
      return "expired"
    }
    if (medication.quantite === 0) {
      return "expired"
    }
    if (medication.quantite < 20) {
      return "low-stock"
    }
    return "in-stock"
  }

  const getStatusBadge = (medication: Medication) => {
    const today = new Date()
    const expirationDate = new Date(medication.dateExpiration)
    
    if (expirationDate < today) {
      return <Badge variant="destructive" className="gap-1 animate-pulse-glow"><AlertTriangle className="h-3 w-3" />Expiré</Badge>
    }
    if (medication.quantite === 0) {
      return <Badge variant="destructive" className="animate-pulse-glow">Épuisé</Badge>
    }
    if (medication.quantite < 20) {
      return <Badge variant="outline" className="border-orange-500 text-orange-700 dark:text-orange-400">Stock faible</Badge>
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">En stock</Badge>
  }

  const calculateStats = () => {
    const total = medications.length
    const expired = medications.filter((med) => {
      const today = new Date()
      const expirationDate = new Date(med.dateExpiration)
      return expirationDate < today || med.quantite === 0
    }).length
    const lowStock = medications.filter((med) => med.quantite > 0 && med.quantite < 20).length
    const inStock = medications.filter((med) => {
      const today = new Date()
      const expirationDate = new Date(med.dateExpiration)
      return expirationDate >= today && med.quantite >= 20
    }).length
    const totalValue = medications.reduce((sum, med) => sum + (med.prix * med.quantite), 0)
    
    return { total, expired, lowStock, inStock, totalValue }
  }

  const stats = calculateStats()

  // Calculate percentages for progress bars
  const inStockPercent = stats.total > 0 ? (stats.inStock / stats.total) * 100 : 0
  const lowStockPercent = stats.total > 0 ? (stats.lowStock / stats.total) * 100 : 0
  const expiredPercent = stats.total > 0 ? (stats.expired / stats.total) * 100 : 0

  const handleAddClick = () => {
    setSelectedMedication(null)
    setDialogOpen(true)
  }

  const handleEditClick = (medication: Medication) => {
    setSelectedMedication(medication)
    setDialogOpen(true)
  }

  const handleDeleteClick = (medication: Medication) => {
    setMedicationToDelete(medication)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!medicationToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/medicaments/${medicationToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }

      await fetchMedications()
      toast.success(`${medicationToDelete.nom} a été supprimé avec succès`)
      setDeleteDialogOpen(false)
      setMedicationToDelete(null)
    } catch (error) {
      console.error("Error deleting medication:", error)
      toast.error("Erreur lors de la suppression du médicament")
    } finally {
      setIsDeleting(false)
    }
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR")
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-8 px-4 max-w-[1600px]">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-chart-4 to-primary bg-clip-text text-transparent mb-2">
              🏥 Gestion de Pharmacie
            </h1>
            <p className="text-muted-foreground text-lg">
              Gérez facilement vos médicaments en temps réel
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <User className="h-4 w-4 text-primary" />
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
            <Link href="/ventes">
              <Button
                variant="outline"
                className="transition-all-smooth hover:scale-105 hover:bg-chart-2/10 hover:border-chart-2"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Historique
              </Button>
            </Link>
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

        {/* Statistics Cards with animations */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="overflow-hidden hover:shadow-lg transition-all-smooth animate-in fade-in slide-in-from-bottom-4 duration-500 border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Médicaments</CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                dans l&apos;inventaire
              </p>
              <Progress value={100} className="mt-3 h-1" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-lg transition-all-smooth animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 border-l-4 border-l-chart-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
              <div className="p-2 rounded-full bg-chart-2/10">
                <TrendingUp className="h-4 w-4 text-chart-2" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-2">{formatPrice(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                valeur du stock
              </p>
              <Progress value={75} className="mt-3 h-1" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-lg transition-all-smooth animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
              <div className="p-2 rounded-full bg-orange-500/10">
                <ShoppingCart className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.lowStock}</div>
              <p className="text-xs text-muted-foreground mt-1">
                nécessite réapprovisionnement
              </p>
              <Progress value={lowStockPercent} className="mt-3 h-1 [&>div]:bg-orange-500" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-lg transition-all-smooth animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 border-l-4 border-l-destructive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes Critiques</CardTitle>
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.expired}</div>
              <p className="text-xs text-muted-foreground mt-1">
                expirés ou épuisés
              </p>
              <Progress value={expiredPercent} className="mt-3 h-1 [&>div]:bg-destructive" />
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  Liste des médicaments
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {filteredMedications.length} médicament(s) affiché(s)
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setVenteDialogOpen(true)} 
                  variant="outline"
                  className="sm:w-auto bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/30 hover:border-chart-2 text-chart-2 transition-all-smooth hover:scale-105 shadow-lg"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Nouvelle vente
                </Button>
                <Button onClick={handleAddClick} className="sm:w-auto bg-primary hover:bg-primary/90 transition-all-smooth hover:scale-105 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un médicament
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un médicament par nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-all-smooth focus:ring-2 focus:ring-primary"
                />
              </div>

              <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all" className="transition-all-smooth">Tous</TabsTrigger>
                  <TabsTrigger value="in-stock" className="transition-all-smooth">En stock</TabsTrigger>
                  <TabsTrigger value="low-stock" className="transition-all-smooth">Stock faible</TabsTrigger>
                  <TabsTrigger value="expired" className="transition-all-smooth">Critiques</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredMedications.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
                <p className="text-muted-foreground text-lg">
                  {searchQuery || filterStatus !== "all"
                    ? "Aucun médicament trouvé pour cette recherche"
                    : "Aucun médicament dans la base de données"}
                </p>
                {!searchQuery && filterStatus === "all" && (
                  <Button onClick={handleAddClick} className="mt-4 transition-all-smooth hover:scale-105">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter le premier médicament
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/70">
                      <TableHead className="w-[80px] font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Nom</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Prix</TableHead>
                      <TableHead className="font-semibold">Quantité</TableHead>
                      <TableHead className="font-semibold">Date d&apos;expiration</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedications.map((medication, index) => (
                      <TableRow 
                        key={medication.id} 
                        className="transition-all-smooth hover:bg-muted/30 animate-in fade-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium">{medication.id}</TableCell>
                        <TableCell className="font-semibold">{medication.nom}</TableCell>
                        <TableCell>{getStatusBadge(medication)}</TableCell>
                        <TableCell className="font-medium">{formatPrice(medication.prix)}</TableCell>
                        <TableCell>
                          <span
                            className={
                              medication.quantite === 0
                                ? "text-destructive font-semibold"
                                : medication.quantite < 20
                                ? "text-orange-600 font-semibold"
                                : "font-medium"
                            }
                          >
                            {medication.quantite} unités
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(medication.dateExpiration)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditClick(medication)}
                              className="transition-all-smooth hover:scale-110 hover:bg-primary/10 hover:border-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteClick(medication)}
                              className="transition-all-smooth hover:scale-110 hover:bg-destructive/10 hover:border-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <MedicationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          medication={selectedMedication}
          onSuccess={fetchMedications}
        />

        <VenteDialog
          open={venteDialogOpen}
          onOpenChange={setVenteDialogOpen}
          medications={medications}
          onSuccess={fetchMedications}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="animate-in fade-in zoom-in-95 duration-300">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirmer la suppression
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le médicament{" "}
                <strong>{medicationToDelete?.nom}</strong> ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} className="transition-all-smooth hover:scale-105">Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all-smooth hover:scale-105"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
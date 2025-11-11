"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Loader2, UserPlus, Pill } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    password: "",
    confirmPassword: "",
  })
  const [generatedUsername, setGeneratedUsername] = useState("")

  const generateUsername = (nom: string, prenom: string) => {
    const username = (nom + prenom).toLowerCase().replace(/\s+/g, "")
    setGeneratedUsername(username)
    return username
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === "nom" || field === "prenom") {
      const updatedData = { ...formData, [field]: value }
      if (updatedData.nom && updatedData.prenom) {
        generateUsername(updatedData.nom, updatedData.prenom)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nom || !formData.prenom) {
      toast.error("Veuillez entrer votre nom et prénom")
      return
    }

    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    setIsLoading(true)
    const username = generateUsername(formData.nom, formData.prenom)

    try {
      const { data, error } = await authClient.signUp.email({
        email: `${username}@pharmacy.local`,
        name: `${formData.prenom} ${formData.nom}`,
        password: formData.password,
      })

      if (error?.code) {
        const errorMap: Record<string, string> = {
          USER_ALREADY_EXISTS: "Ce compte existe déjà",
        }
        toast.error(errorMap[error.code] || "Erreur lors de l'inscription")
        return
      }

      toast.success("Compte créé avec succès!")
      router.push("/login?registered=true")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-chart-4/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="space-y-3 pb-8 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary to-chart-4 shadow-lg">
              <Pill className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary via-chart-4 to-primary bg-clip-text text-transparent">
            Créer un compte
          </CardTitle>
          <CardDescription className="text-center text-base">
            Inscription au système de gestion de pharmacie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-base font-semibold">
                  Nom
                </Label>
                <Input
                  id="nom"
                  type="text"
                  placeholder="Dupont"
                  value={formData.nom}
                  onChange={(e) => handleInputChange("nom", e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-12 text-base transition-all-smooth focus:ring-2 focus:ring-primary"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-base font-semibold">
                  Prénom
                </Label>
                <Input
                  id="prenom"
                  type="text"
                  placeholder="Jean"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange("prenom", e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-12 text-base transition-all-smooth focus:ring-2 focus:ring-primary"
                  autoComplete="off"
                />
              </div>
            </div>

            {generatedUsername && (
              <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-lg animate-in slide-in-from-top-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Nom de compte généré :
                </p>
                <p className="text-lg font-bold text-primary">
                  {generatedUsername}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Utilisez ce nom pour vous connecter
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 caractères"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isLoading}
                required
                className="h-12 text-base transition-all-smooth focus:ring-2 focus:ring-primary"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-semibold">
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Retapez votre mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                disabled={isLoading}
                required
                className="h-12 text-base transition-all-smooth focus:ring-2 focus:ring-primary"
                autoComplete="off"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 transition-all-smooth hover:scale-[1.02] shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Créer mon compte
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Déjà inscrit ?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base transition-all-smooth hover:scale-[1.02] hover:bg-primary/5"
            onClick={() => router.push("/login")}
            disabled={isLoading}
          >
            Se connecter
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

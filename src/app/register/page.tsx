"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Loader2, User, Lock, UserPlus, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    password: "",
    confirmPassword: "",
  })
  const [generatedUsername, setGeneratedUsername] = useState("")

  useEffect(() => {
    // Generate username automatically when firstname or lastname changes
    const username = (formData.firstname.toLowerCase() + formData.lastname.toLowerCase()).replace(/\s+/g, "")
    setGeneratedUsername(username)
  }, [formData.firstname, formData.lastname])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstname || !formData.lastname) {
      toast.error("Veuillez remplir tous les champs obligatoires")
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

    try {
      const fullName = `${formData.firstname} ${formData.lastname}`
      const email = `${generatedUsername}@pharmacy.local`

      const { error } = await authClient.signUp.email({
        email: email,
        name: fullName,
        password: formData.password,
      })

      if (error?.code) {
        if (error.code === "USER_ALREADY_EXISTS") {
          toast.error("Ce nom de compte existe déjà. Veuillez choisir un autre nom.")
        } else {
          toast.error("Erreur lors de l'inscription")
        }
        setIsLoading(false)
        return
      }

      toast.success("Compte créé avec succès !")
      setTimeout(() => {
        router.push("/login?registered=true")
      }, 1000)
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Une erreur s'est produite lors de l'inscription")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-500 border-t-4 border-t-primary">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-chart-4 rounded-full flex items-center justify-center mb-2 animate-pulse-glow">
            <UserPlus className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-chart-4 to-primary bg-clip-text text-transparent">
            Inscription
          </CardTitle>
          <CardDescription className="text-base">
            Créez votre compte pour accéder au système de gestion
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="firstname" className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Prénom
              </Label>
              <Input
                id="firstname"
                type="text"
                placeholder="Entrez votre prénom"
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                disabled={isLoading}
                required
                className="transition-all-smooth focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastname" className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Nom
              </Label>
              <Input
                id="lastname"
                type="text"
                placeholder="Entrez votre nom"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                disabled={isLoading}
                required
                className="transition-all-smooth focus:ring-2 focus:ring-primary"
              />
            </div>

            {generatedUsername && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-muted-foreground mb-1">Nom de compte généré :</p>
                <p className="text-base font-semibold text-primary">{generatedUsername}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 caractères"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                required
                autoComplete="off"
                className="transition-all-smooth focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={isLoading}
                required
                autoComplete="off"
                className="transition-all-smooth focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 transition-all-smooth hover:scale-105 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Vous avez déjà un compte ? </span>
              <Link 
                href="/login" 
                className="text-primary font-semibold hover:underline transition-all-smooth"
              >
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
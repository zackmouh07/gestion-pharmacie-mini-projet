"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Loader2, LogIn, Pill } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  })

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("Inscription réussie! Connectez-vous maintenant.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username || !formData.password) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await authClient.signIn.email({
        email: `${formData.username}@pharmacy.local`,
        password: formData.password,
        rememberMe: formData.rememberMe,
        callbackURL: "/"
      })

      if (error?.code) {
        toast.error("Nom de compte ou mot de passe incorrect. Veuillez vérifier vos informations.")
        return
      }

      toast.success("Connexion réussie!")
      router.push("/")
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Une erreur est survenue lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-chart-4/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-2xl border-0 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="space-y-3 pb-8 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary to-chart-4 shadow-lg">
              <Pill className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary via-chart-4 to-primary bg-clip-text text-transparent">
            Connexion
          </CardTitle>
          <CardDescription className="text-center text-base">
            Accédez au système de gestion de pharmacie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-semibold">
                Nom de compte
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="dupontjean"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={isLoading}
                required
                className="h-12 text-base transition-all-smooth focus:ring-2 focus:ring-primary"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Format: nom + prénom (sans espace)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Votre mot de passe"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                required
                className="h-12 text-base transition-all-smooth focus:ring-2 focus:ring-primary"
                autoComplete="off"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, rememberMe: checked as boolean })
                }
                disabled={isLoading}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Se souvenir de moi
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 transition-all-smooth hover:scale-[1.02] shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Se connecter
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
                Pas encore de compte ?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base transition-all-smooth hover:scale-[1.02] hover:bg-primary/5"
            onClick={() => router.push("/register")}
            disabled={isLoading}
          >
            Créer un compte
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

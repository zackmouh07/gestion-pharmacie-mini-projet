"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Loader2, User, Lock, LogIn, ArrowRight } from "lucide-react"
import Link from "next/link"

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
      toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.")
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
      const email = `${formData.username}@pharmacy.local`

      const { error } = await authClient.signIn.email({
        email: email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        callbackURL: "/",
      })

      if (error?.code) {
        toast.error("Nom de compte ou mot de passe incorrect. Veuillez vérifier vos informations.")
        setIsLoading(false)
        return
      }

      toast.success("Connexion réussie !")
      
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 500)
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Une erreur s'est produite lors de la connexion")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-500 border-t-4 border-t-primary">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-chart-4 rounded-full flex items-center justify-center mb-2 animate-pulse-glow">
            <LogIn className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-chart-4 to-primary bg-clip-text text-transparent">
            Connexion
          </CardTitle>
          <CardDescription className="text-base">
            Connectez-vous à votre compte pour accéder au système
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Nom de compte
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Ex: dupontjean"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={isLoading}
                required
                className="transition-all-smooth focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Format: prénom + nom (sans espaces, en minuscules)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                required
                autoComplete="off"
                className="transition-all-smooth focus:ring-2 focus:ring-primary"
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
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Vous n&apos;avez pas de compte ? </span>
              <Link 
                href="/register" 
                className="text-primary font-semibold hover:underline transition-all-smooth"
              >
                Créer un compte
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
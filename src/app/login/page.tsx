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
import { Loader2, User, Lock, LogIn, ArrowRight, Pill, Sparkles, Moon, Sun } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  })

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    setDarkMode(shouldBeDark)
    document.documentElement.classList.toggle("dark", shouldBeDark)
  }, [])

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.")
    }
  }, [searchParams])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle("dark", newDarkMode)
    localStorage.setItem("theme", newDarkMode ? "dark" : "light")
  }

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-chart-4/5 to-chart-2/5 animate-gradient-slow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      {/* Dark Mode Toggle - Floating Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 z-50 rounded-full transition-all-smooth hover:scale-110 shadow-lg glass-effect"
      >
        {darkMode ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-primary" />
        )}
      </Button>

      {/* Floating Pills Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Pill className="absolute top-20 left-10 w-8 h-8 text-primary/10 animate-float" style={{ animationDelay: "0s" }} />
        <Pill className="absolute top-40 right-20 w-6 h-6 text-chart-4/10 animate-float" style={{ animationDelay: "1s" }} />
        <Pill className="absolute bottom-32 left-1/4 w-10 h-10 text-chart-2/10 animate-float" style={{ animationDelay: "2s" }} />
        <Pill className="absolute bottom-20 right-1/3 w-7 h-7 text-primary/10 animate-float" style={{ animationDelay: "1.5s" }} />
        <Sparkles className="absolute top-1/4 right-1/4 w-5 h-5 text-chart-4/20 animate-pulse" />
        <Sparkles className="absolute bottom-1/3 left-1/3 w-6 h-6 text-primary/20 animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      <Card className="w-full max-w-md relative z-10 glass-effect shadow-2xl animate-in fade-in zoom-in-95 duration-700 border-2 hover:shadow-primary/20 transition-all-smooth">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-4/5 rounded-lg pointer-events-none" />
        
        <CardHeader className="space-y-3 text-center pb-8 relative">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary via-chart-4 to-chart-2 rounded-2xl flex items-center justify-center mb-3 shadow-lg animate-pulse-glow relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
            <LogIn className="h-10 w-10 text-primary-foreground relative z-10" />
          </div>
          
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-chart-4 to-primary bg-clip-text text-transparent animate-gradient">
            Connexion
          </CardTitle>
          
          <CardDescription className="text-base text-muted-foreground/80">
            Bienvenue dans votre système de gestion pharmaceutique
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 relative">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2 text-sm font-semibold">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
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
                className="h-12 transition-all-smooth focus:ring-2 focus:ring-primary focus:scale-[1.01] bg-background/50 backdrop-blur-sm"
              />
              <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-primary/50" />
                Format: prénom + nom (sans espaces, en minuscules)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                required
                autoComplete="off"
                className="h-12 transition-all-smooth focus:ring-2 focus:ring-primary focus:scale-[1.01] bg-background/50 backdrop-blur-sm"
              />
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50 hover:bg-muted/50 transition-all-smooth">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, rememberMe: checked as boolean })
                }
                disabled={isLoading}
                className="border-2"
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none cursor-pointer select-none flex-1"
              >
                Se souvenir de moi pendant 30 jours
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-5 pt-2 relative">
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary via-chart-4 to-primary bg-size-200 animate-gradient hover:shadow-lg hover:shadow-primary/30 transition-all-smooth hover:scale-105 text-base font-semibold relative overflow-hidden group"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">
                  Nouveau sur la plateforme ?
                </span>
              </div>
            </div>

            <Link 
              href="/register" 
              className="w-full group"
            >
              <div className="w-full h-12 rounded-lg border-2 border-primary/30 hover:border-primary flex items-center justify-center gap-2 transition-all-smooth hover:bg-primary/5 hover:scale-105">
                <span className="text-sm font-semibold text-primary">Créer un compte</span>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
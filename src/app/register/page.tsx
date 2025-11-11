"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Loader2, User, Lock, UserPlus, ArrowRight, Pill, Sparkles, CheckCircle2 } from "lucide-react"
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
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    const username = (formData.firstname.toLowerCase() + formData.lastname.toLowerCase()).replace(/\s+/g, "")
    setGeneratedUsername(username)
  }, [formData.firstname, formData.lastname])

  useEffect(() => {
    // Calculate password strength
    let strength = 0
    if (formData.password.length >= 8) strength++
    if (formData.password.length >= 12) strength++
    if (/[A-Z]/.test(formData.password)) strength++
    if (/[0-9]/.test(formData.password)) strength++
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++
    setPasswordStrength(Math.min(strength, 4))
  }, [formData.password])

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

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-muted"
    if (passwordStrength <= 1) return "bg-destructive"
    if (passwordStrength === 2) return "bg-chart-5"
    if (passwordStrength === 3) return "bg-chart-2"
    return "bg-chart-3"
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return ""
    if (passwordStrength <= 1) return "Faible"
    if (passwordStrength === 2) return "Moyen"
    if (passwordStrength === 3) return "Bon"
    return "Excellent"
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 via-primary/5 to-chart-4/5 animate-gradient-slow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,198,150,0.1),rgba(255,255,255,0))]" />
      
      {/* Floating Pills Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Pill className="absolute top-16 right-12 w-8 h-8 text-chart-2/10 animate-float" style={{ animationDelay: "0s" }} />
        <Pill className="absolute top-1/3 left-16 w-6 h-6 text-primary/10 animate-float" style={{ animationDelay: "1.5s" }} />
        <Pill className="absolute bottom-24 right-1/4 w-10 h-10 text-chart-4/10 animate-float" style={{ animationDelay: "2s" }} />
        <Pill className="absolute bottom-32 left-1/4 w-7 h-7 text-chart-2/10 animate-float" style={{ animationDelay: "1s" }} />
        <Sparkles className="absolute top-1/4 left-1/4 w-5 h-5 text-primary/20 animate-pulse" />
        <Sparkles className="absolute bottom-1/4 right-1/3 w-6 h-6 text-chart-2/20 animate-pulse" style={{ animationDelay: "0.7s" }} />
      </div>

      <Card className="w-full max-w-md relative z-10 glass-effect shadow-2xl animate-in fade-in zoom-in-95 duration-700 border-2 hover:shadow-chart-2/20 transition-all-smooth">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 via-transparent to-primary/5 rounded-lg pointer-events-none" />
        
        <CardHeader className="space-y-3 text-center pb-8 relative">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-chart-2 via-primary to-chart-4 rounded-2xl flex items-center justify-center mb-3 shadow-lg animate-pulse-glow relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
            <UserPlus className="h-10 w-10 text-primary-foreground relative z-10" />
          </div>
          
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-chart-2 via-primary to-chart-4 bg-clip-text text-transparent animate-gradient">
            Inscription
          </CardTitle>
          
          <CardDescription className="text-base text-muted-foreground/80">
            Rejoignez le système de gestion pharmaceutique
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="flex items-center gap-2 text-sm font-semibold">
                  <div className="w-5 h-5 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <User className="h-3 w-3 text-chart-2" />
                  </div>
                  Prénom
                </Label>
                <Input
                  id="firstname"
                  type="text"
                  placeholder="Jean"
                  value={formData.firstname}
                  onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                  disabled={isLoading}
                  required
                  className="h-11 transition-all-smooth focus:ring-2 focus:ring-chart-2 focus:scale-[1.01] bg-background/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastname" className="flex items-center gap-2 text-sm font-semibold">
                  <div className="w-5 h-5 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <User className="h-3 w-3 text-chart-2" />
                  </div>
                  Nom
                </Label>
                <Input
                  id="lastname"
                  type="text"
                  placeholder="Dupont"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  disabled={isLoading}
                  required
                  className="h-11 transition-all-smooth focus:ring-2 focus:ring-chart-2 focus:scale-[1.01] bg-background/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {generatedUsername && (
              <div className="p-4 bg-gradient-to-r from-chart-2/10 via-primary/5 to-chart-4/10 border-2 border-chart-2/30 rounded-xl animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                <div className="flex items-center gap-2 mb-1 relative z-10">
                  <CheckCircle2 className="w-4 h-4 text-chart-2" />
                  <p className="text-xs font-semibold text-chart-2">Nom de compte généré automatiquement</p>
                </div>
                <p className="text-lg font-bold text-primary relative z-10">{generatedUsername}</p>
                <p className="text-xs text-muted-foreground mt-1 relative z-10">Utilisez ce nom pour vous connecter</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold">
                <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="h-3 w-3 text-primary" />
                </div>
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
                className="h-11 transition-all-smooth focus:ring-2 focus:ring-primary focus:scale-[1.01] bg-background/50 backdrop-blur-sm"
              />
              
              {formData.password && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Force du mot de passe</span>
                    <span className={`font-semibold ${passwordStrength <= 1 ? 'text-destructive' : passwordStrength === 2 ? 'text-chart-5' : passwordStrength === 3 ? 'text-chart-2' : 'text-chart-3'}`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all-smooth ${
                          i < passwordStrength ? getStrengthColor() : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold">
                <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="h-3 w-3 text-primary" />
                </div>
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Répétez votre mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={isLoading}
                required
                autoComplete="off"
                className="h-11 transition-all-smooth focus:ring-2 focus:ring-primary focus:scale-[1.01] bg-background/50 backdrop-blur-sm"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-5 pt-2 relative">
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-chart-2 via-primary to-chart-4 bg-size-200 animate-gradient hover:shadow-lg hover:shadow-chart-2/30 transition-all-smooth hover:scale-105 text-base font-semibold relative overflow-hidden group"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  Créer mon compte
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
                  Vous avez déjà un compte ?
                </span>
              </div>
            </div>

            <Link 
              href="/login" 
              className="w-full group"
            >
              <div className="w-full h-12 rounded-lg border-2 border-chart-2/30 hover:border-chart-2 flex items-center justify-center gap-2 transition-all-smooth hover:bg-chart-2/5 hover:scale-105">
                <span className="text-sm font-semibold text-chart-2">Se connecter</span>
                <ArrowRight className="h-4 w-4 text-chart-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
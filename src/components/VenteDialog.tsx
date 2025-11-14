"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, ShoppingCart, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface Medication {
  id: number
  nom: string
  prix: number
  quantite: number
  dateExpiration: string
}

interface VenteFormData {
  medicamentId: string
  quantiteVendue: number
  nomClient?: string
}

interface VenteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medications: Medication[]
  onSuccess: () => void
}

export function VenteDialog({
  open,
  onOpenChange,
  medications,
  onSuccess,
}: VenteDialogProps) {
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null)
  const [prixTotal, setPrixTotal] = useState(0)

  const form = useForm<VenteFormData>({
    defaultValues: {
      medicamentId: "",
      quantiteVendue: 1,
      nomClient: "",
    },
  })

  const watchMedicamentId = form.watch("medicamentId")
  const watchQuantite = form.watch("quantiteVendue")

  // Update selected medication and calculate total price
  useEffect(() => {
    if (watchMedicamentId) {
      const med = medications.find((m) => m.id === parseInt(watchMedicamentId))
      setSelectedMed(med || null)
      
      if (med && watchQuantite > 0) {
        setPrixTotal(med.prix * watchQuantite)
      } else {
        setPrixTotal(0)
      }
    } else {
      setSelectedMed(null)
      setPrixTotal(0)
    }
  }, [watchMedicamentId, watchQuantite, medications])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        medicamentId: "",
        quantiteVendue: 1,
        nomClient: "",
      })
      setSelectedMed(null)
      setPrixTotal(0)
    }
  }, [open, form])

  const onSubmit = async (data: VenteFormData) => {
    try {
      const response = await fetch("/api/ventes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicamentId: parseInt(data.medicamentId),
          quantiteVendue: data.quantiteVendue,
          nomClient: data.nomClient || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.error === "Stock insuffisant") {
          toast.error(`Stock insuffisant !`, {
            description: `Disponible: ${result.disponible} unités, Demandé: ${result.demande} unités`,
          })
        } else {
          throw new Error(result.error || "Une erreur est survenue")
        }
        return
      }

      toast.success("Vente enregistrée avec succès !", {
        description: `${data.quantiteVendue} unité(s) de ${selectedMed?.nom}`,
        duration: 3000,
      })

      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Error creating vente:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement de la vente"
      )
    }
  }

  // Filter available medications (in stock only)
  const availableMedications = medications.filter(
    (med) => med.quantite > 0 && new Date(med.dateExpiration) >= new Date()
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] animate-in fade-in zoom-in-95 duration-300">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 rounded-full bg-chart-2/10">
              <ShoppingCart className="h-5 w-5 text-chart-2" />
            </div>
            <span className="bg-gradient-to-r from-chart-2 to-chart-3 bg-clip-text text-transparent">
              Enregistrer une vente
            </span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Sélectionnez un médicament et indiquez la quantité vendue
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField
              control={form.control}
              name="medicamentId"
              rules={{
                required: "Veuillez sélectionner un médicament",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Médicament *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="transition-all-smooth focus:ring-2 focus:ring-primary">
                        <SelectValue placeholder="Sélectionnez un médicament" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableMedications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          Aucun médicament disponible
                        </div>
                      ) : (
                        availableMedications.map((med) => (
                          <SelectItem key={med.id} value={med.id.toString()}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <span className="font-medium">{med.nom}</span>
                              <span className="text-xs text-muted-foreground">
                                ({med.quantite} en stock)
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedMed && (
              <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Prix unitaire:</span>
                  <span className="font-bold text-primary">{selectedMed.prix.toFixed(2)} DA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stock disponible:</span>
                  <span className="font-semibold">{selectedMed.quantite} unités</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantiteVendue"
                rules={{
                  required: "La quantité est requise",
                  min: {
                    value: 1,
                    message: "La quantité doit être au moins 1",
                  },
                  max: selectedMed
                    ? {
                        value: selectedMed.quantite,
                        message: `Stock insuffisant (max: ${selectedMed.quantite})`,
                      }
                    : undefined,
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Quantité *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max={selectedMed?.quantite}
                        placeholder="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                        className="transition-all-smooth focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nomClient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Nom du client</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optionnel"
                        {...field}
                        className="transition-all-smooth focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {prixTotal > 0 && (
              <div className="p-4 bg-gradient-to-r from-chart-2/10 via-chart-3/5 to-chart-2/10 border-2 border-chart-2/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-chart-2" />
                    <span className="text-sm font-semibold text-chart-2">Prix total:</span>
                  </div>
                  <span className="text-2xl font-bold text-chart-2">
                    {prixTotal.toFixed(2)} DA
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
                className="transition-all-smooth hover:scale-105"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || availableMedications.length === 0}
                className="transition-all-smooth hover:scale-105 shadow-lg bg-chart-2 hover:bg-chart-2/90"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <ShoppingCart className="mr-2 h-4 w-4" />
                Enregistrer la vente
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
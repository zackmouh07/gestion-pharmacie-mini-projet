"use client"

import { useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Save, PlusCircle, Pill } from "lucide-react"
import { toast } from "sonner"

interface MedicationFormData {
  nom: string
  prix: number
  quantite: number
  dateExpiration: string
}

interface Medication {
  id: number
  nom: string
  prix: number
  quantite: number
  dateExpiration: string
}

interface MedicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medication?: Medication | null
  onSuccess: () => void
}

export function MedicationDialog({
  open,
  onOpenChange,
  medication,
  onSuccess,
}: MedicationDialogProps) {
  const isEditing = !!medication

  const form = useForm<MedicationFormData>({
    defaultValues: {
      nom: "",
      prix: 0,
      quantite: 0,
      dateExpiration: "",
    },
  })

  // Reset form when medication changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        nom: medication?.nom || "",
        prix: medication?.prix || 0,
        quantite: medication?.quantite || 0,
        dateExpiration: medication?.dateExpiration || "",
      })
    }
  }, [open, medication, form])

  const onSubmit = async (data: MedicationFormData) => {
    try {
      const url = isEditing
        ? `/api/medicaments/${medication.id}`
        : "/api/medicaments"

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Une erreur est survenue")
      }

      const result = await response.json()
      
      // Show success toast
      if (isEditing) {
        toast.success(`${data.nom} a été mis à jour avec succès`, {
          description: "Les informations du médicament ont été modifiées",
          duration: 3000,
        })
      } else {
        toast.success(`${data.nom} a été ajouté avec succès`, {
          description: "Le médicament est maintenant disponible dans l'inventaire",
          duration: 3000,
        })
      }

      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Error saving medication:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement",
        {
          description: "Veuillez vérifier les informations et réessayer"
        }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] animate-in fade-in zoom-in-95 duration-300">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {isEditing ? (
              <>
                <div className="p-2 rounded-full bg-primary/10">
                  <Save className="h-5 w-5 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
                  Modifier le médicament
                </span>
              </>
            ) : (
              <>
                <div className="p-2 rounded-full bg-chart-2/10">
                  <PlusCircle className="h-5 w-5 text-chart-2" />
                </div>
                <span className="bg-gradient-to-r from-chart-2 to-chart-3 bg-clip-text text-transparent">
                  Ajouter un médicament
                </span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isEditing
              ? "Modifiez les informations du médicament ci-dessous"
              : "Remplissez les informations pour ajouter un nouveau médicament à l'inventaire"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField
              control={form.control}
              name="nom"
              rules={{
                required: "Le nom est requis",
                minLength: {
                  value: 2,
                  message: "Le nom doit contenir au moins 2 caractères",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    Nom du médicament *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Paracétamol" 
                      {...field}
                      className="transition-all-smooth focus:ring-2 focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prix"
                rules={{
                  required: "Le prix est requis",
                  min: {
                    value: 0.01,
                    message: "Le prix doit être supérieur à 0",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Prix (€) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="5.50"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
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
                name="quantite"
                rules={{
                  required: "La quantité est requise",
                  min: {
                    value: 0,
                    message: "La quantité doit être positive ou nulle",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Quantité *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        className="transition-all-smooth focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dateExpiration"
              rules={{
                required: "La date d'expiration est requise",
                validate: (value) => {
                  const date = new Date(value)
                  return (
                    !isNaN(date.getTime()) || "Date invalide"
                  )
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Date d&apos;expiration *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      className="transition-all-smooth focus:ring-2 focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={form.formState.isSubmitting}
                className="transition-all-smooth hover:scale-105 shadow-lg bg-primary hover:bg-primary/90"
              >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Mettre à jour
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
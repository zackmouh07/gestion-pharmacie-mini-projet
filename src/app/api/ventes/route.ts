import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { ventes, medicaments } from "@/db/schema"
import { desc, sql } from "drizzle-orm"

// GET /api/ventes - Récupérer toutes les ventes
export async function GET(request: NextRequest) {
  try {
    const allVentes = await db
      .select()
      .from(ventes)
      .orderBy(desc(ventes.dateVente))

    return NextResponse.json(allVentes)
  } catch (error) {
    console.error("Error fetching ventes:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des ventes" },
      { status: 500 }
    )
  }
}

// POST /api/ventes - Créer une nouvelle vente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { medicamentId, quantiteVendue, nomClient } = body

    // Validation
    if (!medicamentId || !quantiteVendue) {
      return NextResponse.json(
        { error: "medicamentId et quantiteVendue sont requis" },
        { status: 400 }
      )
    }

    if (quantiteVendue <= 0) {
      return NextResponse.json(
        { error: "La quantité vendue doit être supérieure à 0" },
        { status: 400 }
      )
    }

    // Récupérer les informations du médicament
    const medicament = await db
      .select()
      .from(medicaments)
      .where(sql`${medicaments.id} = ${medicamentId}`)
      .limit(1)

    if (!medicament || medicament.length === 0) {
      return NextResponse.json(
        { error: "Médicament introuvable" },
        { status: 404 }
      )
    }

    const med = medicament[0]

    // Vérifier la disponibilité du stock
    if (med.quantite < quantiteVendue) {
      return NextResponse.json(
        { 
          error: "Stock insuffisant", 
          disponible: med.quantite,
          demande: quantiteVendue 
        },
        { status: 400 }
      )
    }

    // Calculer le prix total
    const prixTotal = med.prix * quantiteVendue
    const now = new Date().toISOString()

    // Créer la vente
    const newVente = await db
      .insert(ventes)
      .values({
        medicamentId: medicamentId,
        nomMedicament: med.nom,
        quantiteVendue: quantiteVendue,
        prixUnitaire: med.prix,
        prixTotal: prixTotal,
        nomClient: nomClient || null,
        dateVente: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    // Mettre à jour la quantité du médicament
    const nouvelleQuantite = med.quantite - quantiteVendue
    await db
      .update(medicaments)
      .set({
        quantite: nouvelleQuantite,
        updatedAt: now,
      })
      .where(sql`${medicaments.id} = ${medicamentId}`)

    return NextResponse.json(newVente[0], { status: 201 })
  } catch (error) {
    console.error("Error creating vente:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la vente" },
      { status: 500 }
    )
  }
}

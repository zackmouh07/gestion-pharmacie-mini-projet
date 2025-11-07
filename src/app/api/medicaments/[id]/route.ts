import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medicaments } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        {
          error: 'Valid positive integer ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const medicationId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { nom, prix, quantite, dateExpiration } = body;

    // Validate at least one field is provided for update
    if (!nom && prix === undefined && quantite === undefined && !dateExpiration) {
      return NextResponse.json(
        {
          error: 'At least one field (nom, prix, quantite, dateExpiration) must be provided for update',
          code: 'NO_UPDATE_FIELDS',
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    // Validate and add nom if provided
    if (nom !== undefined) {
      const trimmedNom = nom.trim();
      if (!trimmedNom) {
        return NextResponse.json(
          {
            error: 'Medication name cannot be empty',
            code: 'INVALID_NOM',
          },
          { status: 400 }
        );
      }
      updates.nom = trimmedNom;
    }

    // Validate and add prix if provided
    if (prix !== undefined) {
      const parsedPrix = parseFloat(prix);
      if (isNaN(parsedPrix) || parsedPrix <= 0) {
        return NextResponse.json(
          {
            error: 'Price must be a positive number greater than 0',
            code: 'INVALID_PRIX',
          },
          { status: 400 }
        );
      }
      updates.prix = parsedPrix;
    }

    // Validate and add quantite if provided
    if (quantite !== undefined) {
      const parsedQuantite = parseInt(quantite);
      if (isNaN(parsedQuantite) || parsedQuantite < 0) {
        return NextResponse.json(
          {
            error: 'Quantity must be a positive integer (>= 0)',
            code: 'INVALID_QUANTITE',
          },
          { status: 400 }
        );
      }
      updates.quantite = parsedQuantite;
    }

    // Validate and add dateExpiration if provided
    if (dateExpiration !== undefined) {
      const date = new Date(dateExpiration);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          {
            error: 'Invalid date format for expiration date',
            code: 'INVALID_DATE',
          },
          { status: 400 }
        );
      }
      updates.dateExpiration = dateExpiration;
    }

    // Update medication in database
    const updated = await db
      .update(medicaments)
      .set(updates)
      .where(eq(medicaments.id, medicationId))
      .returning();

    // Check if medication was found
    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: 'Medication not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        {
          error: 'Valid positive integer ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const medicationId = parseInt(id);

    // Delete medication from database
    const deleted = await db
      .delete(medicaments)
      .where(eq(medicaments.id, medicationId))
      .returning();

    // Check if medication was found
    if (deleted.length === 0) {
      return NextResponse.json(
        {
          error: 'Medication not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Medication deleted successfully',
        medication: deleted[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error.message,
      },
      { status: 500 }
    );
  }
}
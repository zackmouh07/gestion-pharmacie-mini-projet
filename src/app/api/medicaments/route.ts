import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medicaments } from '@/db/schema';
import { eq, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(medicaments)
        .where(eq(medicaments.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Medication not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(medicaments);

    if (search) {
      query = query.where(like(medicaments.nom, `%${search}%`));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, prix, quantite, dateExpiration } = body;

    // Validate required fields
    if (!nom || typeof nom !== 'string' || nom.trim() === '') {
      return NextResponse.json(
        { error: 'Medication name (nom) is required and must be a non-empty string', code: 'MISSING_NOM' },
        { status: 400 }
      );
    }

    if (prix === undefined || prix === null || typeof prix !== 'number') {
      return NextResponse.json(
        { error: 'Price (prix) is required and must be a number', code: 'MISSING_PRIX' },
        { status: 400 }
      );
    }

    if (prix <= 0) {
      return NextResponse.json(
        { error: 'Price (prix) must be a positive number', code: 'INVALID_PRIX' },
        { status: 400 }
      );
    }

    if (quantite === undefined || quantite === null || typeof quantite !== 'number' || !Number.isInteger(quantite)) {
      return NextResponse.json(
        { error: 'Quantity (quantite) is required and must be an integer', code: 'MISSING_QUANTITE' },
        { status: 400 }
      );
    }

    if (quantite < 0) {
      return NextResponse.json(
        { error: 'Quantity (quantite) must be a positive integer or zero', code: 'INVALID_QUANTITE' },
        { status: 400 }
      );
    }

    if (!dateExpiration || typeof dateExpiration !== 'string') {
      return NextResponse.json(
        { error: 'Expiration date (dateExpiration) is required and must be a string', code: 'MISSING_DATE_EXPIRATION' },
        { status: 400 }
      );
    }

    // Validate date format
    const expirationDate = new Date(dateExpiration);
    if (isNaN(expirationDate.getTime())) {
      return NextResponse.json(
        { error: 'Expiration date (dateExpiration) must be a valid date string', code: 'INVALID_DATE_EXPIRATION' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedNom = nom.trim();

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      nom: sanitizedNom,
      prix,
      quantite,
      dateExpiration,
      createdAt: now,
      updatedAt: now,
    };

    // Insert and return
    const newRecord = await db
      .insert(medicaments)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nom, prix, quantite, dateExpiration } = body;

    // Check if record exists
    const existing = await db
      .select()
      .from(medicaments)
      .where(eq(medicaments.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Medication not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Validate and add optional fields
    if (nom !== undefined) {
      if (typeof nom !== 'string' || nom.trim() === '') {
        return NextResponse.json(
          { error: 'Medication name (nom) must be a non-empty string', code: 'INVALID_NOM' },
          { status: 400 }
        );
      }
      updates.nom = nom.trim();
    }

    if (prix !== undefined) {
      if (typeof prix !== 'number' || prix <= 0) {
        return NextResponse.json(
          { error: 'Price (prix) must be a positive number', code: 'INVALID_PRIX' },
          { status: 400 }
        );
      }
      updates.prix = prix;
    }

    if (quantite !== undefined) {
      if (typeof quantite !== 'number' || !Number.isInteger(quantite) || quantite < 0) {
        return NextResponse.json(
          { error: 'Quantity (quantite) must be a positive integer or zero', code: 'INVALID_QUANTITE' },
          { status: 400 }
        );
      }
      updates.quantite = quantite;
    }

    if (dateExpiration !== undefined) {
      if (typeof dateExpiration !== 'string') {
        return NextResponse.json(
          { error: 'Expiration date (dateExpiration) must be a string', code: 'INVALID_DATE_EXPIRATION' },
          { status: 400 }
        );
      }

      const expirationDate = new Date(dateExpiration);
      if (isNaN(expirationDate.getTime())) {
        return NextResponse.json(
          { error: 'Expiration date (dateExpiration) must be a valid date string', code: 'INVALID_DATE_EXPIRATION' },
          { status: 400 }
        );
      }
      updates.dateExpiration = dateExpiration;
    }

    // Update and return
    const updated = await db
      .update(medicaments)
      .set(updates)
      .where(eq(medicaments.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(medicaments)
      .where(eq(medicaments.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Medication not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete and return
    const deleted = await db
      .delete(medicaments)
      .where(eq(medicaments.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Medication deleted successfully',
        medication: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
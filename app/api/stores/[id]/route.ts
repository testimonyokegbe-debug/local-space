import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";

type Ctx = { params: Promise<{ id: string }> };

const notFound = () =>
  NextResponse.json({ error: "Store not found." }, { status: 404 });

// Postgres throws this code when the id isn't a valid number/uuid
const isBadId = (err: unknown) =>
  (err as { code?: string } | null)?.code === "22P02";

// GET /api/stores/:id -> one store
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;

  try {
    const { rows } = await pool.query("SELECT * FROM stores WHERE id = $1", [
      id,
    ]);

    if (rows.length === 0) return notFound();

    return NextResponse.json(rows[0]);
  } catch (err) {
    if (isBadId(err)) return notFound();
    console.error(err);
    return NextResponse.json(
      { error: "Could not load store." },
      { status: 500 }
    );
  }
}

// PUT /api/stores/:id -> save the whole Business info form (edit)
export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const category = String(body.category ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim();
  const address = String(body.address ?? "").trim();
  const location = String(body.location ?? "").trim();
  const logoUrl = body.logo_url ? String(body.logo_url) : null;

  if (!name) {
    return NextResponse.json(
      { error: "Enter your business name." },
      { status: 400 }
    );
  }

  if (!category) {
    return NextResponse.json(
      { error: "Select a business category." },
      { status: 400 }
    );
  }

  if (!phone) {
    return NextResponse.json(
      { error: "Enter your business phone number." },
      { status: 400 }
    );
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid business email." },
      { status: 400 }
    );
  }

  try {
    const { rows } = await pool.query(
      `UPDATE stores
       SET name = $1, description = $2, category = $3, phone = $4,
           email = $5, address = $6, location = $7,
           logo_url = COALESCE($8, logo_url)
       WHERE id = $9
       RETURNING *`,
      [name, description, category, phone, email, address, location, logoUrl, id]
    );

    if (rows.length === 0) return notFound();

    return NextResponse.json(rows[0]);
  } catch (err) {
    if (isBadId(err)) return notFound();
    console.error(err);
    return NextResponse.json(
      { error: "Could not update store." },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/:id -> remove the store
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;

  try {
    const { rowCount } = await pool.query("DELETE FROM stores WHERE id = $1", [
      id,
    ]);

    if (!rowCount) return notFound();

    return NextResponse.json({ message: "Store deleted." });
  } catch (err) {
    if (isBadId(err)) return notFound();
    console.error(err);
    return NextResponse.json(
      { error: "Could not delete store." },
      { status: 500 }
    );
  }
}
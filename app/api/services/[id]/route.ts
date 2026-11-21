import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";
import { toService, parseService } from "../../../../lib/services";

type Ctx = { params: Promise<{ id: string }> };

const notFound = () =>
  NextResponse.json({ error: "Service not found." }, { status: 404 });

// ids are SERIAL numbers, so reject anything that isn't one
const parseId = (id: string) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
};

// GET /api/services/:id -> one service
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const sid = parseId(id);
  if (!sid) return notFound();

  try {
    const { rows } = await pool.query(
      "SELECT * FROM services WHERE id = $1",
      [sid]
    );

    if (rows.length === 0) return notFound();

    return NextResponse.json(toService(rows[0]));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load service." },
      { status: 500 }
    );
  }
}

// PUT /api/services/:id -> replace the whole service (edit)
export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const sid = parseId(id);
  if (!sid) return notFound();

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { data, error } = parseService(body);

  if (!data) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE services SET
         name = $1, price = $2, availability = $3, days = $4,
         time_from = $5, time_to = $6, phone = $7, location = $8,
         social = $9, image = $10, variants = $11
       WHERE id = $12
       RETURNING *`,
      [
        data.name,
        data.price,
        data.availability,
        data.days,
        data.timeFrom,
        data.timeTo,
        data.phone,
        data.location,
        data.social,
        data.image,
        JSON.stringify(data.variants),
        sid,
      ]
    );

    if (rows.length === 0) return notFound();

    return NextResponse.json(toService(rows[0]));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not update service." },
      { status: 500 }
    );
  }
}

// DELETE /api/services/:id -> remove the service
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const sid = parseId(id);
  if (!sid) return notFound();

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM services WHERE id = $1",
      [sid]
    );

    if (!rowCount) return notFound();

    return NextResponse.json({ message: "Service deleted." });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not delete service." },
      { status: 500 }
    );
  }
}
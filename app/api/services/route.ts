import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import { toService, parseService } from "../../../lib/services";

// GET /api/services -> list all services
export async function GET() {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM services ORDER BY created_at DESC"
    );
    return NextResponse.json(rows.map(toService));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load services." },
      { status: 500 }
    );
  }
}

// POST /api/services -> add a service
export async function POST(req: Request) {
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
      `INSERT INTO services
        (name, price, availability, days, time_from, time_to,
         phone, location, social, image, variants)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
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
      ]
    );

    return NextResponse.json(toService(rows[0]), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not save service." },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const {
      name,
      description,
      category,
      phone,
      email,
      address,
      location,
      logo_url,
    } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO stores (name, description, category, phone, email, address, location, logo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, category, phone, email, address, location, logo_url || null]
    );

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create store" }, { status: 500 });
  }
}
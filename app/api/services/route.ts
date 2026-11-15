import { NextResponse } from "next/server";
import { services } from "../../../lib/mockDb";
import type { DbService } from "../../../lib/mockDb";

// GET /api/services -> list all services
export async function GET() {
  return NextResponse.json(services);
}

// POST /api/services -> add a service
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  const availability = String(body.availability ?? "").trim();
  const phone = String(body.phone ?? "").trim();

  if (!name) {
    return NextResponse.json(
      { error: "Enter the service name." },
      { status: 400 }
    );
  }

  if (body.price === "" || body.price == null || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });
  }

  if (!availability) {
    return NextResponse.json(
      { error: "Enter your availability." },
      { status: 400 }
    );
  }

  if (!phone) {
    return NextResponse.json(
      { error: "Enter a contact number." },
      { status: 400 }
    );
  }

  const service: DbService = {
    id: crypto.randomUUID(),
    name,
    description: String(body.description ?? "").trim(),
    price,
    availability,
    phone,
    location: String(body.location ?? "").trim(),
    social: String(body.social ?? "").trim(),
    image: body.image ? String(body.image) : null,
  };

  services.push(service);

  return NextResponse.json(service, { status: 201 });
}
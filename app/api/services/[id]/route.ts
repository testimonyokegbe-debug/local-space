import { NextResponse } from "next/server";
import { services } from "../../../../lib/mockDb";
import type { DbService } from "../../../../lib/mockDb";

type Ctx = { params: Promise<{ id: string }> };

const notFound = () =>
  NextResponse.json({ error: "Service not found." }, { status: 404 });

const invalidPrice = (value: unknown) => {
  const price = Number(value);
  return value === "" || value == null || !Number.isFinite(price) || price < 0;
};

// GET /api/services/:id -> one service
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const service = services.find((s) => s.id === id);

  if (!service) return notFound();

  return NextResponse.json(service);
}

// PUT /api/services/:id -> replace the whole service (edit)
export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const index = services.findIndex((s) => s.id === id);

  if (index === -1) return notFound();

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const availability = String(body.availability ?? "").trim();
  const phone = String(body.phone ?? "").trim();

  if (!name) {
    return NextResponse.json(
      { error: "Enter the service name." },
      { status: 400 }
    );
  }

  if (invalidPrice(body.price)) {
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

  const updated: DbService = {
    id,
    name,
    description: String(body.description ?? "").trim(),
    price: Number(body.price),
    availability,
    phone,
    location: String(body.location ?? "").trim(),
    social: String(body.social ?? "").trim(),
    image: body.image ? String(body.image) : null,
  };

  services[index] = updated;

  return NextResponse.json(updated);
}

// PATCH /api/services/:id -> change only the fields that were sent
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const service = services.find((s) => s.id === id);

  if (!service) return notFound();

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if ("name" in body) {
    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Enter the service name." },
        { status: 400 }
      );
    }

    service.name = name;
  }

  if ("price" in body) {
    if (invalidPrice(body.price)) {
      return NextResponse.json(
        { error: "Enter a valid price." },
        { status: 400 }
      );
    }

    service.price = Number(body.price);
  }

  if ("availability" in body) {
    const availability = String(body.availability ?? "").trim();

    if (!availability) {
      return NextResponse.json(
        { error: "Enter your availability." },
        { status: 400 }
      );
    }

    service.availability = availability;
  }

  if ("phone" in body) {
    const phone = String(body.phone ?? "").trim();

    if (!phone) {
      return NextResponse.json(
        { error: "Enter a contact number." },
        { status: 400 }
      );
    }

    service.phone = phone;
  }

  if ("description" in body) {
    service.description = String(body.description ?? "").trim();
  }

  if ("location" in body) {
    service.location = String(body.location ?? "").trim();
  }

  if ("social" in body) {
    service.social = String(body.social ?? "").trim();
  }

  if ("image" in body) {
    service.image = body.image ? String(body.image) : null;
  }

  return NextResponse.json(service);
}

// DELETE /api/services/:id -> remove the service
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const index = services.findIndex((s) => s.id === id);

  if (index === -1) return notFound();

  services.splice(index, 1);

  return NextResponse.json({ message: "Service deleted." });
}
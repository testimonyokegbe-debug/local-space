// shared by /api/services and /api/services/[id]

export const toService = (r: any) => ({
  id: String(r.id),
  name: r.name,
  price: r.price == null ? "" : String(r.price),
  availability: r.availability,
  days: r.days ?? [],
  timeFrom: r.time_from ?? "09:00",
  timeTo: r.time_to ?? "17:00",
  phone: r.phone,
  location: r.location ?? "",
  social: r.social ?? "",
  image: r.image ?? null,
  variants: r.variants ?? [],
});

// checks the body and returns clean data, or an error message
export function parseService(body: any) {
  const name = String(body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const days: string[] = Array.isArray(body?.days) ? body.days : [];
  const timeFrom = String(body?.timeFrom ?? "");
  const timeTo = String(body?.timeTo ?? "");

  const priceOk =
    body?.price !== "" &&
    body?.price != null &&
    Number.isFinite(Number(body.price)) &&
    Number(body.price) >= 0;
  const price = priceOk ? Number(body.price) : null;

  // clean the sub services, skipping rows with no name
  const variants: {
    id: string;
    name: string;
    price: string;
    priceTo: string;
    description: string;
    image: string | null;
  }[] = [];

  for (const v of Array.isArray(body?.variants) ? body.variants : []) {
    const vName = String(v?.name ?? "").trim();
    if (!vName) continue;

    variants.push({
      id: String(v?.id ?? crypto.randomUUID()),
      name: vName,
      price: String(v?.price ?? "").trim(),
      priceTo: String(v?.priceTo ?? "").trim(),
      description: String(v?.description ?? "").trim(),
      image: v?.image ? String(v.image) : null,
    });
  }

  if (!name) return { error: "Enter the service name." };

  // the service price is needed unless every sub service has its own
  const needsMainPrice =
    variants.length === 0 || variants.some((v) => v.price === "");

  if (needsMainPrice && !priceOk) {
    return {
      error:
        variants.length > 0
          ? "Enter the service price, or give every sub service its own price."
          : "Enter a valid price.",
    };
  }

  for (const v of variants) {
    if (v.price !== "" && (!Number.isFinite(Number(v.price)) || Number(v.price) < 0)) {
      return { error: `Enter a valid price for "${v.name}".` };
    }

    const from = v.price !== "" ? Number(v.price) : (price ?? 0);

    if (
      v.priceTo !== "" &&
      (!Number.isFinite(Number(v.priceTo)) || Number(v.priceTo) < from)
    ) {
      return {
        error: `"Up to" price for "${v.name}" must be more than its price.`,
      };
    }
  }

  if (days.length === 0) return { error: "Pick at least one available day." };

  if (!timeFrom || !timeTo || timeFrom >= timeTo) {
    return { error: "End time must be after start time." };
  }

  if (!phone) return { error: "Enter a contact number." };

  return {
    data: {
      name,
      price,
      availability: `${days.join(", ")} · ${timeFrom}–${timeTo}`,
      days,
      timeFrom,
      timeTo,
      phone,
      location: String(body?.location ?? "").trim(),
      social: String(body?.social ?? "").trim(),
      image: body?.image ? String(body.image) : null,
      variants,
    },
  };
}
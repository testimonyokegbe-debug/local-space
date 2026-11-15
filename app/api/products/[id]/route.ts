import { NextResponse } from "next/server";
import type { PoolClient } from "pg";
import { pool } from "../../../../lib/db";

type Ctx = { params: Promise<{ id: string }> };

type Row = {
  id: string;
  store_id: number | null;
  name: string;
  price: string;
  quantity: number;
  image: string | null;
  details: string | null;
  description: string | null;
};

type VariantRow = {
  id: string;
  product_id: string;
  name: string;
  price: string | null;
  quantity: number;
  image: string | null;
};

type VariantInput = {
  name: string;
  price: number | null;
  quantity: number;
  image: string | null;
};

// sub products go back to the frontend with price/quantity as text,
// and an empty price means "use the product's price"
const toVariant = (r: VariantRow) => ({
  id: r.id,
  name: r.name,
  price: r.price === null ? "" : String(Number(r.price)),
  quantity: String(r.quantity),
  image: r.image,
});

const toProduct = (r: Row, variants: VariantRow[]) => ({
  id: r.id,
  store_id: r.store_id,
  name: r.name,
  price: Number(r.price),
  quantity: r.quantity,
  image: r.image,
  details: r.details ?? "",
  description: r.description ?? "",
  variants: variants.map(toVariant),
});

const notFound = () =>
  NextResponse.json({ error: "Product not found." }, { status: 404 });

const badRequest = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 });

const serverError = (message: string) =>
  NextResponse.json({ error: message }, { status: 500 });

// 22P02 = the id isn't a valid UUID, so treat it as not found
const isBadId = (err: unknown) =>
  (err as { code?: string } | null)?.code === "22P02";

const loadVariants = async (productId: string) => {
  const { rows } = await pool.query(
    `SELECT * FROM product_variants
     WHERE product_id = $1
     ORDER BY position, created_at`,
    [productId]
  );

  return rows as VariantRow[];
};

// checks the sub products array sent by the seller form
const parseVariants = (
  input: unknown
): { variants: VariantInput[] } | { error: string } => {
  if (!Array.isArray(input)) return { error: "Invalid sub products." };

  if (input.length > 50) return { error: "Too many sub products (max 50)." };

  const variants: VariantInput[] = [];

  for (let i = 0; i < input.length; i++) {
    const v = input[i] ?? {};
    const name = String(v.name ?? "").trim();

    if (!name) return { error: `Enter a name for sub product ${i + 1}.` };

    const quantity = Number(v.quantity);

    if (!Number.isSafeInteger(quantity) || quantity < 0) {
      return { error: `Enter a valid stock number for "${name}".` };
    }

    let price: number | null = null;

    if (v.price !== null && v.price !== undefined && String(v.price).trim() !== "") {
      price = Number(v.price);

      if (!Number.isFinite(price) || price < 0) {
        return { error: `Enter a valid price for "${name}".` };
      }
    }

    variants.push({
      name,
      price,
      quantity,
      image: v.image ? String(v.image) : null,
    });
  }

  return { variants };
};

// wipes the product's old sub products and saves the new list
const replaceVariants = async (
  client: PoolClient,
  productId: string,
  variants: VariantInput[]
) => {
  await client.query("DELETE FROM product_variants WHERE product_id = $1", [
    productId,
  ]);

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];

    await client.query(
      `INSERT INTO product_variants
         (product_id, name, price, quantity, image, position)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [productId, v.name, v.price, v.quantity, v.image, i]
    );
  }
};

// GET /api/products/:id -> one product (with its sub products)
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;

  try {
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);

    if (rows.length === 0) return notFound();

    const variants = await loadVariants(id);

    return NextResponse.json(toProduct(rows[0], variants));
  } catch (err) {
    if (isBadId(err)) return notFound();
    console.error(err);
    return serverError("Could not load product.");
  }
}

// PUT /api/products/:id -> replace the whole product (edit)
export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;

  const body = await req.json().catch(() => null);

  if (!body) return badRequest("Invalid request.");

  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  let quantity = Number(body.quantity);
  const details = String(body.details ?? "").trim();
  const description = String(body.description ?? "").trim();

  if (!name) return badRequest("Enter the product name.");

  if (!Number.isFinite(price) || price < 0) {
    return badRequest("Enter a valid price.");
  }

  // sub products are only touched when the request sends them
  let newVariants: VariantInput[] | null = null;

  if ("variants" in body) {
    const parsed = parseVariants(body.variants);

    if ("error" in parsed) return badRequest(parsed.error);

    newVariants = parsed.variants;
  }

  if (newVariants && newVariants.length > 0) {
    // total stock = sum of the sub products' stock
    quantity = newVariants.reduce((sum, v) => sum + v.quantity, 0);
  } else if (!Number.isSafeInteger(quantity) || quantity < 0) {
    return badRequest("Enter a valid quantity (whole number).");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `UPDATE products
       SET name = $1, price = $2, quantity = $3, image = $4,
           details = $5, description = $6
       WHERE id = $7
       RETURNING *`,
      [
        name,
        price,
        quantity,
        body.image ? String(body.image) : null,
        details,
        description,
        id,
      ]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return notFound();
    }

    if (newVariants) await replaceVariants(client, id, newVariants);

    await client.query("COMMIT");

    const variants = await loadVariants(id);

    return NextResponse.json(toProduct(rows[0], variants));
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    if (isBadId(err)) return notFound();
    console.error(err);
    return serverError("Could not update product.");
  } finally {
    client.release();
  }
}

// PATCH /api/products/:id -> change only the fields that were sent
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;

  const body = await req.json().catch(() => null);

  if (!body) return badRequest("Invalid request.");

  const client = await pool.connect();

  try {
    const found = await client.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);

    if (found.rows.length === 0) return notFound();

    const current = found.rows[0] as Row;

    let name = current.name;
    let price = Number(current.price);
    let quantity = current.quantity;
    let image = current.image;
    let details = current.details ?? "";
    let description = current.description ?? "";
    let newVariants: VariantInput[] | null = null;

    if ("name" in body) {
      name = String(body.name ?? "").trim();

      if (!name) return badRequest("Enter the product name.");
    }

    if ("price" in body) {
      price = Number(body.price);

      if (!Number.isFinite(price) || price < 0) {
        return badRequest("Enter a valid price.");
      }
    }

    if ("quantity" in body) {
      quantity = Number(body.quantity);

      if (!Number.isSafeInteger(quantity) || quantity < 0) {
        return badRequest("Enter a valid quantity (whole number).");
      }
    }

    if ("image" in body) {
      image = body.image ? String(body.image) : null;
    }

    if ("details" in body) {
      details = String(body.details ?? "").trim();
    }

    if ("description" in body) {
      description = String(body.description ?? "").trim();
    }

    if ("variants" in body) {
      const parsed = parseVariants(body.variants);

      if ("error" in parsed) return badRequest(parsed.error);

      newVariants = parsed.variants;

      if (newVariants.length > 0) {
        quantity = newVariants.reduce((sum, v) => sum + v.quantity, 0);
      }
    }

    await client.query("BEGIN");

    const { rows } = await client.query(
      `UPDATE products
       SET name = $1, price = $2, quantity = $3, image = $4,
           details = $5, description = $6
       WHERE id = $7
       RETURNING *`,
      [name, price, quantity, image, details, description, id]
    );

    if (newVariants) await replaceVariants(client, id, newVariants);

    await client.query("COMMIT");

    const variants = await loadVariants(id);

    return NextResponse.json(toProduct(rows[0], variants));
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    if (isBadId(err)) return notFound();
    console.error(err);
    return serverError("Could not update product.");
  } finally {
    client.release();
  }
}

// DELETE /api/products/:id -> remove the product (its sub products go with it)
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM products WHERE id = $1",
      [id]
    );

    if (!rowCount) return notFound();

    return NextResponse.json({ message: "Product deleted." });
  } catch (err) {
    if (isBadId(err)) return notFound();
    console.error(err);
    return serverError("Could not delete product.");
  }
}
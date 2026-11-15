import { NextResponse } from "next/server";
import type { PoolClient } from "pg";
import { pool } from "../../../lib/db";

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

// variants go back to the frontend with price/quantity as text,
// and an empty price means "use the product's price"
const toVariant = (r: VariantRow) => ({
  id: r.id,
  name: r.name,
  price: r.price === null ? "" : String(Number(r.price)),
  quantity: String(r.quantity),
  image: r.image,
});

// Postgres sends NUMERIC back as text, so convert price to a number
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

const errCode = (err: unknown) => (err as { code?: string } | null)?.code;

const badRequest = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 });

// loads the sub products for a list of products in one query
const attachVariants = async (rows: Row[]) => {
  if (rows.length === 0) return [];

  const { rows: variantRows } = await pool.query(
    `SELECT * FROM product_variants
     WHERE product_id = ANY($1::uuid[])
     ORDER BY position, created_at`,
    [rows.map((r) => r.id)]
  );

  return rows.map((r) =>
    toProduct(
      r,
      (variantRows as VariantRow[]).filter((v) => v.product_id === r.id)
    )
  );
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

const insertVariants = async (
  client: PoolClient,
  productId: string,
  variants: VariantInput[]
) => {
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

// GET /api/products           -> all products
// GET /api/products?storeId=3 -> only that store's products
export async function GET(req: Request) {
  const storeId = new URL(req.url).searchParams.get("storeId");

  try {
    const { rows } = storeId
      ? await pool.query(
          "SELECT * FROM products WHERE store_id = $1 ORDER BY created_at DESC",
          [storeId]
        )
      : await pool.query("SELECT * FROM products ORDER BY created_at DESC");

    return NextResponse.json(await attachVariants(rows as Row[]));
  } catch (err) {
    // a storeId that isn't a number just means no products
    if (errCode(err) === "22P02") return NextResponse.json([]);

    console.error(err);
    return NextResponse.json(
      { error: "Could not load products." },
      { status: 500 }
    );
  }
}

// POST /api/products -> add a product (with its sub products)
export async function POST(req: Request) {
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

  let variants: VariantInput[] = [];

  if ("variants" in body) {
    const parsed = parseVariants(body.variants);

    if ("error" in parsed) return badRequest(parsed.error);

    variants = parsed.variants;
  }

  if (variants.length > 0) {
    // total stock = sum of the sub products' stock
    quantity = variants.reduce((sum, v) => sum + v.quantity, 0);
  } else if (!Number.isSafeInteger(quantity) || quantity < 0) {
    return badRequest("Enter a valid quantity (whole number).");
  }

  // store_id is optional for now; it becomes required once the seller page sends it
  let storeId: number | null = null;

  if (body.store_id != null && body.store_id !== "") {
    storeId = Number(body.store_id);

    if (!Number.isSafeInteger(storeId)) return badRequest("Invalid store.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO products
         (store_id, name, price, quantity, image, details, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        storeId,
        name,
        price,
        quantity,
        body.image ? String(body.image) : null,
        details,
        description,
      ]
    );

    await insertVariants(client, rows[0].id, variants);

    await client.query("COMMIT");

    const [product] = await attachVariants(rows as Row[]);

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});

    // 23503 = that store_id doesn't exist
    if (errCode(err) === "23503") return badRequest("Store not found.");

    console.error(err);
    return NextResponse.json(
      { error: "Could not add product." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
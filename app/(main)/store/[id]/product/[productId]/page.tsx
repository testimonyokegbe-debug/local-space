import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pool } from "@/lib/db";
import StorePageNavbar from "@/components/StorePageNavbar";
import ProductView from "@/components/ProductView";
import type { ViewProduct } from "@/components/ProductView";

type Props = { params: Promise<{ id: string; productId: string }> };

async function ProductDetail({ params }: Props) {
  const { id, productId } = await params;

  let store: { id: number; name: string; logo_url: string | null } | undefined;

  try {
    const { rows } = await pool.query(
      "SELECT id, name, logo_url FROM stores WHERE id = $1",
      [id]
    );
    store = rows[0];
  } catch {
    store = undefined;
  }

  if (!store) notFound();

  let product: ViewProduct | undefined;

  try {
    const { rows } = await pool.query(
      `SELECT id, name, price, quantity, image, details, description
       FROM products
       WHERE id = $1 AND store_id = $2`,
      [productId, store.id]
    );

    const p = rows[0];

    if (p) {
      const { rows: variantRows } = await pool.query(
        `SELECT id, name, price, quantity, image
         FROM product_variants
         WHERE product_id = $1
         ORDER BY position, created_at`,
        [p.id]
      );

      // Postgres sends price back as text, so convert it to a number
      product = {
        id: p.id,
        name: p.name,
        price: Number(p.price),
        quantity: p.quantity,
        image: p.image,
        details: p.details ?? "",
        description: p.description ?? "",
        variants: variantRows.map((v) => ({
          id: v.id,
          name: v.name,
          price: v.price === null ? null : Number(v.price),
          quantity: v.quantity,
          image: v.image,
        })),
      };
    }
  } catch {
    // a bad product id format lands here and shows the 404 page
    product = undefined;
  }

  if (!product) notFound();

  return (
    <>
      <StorePageNavbar
        logoUrl={store.logo_url}
        storeName={store.name}
        showSearch={false}
      />

      <main className="min-h-screen px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          {/* Back to the store */}
          <Link
            href={`/store/${store.id}`}
            className="inline-block rounded-full bg-[#f59e0b] px-5 py-2 text-sm font-semibold text-[#1e1b4b] transition hover:bg-amber-400"
          >
            Back
          </Link>

          <div className="mt-8">
            <ProductView product={product} />
          </div>
        </div>
      </main>
    </>
  );
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <p className="mt-12 text-center text-neutral-400">Loading product...</p>
      }
    >
      <ProductDetail params={params} />
    </Suspense>
  );
}
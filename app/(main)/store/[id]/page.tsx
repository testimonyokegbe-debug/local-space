import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pool } from "@/lib/db";
import StorePageNavbar from "@/components/StorePageNavbar";

type StoreRow = {
  id: number;
  name: string;
  description: string | null;
  logo_url: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
};

async function StoreDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { q } = await searchParams;
  const search = (q ?? "").trim();

  let store: StoreRow | undefined;

  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, logo_url
       FROM stores WHERE id = $1`,
      [id]
    );
    store = rows[0];
  } catch {
    // a bad id format lands here and shows the 404 page
    store = undefined;
  }

  if (!store) notFound();

  let products: Product[] = [];

  try {
    const { rows } = await pool.query(
      `SELECT id, name, price, image
       FROM products
       WHERE store_id = $1
         AND ($2 = '' OR name ILIKE '%' || $2 || '%')
       ORDER BY created_at DESC`,
      [store.id, search]
    );

    // Postgres sends price back as text, so convert it to a number
    products = rows.map((r) => ({
      id: r.id,
      name: r.name,
      price: Number(r.price),
      image: r.image,
    }));
  } catch {
    products = [];
  }

  return (
    <>
      <StorePageNavbar logoUrl={store.logo_url} storeName={store.name} />

      <main className="min-h-screen px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          {/* Back to all stores */}
          <Link
            href="/store"
            className="inline-block rounded-full bg-[#f59e0b] px-5 py-2 text-sm font-semibold text-[#1e1b4b] transition hover:bg-amber-400"
          >
            Store
          </Link>

          {/* Business name + description */}
          <h1 className="mt-8 text-3xl font-bold md:text-5xl">{store.name}</h1>
          {store.description && (
            <p className="mt-3 text-neutral-300">{store.description}</p>
          )}

          {/* Products */}
          <section className="mt-10">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/20 px-6 py-16 text-center text-neutral-300">
                {search
                  ? `No products match "${search}".`
                  : "This store hasn't added any products yet."}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/store/${store.id}/product/${product.id}`}
                    className="flex flex-col overflow-hidden rounded-2xl bg-[#2e2a7a]"
                  >
                    <div
                      className="flex h-40 items-center justify-center bg-white/10 bg-cover bg-center text-sm text-gray-400 sm:h-44"
                      style={
                        product.image
                          ? { backgroundImage: `url(${product.image})` }
                          : undefined
                      }
                    >
                      {!product.image && "No image"}
                    </div>

                    <div className="p-4">
                      <h3 className="truncate font-semibold">{product.name}</h3>
                      <p className="mt-1 text-lg font-bold text-[#c4b5fd]">
                        ₦{product.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default function StoreDetailPage({ params, searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <p className="mt-12 text-center text-neutral-400">Loading store...</p>
      }
    >
      <StoreDetail params={params} searchParams={searchParams} />
    </Suspense>
  );
}
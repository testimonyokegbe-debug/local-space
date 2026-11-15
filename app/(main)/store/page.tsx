import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { pool } from "@/lib/db";
import { assets } from "@/lib/assets";
import StoreNavbar from "@/components/StoreNavbar";

async function StoreList() {
  const { rows: stores } = await pool.query(
    "SELECT id, name, category, logo_url FROM stores ORDER BY created_at DESC"
  );

  if (stores.length === 0) {
    return (
      <p className="mt-12 text-center text-neutral-400">
        No stores yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stores.map((s) => (
        <Link
          key={s.id}
          href={`/store/${s.id}`}
          className="flex flex-col gap-6 rounded-2xl bg-[#2e2a7a] p-4"
        >
          {/* top row: store icon on the left, logo on the right */}
          <div className="flex min-h-12 items-center justify-between gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
              <Image src={assets.store} alt="Store" width={22} height={22} />
            </div>

            {s.logo_url && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                <Image
                  src={s.logo_url}
                  alt={s.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* bottom row: gold business name on the left, category on the right */}
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate rounded-full bg-[#f59e0b] px-3 py-1 text-sm font-semibold text-[#1e1b4b]">
              {s.name}
            </span>

            {s.category && (
              <p className="min-w-0 truncate text-sm text-[#c4b5fd]">
                {s.category}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function StorePage() {
  return (
    <>
      <StoreNavbar />
      <main className="min-h-screen px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold md:text-5xl">
            Welcome to <span className="text-[#c4b5fd]">LocalSpace Store</span>
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-300">
            Explore stores, discover unique products, and shop from businesses
            across the community.
          </p>

          <Suspense
            fallback={
              <p className="mt-12 text-center text-neutral-400">
                Loading stores...
              </p>
            }
          >
            <StoreList />
          </Suspense>
        </div>
      </main>
    </>
  );
}
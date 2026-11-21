import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Briefcase } from "lucide-react";
import { pool } from "@/lib/db";
import ServiceNavbar from "@/components/ServiceNavbar";

type Variant = { price?: string };

const money = (value: number) => `₦${value.toLocaleString()}`;

// "From ₦5,500" when there are sub services, otherwise the normal price
function priceLabel(price: string | null, variants: Variant[] | null) {
  const list = variants ?? [];

  if (list.length > 0) {
    const prices = list.map((v) =>
      v.price ? Number(v.price) : Number(price)
    );
    return `From ${money(Math.min(...prices))}`;
  }

  return price == null ? "" : money(Number(price));
}

async function ServiceList({ q }: { q: string }) {
  const { rows: services } = q
    ? await pool.query(
        `SELECT id, name, price, image, variants FROM services
         WHERE name ILIKE $1 ORDER BY created_at DESC`,
        [`%${q}%`]
      )
    : await pool.query(
        "SELECT id, name, price, image, variants FROM services ORDER BY created_at DESC"
      );

  if (services.length === 0) {
    return (
      <p className="mt-12 text-center text-neutral-400">
        {q ? `No services found for "${q}".` : "No services yet. Check back soon."}
      </p>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <Link
          key={s.id}
          href={`/service/${s.id}`}
          className="flex flex-col gap-6 rounded-2xl bg-[#2e2a7a] p-4"
        >
          {/* top row: service icon on the left, service image on the right */}
          <div className="flex min-h-12 items-center justify-between gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
              <Briefcase size={22} className="text-[#1e1b4b]" />
            </div>

            {s.image && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                <Image
                  src={s.image}
                  alt={s.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* bottom row: gold service name on the left, price on the right */}
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate rounded-full bg-[#f59e0b] px-3 py-1 text-sm font-semibold text-[#1e1b4b]">
              {s.name}
            </span>

            <p className="shrink-0 text-sm text-[#c4b5fd]">
              {priceLabel(s.price, s.variants)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function ServicePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  return (
    <>
      <ServiceNavbar />
      <main className="min-h-screen px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold md:text-5xl">
            Welcome to <span className="text-[#c4b5fd]">LocalSpace Services</span>
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-300">
            Find trusted local professionals, compare services and prices, and
            book the right person for the job.
          </p>

          <Suspense
            key={query}
            fallback={
              <p className="mt-12 text-center text-neutral-400">
                Loading services...
              </p>
            }
          >
            <ServiceList q={query} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
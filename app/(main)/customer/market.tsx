import Image from "next/image";
import Link from "next/link";

const categories = [
  { label: "Service", icon: "images/service.svg", href: "/customer/services" },
  { label: "Store", icon: "images/store.svg", href: "/store" },
];

export default function MarketPlace() {
  return (
    <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-xl">
      <header className="flex items-center justify-between bg-[#f59e0b] px-6 py-4">
        <h2 className="flex-1 text-center text-2xl font-bold text-neutral-900">
          Explore Market Place
        </h2>
        <Image src="images/market.svg" alt="" width={28} height={28} />
      </header>

      <div className="px-6 pb-14 pt-10 text-center">
        <p className="text-sm text-slate-600">
          Select a category below to browse available listings
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          {categories.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="flex h-52 w-60 flex-col items-center justify-center gap-5 rounded-2xl bg-[#332d83] shadow-lg transition-shadow hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b]"
            >
              <span className="flex h-24 w-24 items-center justify-center rounded-xl bg-white">
                <Image src={c.icon} alt="" width={48} height={48} />
              </span>
              <span className="text-xl font-bold text-white">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
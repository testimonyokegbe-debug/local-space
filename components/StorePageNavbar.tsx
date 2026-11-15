"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { assets } from "@/lib/assets";

export default function StorePageNavbar({
  logoUrl,
  storeName,
  showSearch = true,
}: {
  logoUrl?: string | null;
  storeName: string;
  showSearch?: boolean;
}) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // always points at the store page, e.g. /store/8
  const storeHref = pathname.split("/").slice(0, 3).join("/");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${storeHref}?q=${encodeURIComponent(query)}`);
  };

  return (
    <nav className="mx-auto mt-4 flex w-[92%] max-w-6xl items-center justify-between gap-4 rounded-full border border-amber-500 bg-[#1e1b4b] px-6 py-3">
      {/* Store logo (or store icon if no logo) */}
      <Link href={storeHref} aria-label={storeName} className="shrink-0">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={storeName}
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1e1b4b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M3 9l1-5h16l1 5" />
              <path d="M4 9v11h16V9" />
              <path d="M9 20v-6h6v6" />
            </svg>
          </div>
        )}
      </Link>

      {/* Search (hidden on the product page) */}
      {showSearch && (
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center rounded-full bg-white px-4 py-2 md:max-w-md"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this store..."
            className="w-full bg-transparent text-sm text-indigo-950 outline-none"
          />
          <button type="submit" aria-label="Search">
            <Image src={assets.search} alt="Search" width={20} height={20} />
          </button>
        </form>
      )}

      {/* Cart */}
      <Link href="/store/cart" aria-label="Cart" className="shrink-0">
        <Image src={assets.cart} alt="Cart" width={26} height={26} />
      </Link>
    </nav>
  );
}
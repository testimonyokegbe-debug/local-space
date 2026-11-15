"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { assets } from "@/lib/assets";

export default function StoreNavbar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/store?q=${encodeURIComponent(query)}`);
  };

  return (
    <nav className="mx-auto mt-4 flex w-[92%] max-w-6xl items-center justify-between gap-4 rounded-full border border-amber-500 bg-[#1e1b4b] px-6 py-3">
      <Link href="/customer" className="text-lg font-bold text-amber-500">
        Local Space
      </Link>

      <form
        onSubmit={handleSearch}
        className="flex flex-1 items-center rounded-full bg-white px-4 py-2 md:max-w-md"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stores or products..."
          className="w-full bg-transparent text-sm text-indigo-950 outline-none"
        />
        <button type="submit" aria-label="Search">
          <Image src={assets.search} alt="Search" width={20} height={20} />
        </button>
      </form>

      <div className="flex items-center gap-5">
        <Link href="/customer" className="text-amber-500 hover:text-amber-400">
          Home
        </Link>
        <Link href="/store/cart" aria-label="Cart">
          <Image src={assets.cart} alt="Cart" width={26} height={26} />
        </Link>
      </div>
    </nav>
  );
}
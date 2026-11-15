"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductsTab from "../../../../components/seller/ProductsTab";
import SellerTabs from "../../../../components/seller/SellerTabs";
import type { Product } from "../../../../components/seller/types";

type ApiVariant = {
  id: string;
  name: string;
  price: string;
  quantity: string;
  image: string | null;
};

type ApiProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  details?: string;
  description?: string;
  variants?: ApiVariant[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // the store id is kept in the browser until login exists
    let id: number | null = null;

    try {
      const raw = localStorage.getItem("localspace_store_id");
      if (raw && Number.isSafeInteger(Number(raw))) id = Number(raw);
    } catch {}

    setStoreId(id);

    if (id === null) {
      setLoading(false);
      return;
    }

    fetch(`/api/products?storeId=${id}`)
      .then((res) => res.json())
      .then((list: ApiProduct[]) =>
        setProducts(
          list.map((p) => ({
            id: p.id,
            name: p.name,
            price: String(p.price),
            quantity: String(p.quantity),
            image: p.image,
            details: p.details ?? "",
            description: p.description ?? "",
            variants: p.variants ?? [],
          }))
        )
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-white">
      <h1 className="mb-6 text-3xl font-bold">My Store</h1>
      <SellerTabs />

      {loading ? (
        <p className="py-20 text-center text-sm text-gray-300">Loading...</p>
      ) : storeId === null ? (
        <div className="rounded-2xl border border-dashed border-white/20 px-6 py-20 text-center">
          <p className="text-lg font-semibold">Set up your business info first</p>
          <p className="mt-1 text-sm text-gray-300">
            Your products need a store to belong to.
          </p>

          <Link
            href="/seller/business"
            className="mt-6 inline-block rounded-full bg-[#c4b5fd] px-6 py-2.5 text-sm font-medium text-gray-900 transition hover:brightness-95"
          >
            Go to Business info
          </Link>
        </div>
      ) : (
        <ProductsTab
          products={products}
          setProducts={setProducts}
          storeId={storeId}
        />
      )}
    </div>
  );
}
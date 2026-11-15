"use client";

import { useEffect, useState } from "react";
import ServicesTab from "../../../../components/seller/ServicesTab";
import SellerTabs from "../../../../components/seller/SellerTabs";
import type { Service } from "../../../../components/seller/types";

type ApiService = Omit<Service, "price"> & { price: number };

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((list: ApiService[]) =>
        setServices(list.map((s) => ({ ...s, price: String(s.price) })))
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
      ) : (
        <ServicesTab services={services} setServices={setServices} />
      )}
    </div>
  );
}
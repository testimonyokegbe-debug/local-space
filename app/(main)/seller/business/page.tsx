"use client";

import BusinessTab from "../../../../components/seller/BusinessTab";
import SellerTabs from "../../../../components/seller/SellerTabs";

export default function BusinessPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-white">
      <h1 className="mb-6 text-3xl font-bold">My Store</h1>
      <SellerTabs />
      <BusinessTab />
    </div>
  );
}
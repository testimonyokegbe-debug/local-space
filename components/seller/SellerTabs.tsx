"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

const tabs = [
  { href: "/seller/products", label: "My Products" },
  { href: "/seller/services", label: "My Services" },
  { href: "/seller/business", label: "Business info" },
];

export default function SellerTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex gap-1 border-b border-white/10 sm:gap-2">
      {tabs.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition sm:px-4 ${
            pathname === item.href
              ? "border-[#c4b5fd] text-[#c4b5fd]"
              : "border-transparent text-gray-300 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
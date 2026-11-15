"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { label: "Home", href: "/" },
  { label: "Get started", href: "/customer/#get-started" },
  { label: "Market", href: "/customer#market" },
  { label: "Testimonials", href: "/customer/#testimonials" },
  { label: "Contact", href: "/customer/#contact" },
];

export default function CustomerNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // TODO: clear the session here
    router.push("/login");
  };

  return (
    <header className="sticky top-3 z-50 px-4">
      <nav className="mx-auto flex max-w-[1100px] items-center justify-between rounded-full border border-[#d4a63a] bg-[#1e1b4b]/85 py-2.5 pl-6 pr-3 shadow-[0_0_0_1px_rgba(212,166,58,0.15),0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <Link href="/customer/main" className="text-lg font-bold text-[#d4a63a]">
          Local Space
        </Link>

        <ul className="hidden gap-7 md:flex">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className={`relative px-0.5 py-1.5 text-[#d4a63a] transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:bg-[#d4a63a] after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                    active ? "after:scale-x-100" : "after:scale-x-0"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3.5">
          <span className="h-[22px] w-px bg-[#d4a63a]/50" />
          <button
            onClick={handleLogout}
            className="cursor-pointer rounded-full border border-[#d4a63a] bg-[#c4b5fd] px-5 py-2 font-semibold text-[#1e1b4b] transition hover:-translate-y-px hover:bg-[#d4a63a]"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
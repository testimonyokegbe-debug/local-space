"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { assets } from "@/lib/assets";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: clear the session here
    router.push("/login");
  };

  return (
    <nav className="bg-[#c4b5fd]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/">
          <Image
            src={assets.logo}
            alt="Local Space"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        <button
          onClick={handleLogout}
          className="rounded-full bg-[#1e1b4b] px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
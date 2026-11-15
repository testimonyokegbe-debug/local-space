import Link from "next/link";
import { assets } from "@/lib/assets";

const roles = [
  {
    title: "Customer",
    desc: "Find and book trusted local services.",
    href: "/login?role=customer",
  },
  {
    title: "Seller",
    desc: "List your services and get new clients.",
    href: "/login?role=seller",
  },
  {
    title: "Admin",
    desc: "Manage users, listings and the platform.",
    href: "/login?role=admin",
  },
];

export default function Home() {
  return (
    <main>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-20 text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={assets.landingVideo}
          poster={assets.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 w-full max-w-5xl text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Welcome to Local Space</h1>
          <p className="mt-3 text-gray-200">How would you like to get started?</p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.title}
                className="flex flex-col items-center rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md"
              >
                <h2 className="text-2xl font-semibold">{role.title}</h2>
                <p className="mt-3 flex-1 text-sm text-gray-200">{role.desc}</p>
                <Link
                  href={role.href}
                  className="mt-6 block w-full rounded-lg bg-[#c4b5fd] px-6 py-3 text-center font-medium text-gray-900 transition hover:brightness-95"
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
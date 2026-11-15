import Link from "next/link";
import Footer from "@/components/footer";

export default function CustomerMainPage() {
  return (
    <>
      <section className="mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center text-white">
        <span className="mb-4 rounded-full border border-gold px-4 py-1 text-sm text-gold">
          Local services, near you
        </span>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Find and book{" "}
          <span className="text-lavender">trusted local services</span> in
          minutes.
        </h1>

        <p className="mt-5 max-w-xl text-white/70">
          Local Space connects you with service providers around you, wherever
          you are.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/customer/market"
            className="rounded-full bg-lavender px-7 py-3 font-semibold text-indigo-deep transition hover:bg-gold"
          >
            Explore market
          </Link>

          <Link
            href="/customer/about"
            className="rounded-full border border-gold px-7 py-3 font-semibold text-white transition hover:bg-gold/10"
          >
            Learn more
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
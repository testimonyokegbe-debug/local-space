"use client";

import { useRef } from "react";

type Testimonial = {
  name: string;
  role: "Customer" | "Seller";
  rating: number;
  text: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Oluwanifemi A.",
    role: "Customer",
    rating: 5,
    text: "I booked a plumber in ten minutes and he showed up the same day. No more asking around.",
  },
 {
    name: "Uche-Awaji O.",
    role: "Seller",
    rating: 5,
    text: "Setting up my product page was simple, and customers can shop from me directly with ease.",
  },
  {
    name: "Lucky D.",
    role: "Customer",
    rating: 4,
    text: "A convenient way to discover local businesses and services.",
  },
  {
    name: "Tunde A.",
    role: "Seller",
    rating: 4.,
    text: "My first week on Local Space brought in new orders from people living near my shop.",
  },
  {
    name: "Emmanuella A.",
    role: "Customer",
    rating: 5,
    text: "“Finding what I need has become so much easier. I can discover products and services in one place without the stress.”",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={n <= rating ? "#f59e0b" : "none"}
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    rowRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <section className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-[#332d83]/30 px-6 py-14">
            <div className="relative">
        <h2 className="text-center text-3xl font-bold text-white md:text-4xl">
          Testimonials
        </h2>
        <p className="mt-2 text-center text-sm text-white/70">
          What our customers and sellers say about Local Space.
        </p>

        <div
          ref={rowRef}
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="flex w-72 shrink-0 snap-start flex-col gap-4 rounded-2xl bg-white/95 p-6 shadow-lg"
            >
              <Stars rating={t.rating} />

              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-slate-900">{t.name}</p>
                <span
                  className={
                    t.role === "Seller"
                      ? "rounded-full bg-[#332d83] px-3 py-0.5 text-xs font-medium text-white"
                      : "rounded-full bg-[#f59e0b] px-3 py-0.5 text-xs font-medium text-neutral-900"
                  }
                >
                  {t.role}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-slate-600">{t.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scroll(dir)}
              aria-label={dir === -1 ? "Previous testimonials" : "Next testimonials"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={dir === -1 ? "M19 12H5m7-7-7 7 7 7" : "M5 12h14m-7-7 7 7-7 7"} />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
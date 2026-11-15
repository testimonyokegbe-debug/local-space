"use client";

import { useState } from "react";

export type ViewVariant = {
  id: string;
  name: string;
  price: number | null; // null means "use the product's price"
  quantity: number;
  image: string | null;
};

export type ViewProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  details: string;
  description: string;
  variants: ViewVariant[];
};

export default function ProductView({ product }: { product: ViewProduct }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState("");

  const hasSubProducts = product.variants.length > 0;
  const selected = product.variants.find((v) => v.id === selectedId) ?? null;

  // the picked sub product changes the image, price and stock
  const image = selected?.image ?? product.image;
  const price = selected ? (selected.price ?? product.price) : product.price;
  const stock = selected ? selected.quantity : product.quantity;

  const needsPick = hasSubProducts && !selected;
  const soldOut = !needsPick && stock === 0;
  const disabled = needsPick || soldOut;

  const pick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    setQty(1);
    setNotice("");
  };

  const changeQty = (next: number) => {
    setQty(Math.min(Math.max(1, next), Math.max(stock, 1)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-[26rem_1fr]">
        {/* LEFT BOX: image + sub product buttons */}
        <div className="rounded-xl bg-[#2e2a7a] p-4">
          <div
            className="flex aspect-square w-full items-center justify-center rounded-lg bg-white/10 bg-cover bg-center text-sm text-gray-400"
            style={image ? { backgroundImage: `url(${image})` } : undefined}
          >
            {!image && "No image"}
          </div>

          {hasSubProducts && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-300">
                Sub products
              </p>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => pick(v.id)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                      v.id === selectedId
                        ? "border-[#f59e0b] bg-[#f59e0b] text-[#1e1b4b]"
                        : "border-white/25 text-gray-200 hover:border-[#f59e0b]"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT BOX: name, price, quantity + add to cart, purchase, rating */}
        <div className="flex flex-col gap-5 rounded-xl bg-[#2e2a7a] p-6">
          <h1 className="text-3xl font-bold md:text-4xl">{product.name}</h1>

          <p className="text-3xl font-bold text-[#c4b5fd]">
            ₦{price.toLocaleString()}
          </p>

          {/* Quantity + Add to cart on the same line */}
          <div className="flex items-stretch gap-3">
            <div className="flex shrink-0 items-center rounded-md border border-white/25">
              <button
                type="button"
                disabled={disabled}
                onClick={() => changeQty(qty - 1)}
                className="px-4 py-3 text-lg disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span className="min-w-8 text-center">{qty}</span>

              <button
                type="button"
                disabled={disabled}
                onClick={() => changeQty(qty + 1)}
                className="px-4 py-3 text-lg disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setNotice("Cart is coming soon.")}
              className="flex-1 rounded-md bg-[#f59e0b] px-6 py-3 font-semibold text-[#1e1b4b] shadow-md transition hover:bg-amber-400 disabled:opacity-40"
            >
              Add to cart
            </button>
          </div>

          {/* Purchase below, same gold, full width */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setNotice("Checkout is coming soon.")}
            className="w-full rounded-md bg-[#f59e0b] px-6 py-3 font-semibold text-[#1e1b4b] shadow-md transition hover:bg-amber-400 disabled:opacity-40"
          >
            Purchase
          </button>

          {needsPick && (
            <p className="text-sm text-amber-300">
              Select a sub product to continue.
            </p>
          )}

          {soldOut && <p className="text-sm text-red-300">Out of stock.</p>}

          {notice && <p className="text-sm text-amber-300">{notice}</p>}

          {/* Rating (last) */}
          <div className="flex items-center gap-2 border-t border-white/10 pt-4 text-sm">
            <span className="text-lg tracking-wider text-white/20">★★★★★</span>
            <span className="text-neutral-300">No ratings yet</span>
          </div>
        </div>
      </div>

      {/* Details + description box, full width */}
      {(product.details || product.description) && (
        <div className="flex flex-col gap-6 rounded-xl bg-[#2e2a7a] p-6">
          {product.details && (
            <div>
              <h2 className="text-xl font-semibold">Product details</h2>
              <p className="mt-2 whitespace-pre-line text-neutral-300">
                {product.details}
              </p>
            </div>
          )}

          {product.description && (
            <div>
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="mt-2 whitespace-pre-line text-neutral-300">
                {product.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
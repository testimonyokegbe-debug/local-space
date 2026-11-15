"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Product, ProductVariant } from "./types";
import { Modal, inputClass, labelClass, fileClass } from "./ui";
import { validateImage } from "./useImagePreview";
import { uploadImage } from "./uploadImage";

type Props = {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  storeId: number;
};

const stockBadge = (quantity: number) => {
  if (quantity === 0) {
    return { label: "Out of stock", className: "bg-red-400/20 text-red-300" };
  }

  if (quantity <= 5) {
    return { label: "Low stock", className: "bg-amber-400/20 text-amber-300" };
  }

  return { label: "In stock", className: "bg-green-400/20 text-green-300" };
};

const newVariant = (): ProductVariant => ({
  id: crypto.randomUUID(),
  name: "",
  price: "",
  quantity: "",
  image: null,
});

export default function ProductsTab({ products, setProducts, storeId }: Props) {
  const [viewModal, setViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [productModal, setProductModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pQuantity, setPQuantity] = useState("");
  const [pImage, setPImage] = useState<string | null>(null);
  const [pDetails, setPDetails] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [pError, setPError] = useState("");

  const openAdd = () => {
    setPName("");
    setPPrice("");
    setPQuantity("");
    setPImage(null);
    setPDetails("");
    setPDescription("");
    setHasVariants(false);
    setVariants([]);
    setPError("");
    setFileKey((key) => key + 1);
    setEditingId(null);
    setProductModal(true);
  };

  const openEdit = (product: Product) => {
    setPName(product.name);
    setPPrice(product.price);
    setPQuantity(product.quantity);
    setPImage(product.image);
    setPDetails(product.details ?? "");
    setPDescription(product.description ?? "");
    setHasVariants((product.variants?.length ?? 0) > 0);
    setVariants(product.variants ?? []);
    setPError("");
    setFileKey((key) => key + 1);
    setEditingId(product.id);
    setProductModal(true);
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);

    if (error) {
      setPError(error);
      e.target.value = "";
      return;
    }

    setPError("");
    setUploading(true);

    try {
      setPImage(await uploadImage(file));
    } catch (err) {
      setPError(err instanceof Error ? err.message : "Could not upload image.");
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  /* ---------- sub products ---------- */

  const toggleVariants = (on: boolean) => {
    setHasVariants(on);
    if (on && variants.length === 0) setVariants([newVariant()]);
  };

  const updateVariant = (id: string, patch: Partial<ProductVariant>) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...patch } : v))
    );
  };

  const addVariant = () => setVariants((prev) => [...prev, newVariant()]);

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVariantImage = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);

    if (error) {
      setPError(error);
      e.target.value = "";
      return;
    }

    setPError("");
    setUploading(true);

    try {
      const url = await uploadImage(file);
      updateVariant(id, { image: url });
    } catch (err) {
      setPError(err instanceof Error ? err.message : "Could not upload image.");
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  /* ---------- save / delete ---------- */

  const handleSave = async () => {
    if (saving || uploading) return;

    const name = pName.trim();
    const price = Number(pPrice);
    let quantity = Number(pQuantity);

    if (!name) {
      setPError("Enter the product name.");
      return;
    }

    if (pPrice.trim() === "" || !Number.isFinite(price) || price < 0) {
      setPError("Enter a valid price.");
      return;
    }

    let cleanVariants: ProductVariant[] = [];

    if (hasVariants) {
      if (variants.length === 0) {
        setPError("Add at least one sub product, or turn sub products off.");
        return;
      }

      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const vQty = Number(v.quantity);
        const vPrice = Number(v.price);

        if (!v.name.trim()) {
          setPError(`Enter a name for sub product ${i + 1}.`);
          return;
        }

        if (
          v.quantity.trim() === "" ||
          !Number.isSafeInteger(vQty) ||
          vQty < 0
        ) {
          setPError(`Enter a valid stock number for "${v.name.trim()}".`);
          return;
        }

        if (
          v.price.trim() !== "" &&
          (!Number.isFinite(vPrice) || vPrice < 0)
        ) {
          setPError(`Enter a valid price for "${v.name.trim()}".`);
          return;
        }
      }

      cleanVariants = variants.map((v) => ({ ...v, name: v.name.trim() }));

      // total stock = sum of the sub products' stock
      quantity = cleanVariants.reduce((sum, v) => sum + Number(v.quantity), 0);
    } else if (
      pQuantity.trim() === "" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 0
    ) {
      setPError("Enter a valid quantity (whole number).");
      return;
    }

    const details = pDetails.trim();
    const description = pDescription.trim();

    setSaving(true);

    try {
      const res = await fetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            store_id: storeId,
            name,
            price,
            quantity,
            image: pImage,
            details,
            description,
            variants: cleanVariants,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || "Could not save product.");

      const saved: Product = {
        id: data.id,
        name: data.name,
        price: String(data.price),
        quantity: String(data.quantity),
        image: data.image,
        details: data.details ?? details,
        description: data.description ?? description,
        variants: data.variants ?? cleanVariants,
      };

      setProducts((prev) =>
        editingId
          ? prev.map((product) => (product.id === editingId ? saved : product))
          : [...prev, saved]
      );

      setProductModal(false);
    } catch (err) {
      setPError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });

      if (!res.ok) throw new Error();

      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch {
      window.alert("Could not delete the product.");
    }
  };

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setViewModal(true)}
          className="rounded-full bg-[#c4b5fd] px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:brightness-95"
        >
          View products
        </button>

        {products.length > 0 && (
          <button
            type="button"
            onClick={openAdd}
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/10"
          >
            + Add product
          </button>
        )}
      </div>

      {/* List */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 px-6 py-20 text-center">
          <p className="text-lg font-semibold">No products yet</p>
          <p className="mt-1 text-sm text-gray-300">
            Add your first product to get started.
          </p>

          <button
            type="button"
            onClick={openAdd}
            className="mt-6 rounded-full bg-[#c4b5fd] px-6 py-2.5 text-sm font-medium text-gray-900 transition hover:brightness-95"
          >
            + Add product
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const quantity = Number(product.quantity);
            const badge = stockBadge(quantity);

            return (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5"
              >
                <div
                  className="flex h-48 items-center justify-center bg-white/5 bg-cover bg-center text-sm text-gray-400"
                  style={
                    product.image
                      ? { backgroundImage: `url(${product.image})` }
                      : undefined
                  }
                >
                  {!product.image && "No image"}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold">{product.name}</h3>

                  <p className="mt-1 text-lg font-bold text-[#c4b5fd]">
                    ₦{Number(product.price).toLocaleString()}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>

                    <span className="text-gray-300">{quantity} available</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingProduct(product)}
                      className="flex-1 rounded-full border border-white/20 py-1.5 text-sm font-medium text-gray-200 transition hover:bg-white/10"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="flex-1 rounded-full bg-[#c4b5fd] py-1.5 text-sm font-medium text-gray-900 transition hover:brightness-95"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 rounded-full border border-red-400/40 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW LIST MODAL (view only) */}
      {viewModal && (
        <Modal title="Your products" error="" onClose={() => setViewModal(false)}>
          <div className="mt-5 flex flex-col gap-3">
            {products.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-300">
                No products yet.
              </p>
            )}

            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/10 bg-cover bg-center text-[10px] text-gray-400"
                  style={
                    product.image
                      ? { backgroundImage: `url(${product.image})` }
                      : undefined
                  }
                >
                  {!product.image && "No image"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {product.name}
                  </p>
                  <p className="text-sm font-bold text-[#c4b5fd]">
                    ₦{Number(product.price).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-300">
                    {product.quantity} available
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setViewModal(false);
                openAdd();
              }}
              className="rounded-full bg-[#c4b5fd] px-6 py-2.5 text-sm font-medium text-gray-900 transition hover:brightness-95"
            >
              + Add product
            </button>

            <button
              type="button"
              onClick={() => setViewModal(false)}
              className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* VIEW ONE PRODUCT MODAL */}
      {viewingProduct && (
        <Modal
          title={viewingProduct.name}
          error=""
          onClose={() => setViewingProduct(null)}
        >
          <div className="mt-5 flex flex-col gap-4">
            <div
              className="flex h-56 items-center justify-center rounded-xl bg-white/5 bg-cover bg-center text-sm text-gray-400"
              style={
                viewingProduct.image
                  ? { backgroundImage: `url(${viewingProduct.image})` }
                  : undefined
              }
            >
              {!viewingProduct.image && "No image"}
            </div>

            <div>
              <p className="text-xl font-bold text-[#c4b5fd]">
                ₦{Number(viewingProduct.price).toLocaleString()}
              </p>
              <p className="text-sm text-gray-300">
                {viewingProduct.quantity} available
              </p>
            </div>

            {viewingProduct.details && (
              <div>
                <p className="text-sm font-semibold">Product details</p>
                <p className="mt-1 whitespace-pre-line text-sm text-gray-300">
                  {viewingProduct.details}
                </p>
              </div>
            )}

            {viewingProduct.description && (
              <div>
                <p className="text-sm font-semibold">Description</p>
                <p className="mt-1 whitespace-pre-line text-sm text-gray-300">
                  {viewingProduct.description}
                </p>
              </div>
            )}

            {(viewingProduct.variants?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-semibold">Sub products</p>

                <div className="mt-2 flex flex-col gap-2">
                  {viewingProduct.variants?.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 bg-cover bg-center text-[10px] text-gray-400"
                        style={
                          v.image
                            ? { backgroundImage: `url(${v.image})` }
                            : undefined
                        }
                      >
                        {!v.image && "No image"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {v.name}
                        </p>
                        <p className="text-sm text-[#c4b5fd]">
                          ₦
                          {Number(
                            v.price.trim() === ""
                              ? viewingProduct.price
                              : v.price
                          ).toLocaleString()}
                        </p>
                      </div>

                      <p className="text-xs text-gray-300">
                        {v.quantity} available
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setViewingProduct(null)}
              className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* ADD / EDIT MODAL */}
      {productModal && (
        <Modal
          title={editingId ? "Edit product" : "Add product"}
          error={pError}
          onClose={() => setProductModal(false)}
        >
          <div className="mt-5 flex flex-col gap-4">
            <div>
              <label className={labelClass}>Product name</label>
              <input
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Cleaning kit"
              />
            </div>

            <div>
              <label className={labelClass}>Product details</label>
              <textarea
                value={pDetails}
                onChange={(e) => setPDetails(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="Quick facts: size, brand, material..."
              />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={pDescription}
                onChange={(e) => setPDescription(e.target.value)}
                rows={6}
                className={inputClass}
                placeholder="Tell customers more about this product..."
              />
            </div>

            <div className={hasVariants ? "" : "grid grid-cols-2 gap-4"}>
              <div>
                <label className={labelClass}>Price (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                  className={inputClass}
                  placeholder="0000"
                />
                {hasVariants && (
                  <p className="mt-1 text-xs text-gray-400">
                    Used by any sub product that has no price of its own.
                  </p>
                )}
              </div>

              {!hasVariants && (
                <div>
                  <label className={labelClass}>Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pQuantity}
                    onChange={(e) => setPQuantity(e.target.value)}
                    className={inputClass}
                    placeholder="00"
                  />
                </div>
              )}
            </div>

            {/* Product image (always shown, separate from sub product pictures) */}
            <div>
              <label className={labelClass}>Product image</label>
              <input
                key={fileKey}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className={fileClass}
                onChange={handleImage}
              />

              <p className="mt-1 text-xs text-gray-400">
                {uploading ? "Uploading..." : "PNG, JPG or WEBP, up to 2 MB."}
              </p>

              {pImage && (
                <div
                  role="img"
                  aria-label="Product image preview"
                  className="mt-3 h-24 w-24 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${pImage})` }}
                />
              )}
            </div>

            {/* Sub products switch */}
            <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => toggleVariants(e.target.checked)}
                className="h-4 w-4 accent-[#c4b5fd]"
              />
              This product has sub products (e.g. sizes, scents, colors)
            </label>

            {hasVariants && (
              <div className="flex flex-col gap-4">
                {variants.map((v, index) => (
                  <div
                    key={v.id}
                    className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        Sub product {index + 1}
                      </p>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(v.id)}
                          className="text-xs font-medium text-red-300 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        value={v.name}
                        onChange={(e) =>
                          updateVariant(v.id, { name: e.target.value })
                        }
                        className={inputClass}
                        placeholder="e.g. A1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Price (optional)</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={v.price}
                          onChange={(e) =>
                            updateVariant(v.id, { price: e.target.value })
                          }
                          className={inputClass}
                          placeholder="Same as product"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Stock</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={v.quantity}
                          onChange={(e) =>
                            updateVariant(v.id, { quantity: e.target.value })
                          }
                          className={inputClass}
                          placeholder="00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Sub product picture</label>
                      <input
                        key={`${fileKey}-${v.id}`}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className={fileClass}
                        onChange={(e) => handleVariantImage(v.id, e)}
                      />

                      {v.image && (
                        <div
                          role="img"
                          aria-label={`${v.name || "Sub product"} picture preview`}
                          className="mt-3 h-24 w-24 rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${v.image})` }}
                        />
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addVariant}
                  className="self-start rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10"
                >
                  + Add another sub product
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className="rounded-full bg-[#c4b5fd] px-6 py-2.5 font-medium text-gray-900 transition hover:brightness-95 disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Save changes" : "Add product"}
            </button>

            <button
              type="button"
              onClick={() => setProductModal(false)}
              className="rounded-full border border-white/20 px-6 py-2.5 font-medium text-gray-200 transition hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
"use client";

import { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { categories, emptyBusiness } from "./types";
import type { Business } from "./types";
import { inputClass, labelClass, fileClass } from "./ui";
import { validateImage } from "./useImagePreview";
import { uploadImage } from "./uploadImage";

// Temporary: the browser remembers the store id until login is added
const STORE_KEY = "localspace_store_id";

type Props = {
  onNameChange?: (name: string) => void;
};

export default function BusinessTab({ onNameChange }: Props) {
  const [business, setBusiness] = useState<Business>({ ...emptyBusiness });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

  // Load the store saved earlier, so the form is filled in
  useEffect(() => {
    let id: string | null = null;

    try {
      id = localStorage.getItem(STORE_KEY);
    } catch {}

    if (!id) return;

    fetch(`/api/stores/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((store) => {
        if (!store) {
          try {
            localStorage.removeItem(STORE_KEY);
          } catch {}
          return;
        }

        setStoreId(String(store.id));

        setBusiness((prev) => ({
          ...prev,
          name: store.name ?? "",
          description: store.description ?? "",
          category: store.category ?? "",
          phone: store.phone ?? "",
          email: store.email ?? "",
          address: store.address ?? "",
          location: store.location ?? "",
        }));

        onNameChange?.(store.name ?? "");

        if (store.logo_url) setLogoUrl(store.logo_url);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setBusiness((prev) => ({ ...prev, [name]: value }));

    if (name === "name") onNameChange?.(value);

    setSaved(false);
    setError("");
  };

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const err = validateImage(file);

    if (err) {
      setError(err);
      e.target.value = "";
      return;
    }

    setError("");
    setSaved(false);
    setUploading(true);

    try {
      setLogoUrl(await uploadImage(file));
    } catch (uploadErr) {
      setError(
        uploadErr instanceof Error
          ? uploadErr.message
          : "Could not upload image."
      );
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (uploading) return;

    if (!business.name.trim()) {
      setError("Enter your business name.");
      setSaved(false);
      return;
    }

    if (!business.category) {
      setError("Select a business category.");
      setSaved(false);
      return;
    }

    if (!business.phone.trim()) {
      setError("Enter your business phone number.");
      setSaved(false);
      return;
    }

    const email = business.email.trim();

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid business email.");
      setSaved(false);
      return;
    }

    setError("");
    setSaving(true);

    try {
      // First save creates the store, later saves edit it
      const res = await fetch(
        storeId ? `/api/stores/${storeId}` : "/api/stores",
        {
          method: storeId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: business.name.trim(),
            description: business.description.trim(),
            category: business.category,
            phone: business.phone,
            email,
            address: business.address.trim(),
            location: business.location.trim(),
            logo_url: logoUrl,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Could not save your store.");
      }

      if (data.id != null) {
        setStoreId(String(data.id));

        try {
          localStorage.setItem(STORE_KEY, String(data.id));
        } catch {}
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <div
          role="img"
          aria-label="Business logo preview"
          className="h-20 w-20 shrink-0 rounded-full border-2 border-white/20 bg-[#c4b5fd] bg-cover bg-center"
          style={logoUrl ? { backgroundImage: `url(${logoUrl})` } : undefined}
        />

        <h2 className="text-xl font-semibold">Business information</h2>
      </div>

      {saved && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-green-400/30 bg-green-500/10 px-4 py-2 text-sm text-green-300"
        >
          Store saved! It now shows on the Store page.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div>
          <label className={labelClass}>Business logo</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className={fileClass}
            onChange={handleLogo}
          />
          <p className="mt-1 text-xs text-gray-400">
            {uploading ? "Uploading..." : "PNG, JPG or WEBP, up to 2 MB."}
          </p>
        </div>

        <div>
          <label className={labelClass}>Business name *</label>
          <input
            name="name"
            value={business.name}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. Bright Home Cleaning"
          />
        </div>

        <div>
          <label className={labelClass}>Business description</label>
          <textarea
            name="description"
            value={business.description}
            onChange={handleChange}
            rows={4}
            className={inputClass}
            placeholder="Tell customers what you do and why they should choose you"
          />
        </div>

        <div>
          <label className={labelClass}>Business category *</label>
          <select
            name="category"
            value={business.category}
            onChange={handleChange}
            className={`${inputClass} [&>option]:text-gray-900`}
          >
            <option value="">Select a category</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Phone number *</label>
            <PhoneInput
              defaultCountry="NG"
              addInternationalOption={false}
              value={business.phone}
              onChange={(value) => {
                setBusiness((prev) => ({ ...prev, phone: value ?? "" }));
                setSaved(false);
                setError("");
              }}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className={labelClass}>Business email</label>
            <input
              type="email"
              name="email"
              value={business.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="business@example.com"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Business address</label>
            <input
              name="address"
              value={business.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Street address"
            />
          </div>

          <div>
            <label className={labelClass}>Location (city / state)</label>
            <input
              name="location"
              value={business.location}
              onChange={handleChange}
              className={inputClass}
              placeholder="Port Harcourt, Rivers"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Bank name</label>
          <input
            name="bankName"
            value={business.bankName}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. GTBank"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Account name</label>
            <input
              name="accountName"
              value={business.accountName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Name on the account"
            />
          </div>

          <div>
            <label className={labelClass}>Account number</label>
            <input
              name="accountNumber"
              value={business.accountNumber}
              onChange={handleChange}
              className={inputClass}
              inputMode="numeric"
              maxLength={10}
              placeholder="0123456789"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || uploading}
        className="mt-8 rounded-full bg-[#c4b5fd] px-6 py-2.5 font-medium text-gray-900 transition hover:brightness-95 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save business information"}
      </button>
    </div>
  );
}
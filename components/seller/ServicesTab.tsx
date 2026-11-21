"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Clock, MapPin, Phone, AtSign } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { emptyService } from "./types";
import type { Service, ServiceForm, ServiceVariant } from "./types";
import { Modal, inputClass, labelClass, fileClass } from "./ui";
import { validateImage } from "./useImagePreview";
import { uploadImage } from "./uploadImage";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const money = (value: string | number) =>
  `₦${Number(value).toLocaleString()}`;

// the price a sub service really has (its own, or the service's)
const effectivePrice = (v: ServiceVariant, servicePrice: string) =>
  v.price !== "" ? Number(v.price) : Number(servicePrice);

// "From ₦5,500" when there are sub services, otherwise the normal price
const cardPrice = (s: { price: string; variants: ServiceVariant[] }) => {
  if (s.variants?.length > 0) {
    const min = Math.min(...s.variants.map((v) => effectivePrice(v, s.price)));
    return `From ${money(min)}`;
  }
  return money(s.price);
};

// "₦6,000–9,000" for ranges, otherwise "₦5,500"
const subPrice = (v: ServiceVariant, servicePrice: string) => {
  const from = effectivePrice(v, servicePrice);
  return v.priceTo
    ? `${money(from)}–${Number(v.priceTo).toLocaleString()}`
    : money(from);
};

type Props = {
  services: Service[];
  setServices: Dispatch<SetStateAction<Service[]>>;
};

export default function ServicesTab({ services, setServices }: Props) {
  const [viewModal, setViewModal] = useState(false);
  const [serviceModal, setServiceModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadingSub, setUploadingSub] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasSubs, setHasSubs] = useState(false);
  const [sForm, setSForm] = useState<ServiceForm>({ ...emptyService });
  const [sError, setSError] = useState("");

  const busy = uploading || uploadingSub !== null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day: string) => {
    setSForm((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  // ----- sub services -----
  const newSub = (): ServiceVariant => ({
    id: crypto.randomUUID(),
    name: "",
    price: "",
    priceTo: "",
    description: "",
    image: null,
  });

  const toggleHasSubs = (checked: boolean) => {
    setHasSubs(checked);
    setSForm((prev) => ({
      ...prev,
      variants: checked ? [newSub()] : [],
    }));
  };

  const addSub = () => {
    setSForm((prev) => ({ ...prev, variants: [...prev.variants, newSub()] }));
  };

  const updateSub = (
    id: string,
    field: "name" | "price" | "priceTo" | "description",
    value: string
  ) => {
    setSForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    }));
  };

  const removeSub = (id: string) => {
    setSForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== id),
    }));
  };

  const setSubImage = (id: string, image: string | null) => {
    setSForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.id === id ? { ...v, image } : v)),
    }));
  };

  const handleSubImage = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);

    if (error) {
      setSError(error);
      e.target.value = "";
      return;
    }

    setSError("");
    setUploadingSub(id);

    try {
      const url = await uploadImage(file);
      setSubImage(id, url);
    } catch (err) {
      setSError(err instanceof Error ? err.message : "Could not upload image.");
    } finally {
      setUploadingSub(null);
      e.target.value = "";
    }
  };

  // ----- main image -----
  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);

    if (error) {
      setSError(error);
      e.target.value = "";
      return;
    }

    setSError("");
    setUploading(true);

    try {
      const url = await uploadImage(file);
      setSForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      setSError(err instanceof Error ? err.message : "Could not upload image.");
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setSForm({ ...emptyService });
    setHasSubs(false);
    setSError("");
    setFileKey((key) => key + 1);
    setEditingId(null);
    setServiceModal(true);
  };

  const openEdit = (service: Service) => {
    setSForm({
      name: service.name,
      price: service.price,
      availability: service.availability,
      days: service.days ?? [],
      timeFrom: service.timeFrom ?? "09:00",
      timeTo: service.timeTo ?? "17:00",
      phone: service.phone,
      location: service.location,
      social: service.social,
      image: service.image,
      variants: (service.variants ?? []).map((v) => ({
        ...v,
        description: v.description ?? "",
        image: v.image ?? null,
      })),
    });

    setHasSubs((service.variants ?? []).length > 0);
    setSError("");
    setFileKey((key) => key + 1);
    setEditingId(service.id);
    setServiceModal(true);
  };

  const handleSave = async () => {
    if (saving || busy) return;

    const name = sForm.name.trim();

    // drop empty sub service rows (only when the checkbox is ticked)
    const variants = hasSubs
      ? sForm.variants
          .filter((v) => v.name.trim() !== "")
          .map((v) => ({
            ...v,
            name: v.name.trim(),
            price: v.price.trim(),
            priceTo: v.priceTo.trim(),
            description: v.description.trim(),
          }))
      : [];

    const price = Number(sForm.price);
    const priceOk =
      sForm.price.trim() !== "" && Number.isFinite(price) && price >= 0;

    // the service price is needed unless every sub service has its own
    const needsMainPrice =
      variants.length === 0 || variants.some((v) => v.price === "");

    if (!name) {
      setSError("Enter the service name.");
      return;
    }

    if (needsMainPrice && !priceOk) {
      setSError(
        variants.length > 0
          ? "Enter the service price, or give every sub service its own price."
          : "Enter a valid price."
      );
      return;
    }

    for (const v of variants) {
      if (v.price !== "" && (!Number.isFinite(Number(v.price)) || Number(v.price) < 0)) {
        setSError(`Enter a valid price for "${v.name}".`);
        return;
      }

      const from = v.price !== "" ? Number(v.price) : price;

      if (
        v.priceTo !== "" &&
        (!Number.isFinite(Number(v.priceTo)) || Number(v.priceTo) < from)
      ) {
        setSError(`"Up to" price for "${v.name}" must be more than its price.`);
        return;
      }
    }

    if (sForm.days.length === 0) {
      setSError("Pick at least one available day.");
      return;
    }

    if (!sForm.timeFrom || !sForm.timeTo || sForm.timeFrom >= sForm.timeTo) {
      setSError("End time must be after start time.");
      return;
    }

    if (!sForm.phone.trim()) {
      setSError("Enter a contact number.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        editingId ? `/api/services/${editingId}` : "/api/services",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            price: priceOk ? price : null,
            availability: `${sForm.days.join(", ")} · ${sForm.timeFrom}–${sForm.timeTo}`,
            days: sForm.days,
            timeFrom: sForm.timeFrom,
            timeTo: sForm.timeTo,
            phone: sForm.phone.trim(),
            location: sForm.location.trim(),
            social: sForm.social.trim(),
            image: sForm.image,
            variants,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || "Could not save service.");

      const saved: Service = {
        ...data,
        price: data.price == null ? "" : String(data.price),
        variants: data.variants ?? [],
      };

      setServices((prev) =>
        editingId
          ? prev.map((service) => (service.id === editingId ? saved : service))
          : [...prev, saved]
      );

      setServiceModal(false);
    } catch (err) {
      setSError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });

      if (!res.ok) throw new Error();

      setServices((prev) => prev.filter((service) => service.id !== id));
    } catch {
      window.alert("Could not delete the service.");
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
          View services
        </button>

        {services.length > 0 && (
          <button
            type="button"
            onClick={openAdd}
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/10"
          >
            + Add service
          </button>
        )}
      </div>

      {/* List */}
      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 px-6 py-20 text-center">
          <p className="text-lg font-semibold">No services yet</p>
          <p className="mt-1 text-sm text-gray-300">
            Add the services you offer to customers.
          </p>

          <button
            type="button"
            onClick={openAdd}
            className="mt-6 rounded-full bg-[#c4b5fd] px-6 py-2.5 text-sm font-medium text-gray-900 transition hover:brightness-95"
          >
            + Add service
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              <div
                className="flex h-44 items-center justify-center bg-white/5 bg-cover bg-center text-sm text-gray-400"
                style={
                  service.image
                    ? { backgroundImage: `url(${service.image})` }
                    : undefined
                }
              >
                {!service.image && "No image"}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{service.name}</h3>

                  <p className="shrink-0 font-bold text-[#c4b5fd]">
                    {cardPrice(service)}
                  </p>
                </div>

                <span className="mt-2 flex items-center gap-1.5 self-start rounded-full bg-[#c4b5fd]/20 px-3 py-0.5 text-xs text-[#c4b5fd]">
                  <Clock size={12} />
                  {service.availability}
                </span>

                {service.variants?.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {service.variants.map((v) => (
                      <li key={v.id} className="flex gap-3">
                        {v.image && (
                          <div
                            role="img"
                            aria-label={v.name}
                            className="h-12 w-12 shrink-0 rounded-lg bg-cover bg-center"
                            style={{ backgroundImage: `url(${v.image})` }}
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-3 text-sm text-gray-200">
                            <span>{v.name}</span>
                            <span className="shrink-0 text-[#c4b5fd]">
                              {subPrice(v, service.price)}
                            </span>
                          </div>

                          {v.description && (
                            <p className="mt-0.5 text-xs text-gray-400">
                              {v.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <ul className="mt-4 flex-1 space-y-1.5 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Phone size={14} className="shrink-0 text-gray-400" />
                    {service.phone}
                  </li>

                  {service.location && (
                    <li className="flex items-center gap-2">
                      <MapPin size={14} className="shrink-0 text-gray-400" />
                      {service.location}
                    </li>
                  )}

                  {service.social && (
                    <li className="flex items-center gap-2">
                      <AtSign size={14} className="shrink-0 text-gray-400" />
                      {service.social}
                    </li>
                  )}
                </ul>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(service)}
                    className="flex-1 rounded-full bg-[#c4b5fd] py-1.5 text-sm font-medium text-gray-900 transition hover:brightness-95"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    className="flex-1 rounded-full border border-red-400/40 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODAL */}
      {viewModal && (
        <Modal title="Your services" error="" onClose={() => setViewModal(false)}>
          <div className="mt-5 flex flex-col gap-3">
            {services.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-300">
                No services yet.
              </p>
            )}

            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/10 bg-cover bg-center text-[10px] text-gray-400"
                  style={
                    service.image
                      ? { backgroundImage: `url(${service.image})` }
                      : undefined
                  }
                >
                  {!service.image && "No image"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {service.name}
                  </p>
                  <p className="text-sm font-bold text-[#c4b5fd]">
                    {cardPrice(service)}
                  </p>
                  <p className="truncate text-xs text-gray-300">
                    {service.availability}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setViewModal(false);
                      openEdit(service);
                    }}
                    className="rounded-full bg-[#c4b5fd] px-4 py-1 text-xs font-medium text-gray-900 transition hover:brightness-95"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    className="rounded-full border border-red-400/40 px-4 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
                  >
                    Delete
                  </button>
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
              + Add service
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

      {/* ADD / EDIT MODAL */}
      {serviceModal && (
        <Modal
          title={editingId ? "Edit service" : "Add service"}
          error={sError}
          onClose={() => setServiceModal(false)}
        >
          <div className="mt-5 flex flex-col gap-4">
            <div>
              <label className={labelClass}>Service name</label>
              <input
                name="name"
                value={sForm.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Lashes"
              />
            </div>

            <div>
              <label className={labelClass}>Price (₦)</label>
              <input
                type="number"
                min="0"
                step="any"
                name="price"
                value={sForm.price}
                onChange={handleChange}
                className={inputClass}
                placeholder="0000"
              />
              {hasSubs && (
                <p className="mt-1 text-xs text-gray-400">
                  Used by any sub service that has no price of its own.
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Service image</label>
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

              {sForm.image && (
                <div
                  role="img"
                  aria-label="Service image preview"
                  className="mt-3 h-24 w-24 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${sForm.image})` }}
                />
              )}
            </div>

            {/* Sub services (optional) */}
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hasSubs}
                onChange={(e) => toggleHasSubs(e.target.checked)}
                className="h-4 w-4 accent-[#c4b5fd]"
              />
              This service has sub services (e.g. types, styles, sizes)
            </label>

            {hasSubs && (
              <div className="flex flex-col gap-3">
                {sForm.variants.map((v, i) => (
                  <div
                    key={v.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Sub service {i + 1}</p>

                      <button
                        type="button"
                        onClick={() => removeSub(v.id)}
                        className="text-xs text-red-300 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-3">
                      <label className={labelClass}>Name</label>
                      <input
                        value={v.name}
                        onChange={(e) => updateSub(v.id, "name", e.target.value)}
                        className={inputClass}
                        placeholder="e.g. Classic"
                      />
                    </div>

                    <div className="mt-3">
                      <label className={labelClass}>Description (optional)</label>
                      <textarea
                        value={v.description}
                        onChange={(e) =>
                          updateSub(v.id, "description", e.target.value)
                        }
                        rows={2}
                        className={inputClass}
                        placeholder="What does this include?"
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Price (optional)</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={v.price}
                          onChange={(e) => updateSub(v.id, "price", e.target.value)}
                          className={inputClass}
                          placeholder="Same as service"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Up to (optional)</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={v.priceTo}
                          onChange={(e) => updateSub(v.id, "priceTo", e.target.value)}
                          className={inputClass}
                          placeholder="e.g. 9000"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className={labelClass}>Sub service picture</label>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className={fileClass}
                        onChange={(e) => handleSubImage(v.id, e)}
                      />

                      <p className="mt-1 text-xs text-gray-400">
                        {uploadingSub === v.id
                          ? "Uploading..."
                          : "PNG, JPG or WEBP, up to 2 MB."}
                      </p>

                      {v.image && (
                        <div className="mt-3 flex items-end gap-3">
                          <div
                            role="img"
                            aria-label="Sub service picture preview"
                            className="h-20 w-20 rounded-lg bg-cover bg-center"
                            style={{ backgroundImage: `url(${v.image})` }}
                          />

                          <button
                            type="button"
                            onClick={() => setSubImage(v.id, null)}
                            className="text-xs text-red-300 hover:underline"
                          >
                            Remove picture
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSub}
                  className="self-start rounded-full border border-white/20 px-4 py-1.5 text-sm text-gray-200 transition hover:bg-white/10"
                >
                  + Add another sub service
                </button>
              </div>
            )}

            <div>
              <label className={labelClass}>Available days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-full border px-3 py-1 text-sm transition ${
                      sForm.days.includes(day)
                        ? "border-[#c4b5fd] bg-[#c4b5fd] text-gray-900"
                        : "border-white/20 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400">From</label>
                  <input
                    type="time"
                    name="timeFrom"
                    value={sForm.timeFrom}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400">To</label>
                  <input
                    type="time"
                    name="timeTo"
                    value={sForm.timeTo}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <p className="mt-2 text-sm font-semibold text-[#c4b5fd]">Contact</p>

            <div>
              <label className={labelClass}>Phone number *</label>
              <PhoneInput
                defaultCountry="NG"
                addInternationalOption={false}
                value={sForm.phone}
                onChange={(value) =>
                  setSForm((prev) => ({ ...prev, phone: value ?? "" }))
                }
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className={labelClass}>Location</label>
              <input
                name="location"
                value={sForm.location}
                onChange={handleChange}
                className={inputClass}
                placeholder="Port Harcourt, Rivers"
              />
            </div>

            <div>
              <label className={labelClass}>Social media handle</label>
              <input
                name="social"
                value={sForm.social}
                onChange={handleChange}
                className={inputClass}
                placeholder="@yourhandle"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || busy}
              className="rounded-full bg-[#c4b5fd] px-6 py-2.5 font-medium text-gray-900 transition hover:brightness-95 disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Save changes" : "Add service"}
            </button>

            <button
              type="button"
              onClick={() => setServiceModal(false)}
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
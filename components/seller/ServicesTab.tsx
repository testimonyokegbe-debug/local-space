"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Clock, MapPin, Phone, AtSign } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { emptyService } from "./types";
import type { Service, ServiceForm } from "./types";
import { Modal, inputClass, labelClass, fileClass } from "./ui";
import { validateImage } from "./useImagePreview";
import { uploadImage } from "./uploadImage";

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
  const [saving, setSaving] = useState(false);
  const [sForm, setSForm] = useState<ServiceForm>({ ...emptyService });
  const [sError, setSError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSForm((prev) => ({ ...prev, [name]: value }));
  };

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
    setSError("");
    setFileKey((key) => key + 1);
    setEditingId(null);
    setServiceModal(true);
  };

  const openEdit = (service: Service) => {
    setSForm({
      name: service.name,
      description: service.description,
      price: service.price,
      availability: service.availability,
      phone: service.phone,
      location: service.location,
      social: service.social,
      image: service.image,
    });

    setSError("");
    setFileKey((key) => key + 1);
    setEditingId(service.id);
    setServiceModal(true);
  };

  const handleSave = async () => {
    if (saving || uploading) return;

    const name = sForm.name.trim();
    const price = Number(sForm.price);

    if (!name) {
      setSError("Enter the service name.");
      return;
    }

    if (sForm.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      setSError("Enter a valid price.");
      return;
    }

    if (!sForm.availability.trim()) {
      setSError("Enter your availability.");
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
            description: sForm.description.trim(),
            price,
            availability: sForm.availability.trim(),
            phone: sForm.phone.trim(),
            location: sForm.location.trim(),
            social: sForm.social.trim(),
            image: sForm.image,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || "Could not save service.");

      const saved: Service = { ...data, price: String(data.price) };

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
                    ₦{Number(service.price).toLocaleString()}
                  </p>
                </div>

                <span className="mt-2 flex items-center gap-1.5 self-start rounded-full bg-[#c4b5fd]/20 px-3 py-0.5 text-xs text-[#c4b5fd]">
                  <Clock size={12} />
                  {service.availability}
                </span>

                {service.description && (
                  <p className="mt-3 text-sm text-gray-300">
                    {service.description}
                  </p>
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
                    ₦{Number(service.price).toLocaleString()}
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
                placeholder="e.g. Deep house cleaning"
              />
            </div>

            <div>
              <label className={labelClass}>Image</label>
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

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                value={sForm.description}
                onChange={handleChange}
                rows={3}
                className={inputClass}
                placeholder="What does this service include?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className={labelClass}>Availability</label>
                <input
                  name="availability"
                  value={sForm.availability}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. Mon–Sat, 9am–5pm"
                />
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
              disabled={saving || uploading}
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
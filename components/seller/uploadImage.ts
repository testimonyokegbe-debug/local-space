export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/uploads", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || "Could not upload image.");

  return data.url as string;
}
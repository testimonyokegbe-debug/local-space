"use client";

import { useCallback, useEffect, useRef } from "react";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Use a PNG, JPG or WEBP image.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be 2 MB or smaller.";
  }

  return null;
}

export function useImagePreview() {
  const objectUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  return useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    return url;
  }, []);
}
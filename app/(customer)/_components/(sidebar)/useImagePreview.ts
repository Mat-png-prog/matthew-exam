"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const imageFileSchema = z
  .instanceof(File)
  .refine(
    (file) =>
      ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/tiff"].includes(file.type),
    { message: "Invalid file type. Allowed: JPG, PNG, GIF, WebP, SVG, BMP, TIFF" }
  )
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "Image must be less than 5MB",
  });

export function useImagesPreview(initialUrl: string | null) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    const result = imageFileSchema.safeParse(file);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    handleFileSelect(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.[0]) return;
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const resetImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(initialUrl);
  };

  return {
    selectedFile,
    previewUrl,
    handleInputChange,
    handleDrop,
    resetImage,
    setPreviewUrl,
  };
}
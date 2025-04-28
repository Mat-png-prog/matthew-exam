//app/(public)/_components/(section-1)/validations.ts

import { z } from "zod";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "./types";

// Enhanced validation for creating slides
export const createSlideSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  bgColor: z.string().min(1, "Background color is required"),
  order: z.number().min(1, "Order must be at least 1"),
  sliderImage: z
    .any()
    .refine((file) => file instanceof File, "Image is required")
    .refine(
      (file) => file instanceof File && ALLOWED_IMAGE_TYPES.includes(file.type),
      `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`
    )
    .refine(
      (file) => file instanceof File && file.size <= MAX_IMAGE_SIZE,
      `Image must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
    ),
});

// Validation schema for editing slides
export const editSlideSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  bgColor: z.string().min(1, "Background color is required"),
  order: z.number().min(1, "Order must be at least 1"),
  sliderImage: z
    .any()
    .optional()
    .refine(
      (file) => !file || file instanceof File,
      "Image must be a valid file"
    )
    .refine(
      (file) =>
        !file ||
        (file instanceof File && ALLOWED_IMAGE_TYPES.includes(file.type)),
      `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`
    )
    .refine(
      (file) => !file || (file instanceof File && file.size <= MAX_IMAGE_SIZE),
      `Image must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
    ),
  currentImageUrl: z.string().optional(),
});

export type CreateSlideInput = z.infer<typeof createSlideSchema>;
export type EditSlideFormValues = z.infer<typeof editSlideSchema>;
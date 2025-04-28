//app/(public)/(group-products)/types.ts

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
];

export const MAX_IMAGE_SIZE = 6 * 1024 * 1024; // 6MB


export interface HeadwearSlide {
  id: string;
  sliderImageurl: string;
  title: string;
  description: string;
  bgColor: string;
  order: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HeadwearSlideResponse {
  success: boolean;
  data?: HeadwearSlide;
  error?: string;
}
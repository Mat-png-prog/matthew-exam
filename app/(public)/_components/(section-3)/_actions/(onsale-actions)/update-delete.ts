//app/(public)/_components/(section-3)/_actions/(onsale-actions)/update-delete.ts

"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob";
import prisma from "@/lib/prisma";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
];
const MAX_IMAGE_SIZE = 6 * 1024 * 1024; // 6MB

// Response types
interface OnSaleResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface PaginatedResponse {
  success: boolean;
  data?: {
    items: any[];
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

// Delete action - Also deletes the blob
export async function deleteOnSaleItem(
  id: string,
): Promise<OnSaleResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR" && user.role !== "SUPERADMIN") {
      return redirect("/");
    }

    // First, get the onSaleItem to access its imageUrl
    const onSaleItem = await prisma.onSale.findUnique({
      where: { id },
    });

    if (!onSaleItem) {
      throw new Error("On sale item not found");
    }

    // Delete the image from blob storage if it exists
    if (onSaleItem.imageUrl) {
      try {
        // Extract the URL path from the full URL
        const urlObj = new URL(onSaleItem.imageUrl);
        const blobPath = urlObj.pathname.substring(1); // Remove leading slash
        
        await del(blobPath);
      } catch (blobError) {
        console.error("Error deleting blob:", blobError);
        // Continue with record deletion even if blob deletion fails
      }
    }

    // Delete the record from the database
    const deletedOnSaleItem = await prisma.onSale.delete({
      where: { id },
    });

    return {
      success: true,
      data: deletedOnSaleItem,
    };
  } catch (error) {
    console.error("Error deleting on sale item:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Update action - Deletes old blob when image is replaced
export async function updateOnSaleItem(
  id: string,
  formData: FormData,
): Promise<OnSaleResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR" && user.role !== "SUPERADMIN") {
      return redirect("/");
    }

    // Get form data
    const name = formData.get("name") as string;
    const originalPrice = parseFloat(formData.get("originalPrice") as string);
    const salePrice = parseFloat(formData.get("salePrice") as string);
    const rating = parseInt(formData.get("rating") as string);
    const file = formData.get("image") as File;

    // Validate basic inputs
    if (!name || !originalPrice || !salePrice || !rating) {
      throw new Error("Name, original price, sale price, and rating are required");
    }
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    if (originalPrice <= 0) {
      throw new Error("Original price must be greater than 0");
    }
    if (salePrice <= 0) {
      throw new Error("Sale price must be greater than 0");
    }
    if (salePrice >= originalPrice) {
      throw new Error("Sale price must be less than original price");
    }

    // Get the current on sale item for its existing imageUrl
    const currentOnSaleItem = await prisma.onSale.findUnique({
      where: { id },
    });

    if (!currentOnSaleItem) {
      throw new Error("On sale item not found");
    }

    let imageUrl = currentOnSaleItem.imageUrl;

    // Handle image upload if a new file is provided
    if (file && file.size > 0) {
      // Validate image
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
        throw new Error(
          "Invalid file type. Allowed types are JPEG, PNG, GIF, WebP, SVG, BMP, and TIFF",
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        throw new Error("File size must be less than 6MB");
      }

      // Delete old image if it exists
      if (imageUrl) {
        try {
          // Extract the URL path from the full URL
          const urlObj = new URL(imageUrl);
          const blobPath = urlObj.pathname.substring(1); // Remove leading slash
          
          await del(blobPath);
        } catch (blobError) {
          console.error("Error deleting old blob:", blobError);
          // Continue with update even if old blob deletion fails
        }
      }

      // Upload new image
      const fileExt = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const path = `on-sale/product_${user.id}_${timestamp}.${fileExt}`;

      const blob = await put(path, file, {
        access: "public",
        addRandomSuffix: false,
      });

      if (!blob.url) throw new Error("Failed to get URL from blob storage");
      imageUrl = blob.url;
    }

    // Update on sale item in database
    const updatedOnSaleItem = await prisma.onSale.update({
      where: { id },
      data: {
        name,
        originalPrice,
        salePrice,
        rating,
        imageUrl,
      },
    });

    return {
      success: true,
      data: updatedOnSaleItem,
    };
  } catch (error) {
    console.error("Error updating on sale item:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
//app/(public)/_components/(section-3)/_actions/(best-seller-actions)/update-delete.ts

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
interface BestSellerResponse {
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

// Delete action - Updated to also delete the blob
export async function deleteBestSeller(
  id: string,
): Promise<BestSellerResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR") {
      return redirect("/login");
    }

    // First, get the bestSeller to access its imageUrl
    const bestSeller = await prisma.bestSeller.findUnique({
      where: { id },
    });

    if (!bestSeller) {
      throw new Error("Best seller not found");
    }

    // Delete the image from blob storage if it exists
    if (bestSeller.imageUrl) {
      try {
        // Extract the URL path from the full URL
        const urlObj = new URL(bestSeller.imageUrl);
        const blobPath = urlObj.pathname.substring(1); // Remove leading slash
        
        await del(blobPath);
      } catch (blobError) {
        console.error("Error deleting blob:", blobError);
        // Continue with record deletion even if blob deletion fails
      }
    }

    // Delete the record from the database
    const deletedBestSeller = await prisma.bestSeller.delete({
      where: { id },
    });

    return {
      success: true,
      data: deletedBestSeller,
    };
  } catch (error) {
    console.error("Error deleting best seller:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Update action - Updated to delete old blob when image is replaced
export async function updateBestSeller(
  id: string,
  formData: FormData,
): Promise<BestSellerResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR") {
      return redirect("/login");
    }

    // Get form data
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const rating = parseInt(formData.get("rating") as string);
    const file = formData.get("image") as File;

    // Validate basic inputs
    if (!name || !price || !rating) {
      throw new Error("Name, price, and rating are required");
    }
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    if (price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    // Get the current best seller for its existing imageUrl
    const currentBestSeller = await prisma.bestSeller.findUnique({
      where: { id },
    });

    if (!currentBestSeller) {
      throw new Error("Best seller not found");
    }

    let imageUrl = currentBestSeller.imageUrl;

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
      const path = `best-sellers/product_${user.id}_${timestamp}.${fileExt}`;

      const blob = await put(path, file, {
        access: "public",
        addRandomSuffix: false,
      });

      if (!blob.url) throw new Error("Failed to get URL from blob storage");
      imageUrl = blob.url;
    }

    // Update best seller in database
    const updatedBestSeller = await prisma.bestSeller.update({
      where: { id },
      data: {
        name,
        price,
        rating,
        imageUrl,
      },
    });

    return {
      success: true,
      data: updatedBestSeller,
    };
  } catch (error) {
    console.error("Error updating best seller:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
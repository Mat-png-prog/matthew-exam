//app/(public)/(group-products)/apparel/_actions/update-delete.ts

"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put, del as blobDel } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { type ApparelSlideResponse } from "../../types";

// UPDATE (with optional image replacement)
export async function updateApparelSlide(formData: FormData): Promise<ApparelSlideResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR" && user.role !== "SUPERADMIN") return redirect("/");

    const id = formData.get("id") as string;
    if (!id) throw new Error("Missing slide id");

    const currentSlide = await prisma.apparelBanner.findUnique({ where: { id } });
    if (!currentSlide) throw new Error("Slide not found");

    let sliderImageurl = currentSlide.sliderImageurl;

    // Handle optional image replacement
    const file = formData.get("sliderImage") as File | null;
    if (file && file.size) {
      // Upload new image
      const fileExt = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const path = `apparel_slides/slide_${user.id}_${timestamp}.${fileExt}`;
      const blob = await put(path, file, {
        access: "public",
        addRandomSuffix: false,
      });
      if (!blob.url) throw new Error("Failed to get URL from blob storage");
      sliderImageurl = blob.url;

      // Optionally delete old image from blob storage
      try {
        const oldPath = new URL(currentSlide.sliderImageurl).pathname.slice(1); // remove leading slash
        await blobDel(oldPath);
      } catch (e) {
        // Log and continue if deletion fails
        console.warn("Failed to delete old image from blob storage:", e);
      }
    }

    const title = (formData.get("title") as string) ?? currentSlide.title;
    const description = (formData.get("description") as string) ?? currentSlide.description;
    const bgColor = (formData.get("bgColor") as string) ?? currentSlide.bgColor;
    const order = formData.get("order") ? parseInt(formData.get("order") as string, 10) : currentSlide.order;

    const slideCount = await prisma.apparelBanner.count();
    if (order < 1 || order > slideCount) {
      return { success: false, error: `Invalid position. Only positions 1 to ${slideCount} are allowed.` };
    }

    const updatedSlide = await prisma.apparelBanner.update({
      where: { id },
      data: {
        title,
        description,
        bgColor,
        order,
        sliderImageurl,
      },
    });

    return { success: true, data: updatedSlide };
  } catch (error) {
    console.error("Error updating apparel slide:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// DELETE (with image deletion)
export async function deleteApparelSlide(id: string): Promise<ApparelSlideResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR" && user.role !== "SUPERADMIN") return redirect("/");

    // Get slide to delete image from blob storage
    const slide = await prisma.apparelBanner.findUnique({ where: { id } });
    if (!slide) throw new Error("Slide not found");

    // Delete image from blob storage
    try {
      const path = new URL(slide.sliderImageurl).pathname.slice(1); // remove leading slash
      await blobDel(path);
    } catch (e) {
      // Log and continue if deletion fails
      console.warn("Failed to delete image from blob storage:", e);
    }

    const deletedSlide = await prisma.apparelBanner.delete({
      where: { id },
    });

    // Optionally reorder remaining slides here if needed

    return { success: true, data: deletedSlide };
  } catch (error) {
    console.error("Error deleting apparel slide:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
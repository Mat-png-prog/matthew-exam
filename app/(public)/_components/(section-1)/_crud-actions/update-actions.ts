//app/(public)/_components/(section-1)/_crud-actions/update-actions.ts

"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put, del as blobDel } from "@vercel/blob";
import prisma from "@/lib/prisma";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  type SlideResponse,
} from "../types";

export async function updateSlide(formData: FormData): Promise<SlideResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR" && user.role !== "SUPERADMIN") return redirect("/");
    const id = formData.get("id") as string;
    if (!id) throw new Error("Missing slide id");

    // Always fetch latest data to avoid undefined/null
    const currentSlide = await prisma.slide.findUnique({ where: { id } });
    if (!currentSlide) throw new Error("Slide not found");

    // Use current values as fallback if any field is missing
    const title = (formData.get("title") as string) ?? currentSlide.title;
    const description = (formData.get("description") as string) ?? currentSlide.description;
    const bgColor = (formData.get("bgColor") as string) ?? currentSlide.bgColor;
    const order = formData.get("order") ? parseInt(formData.get("order") as string, 10) : currentSlide.order;
    const file = formData.get("sliderImage") as File | null;

    let sliderImageurl: string | undefined;
    let deleteOldImageUrl: string | undefined;

    // --- Image upload/replacement ---
    if (file && file.size) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) throw new Error("Invalid file type");
      if (file.size > MAX_IMAGE_SIZE) throw new Error("File size too large");
      if (currentSlide.sliderImageurl) deleteOldImageUrl = currentSlide.sliderImageurl;
      const fileExt = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const path = `slides/slide_${user.id}_${timestamp}.${fileExt}`;
      const blob = await put(path, file, { access: "public", addRandomSuffix: false });
      if (!blob.url) throw new Error("Failed to get blob URL");
      sliderImageurl = blob.url;
      console.log(`[updateSlide] New image uploaded, URL: ${sliderImageurl}`);
    }

    // Restrict order to only valid, existing positions
    const slideCount = await prisma.slide.count();
    if (order < 1 || order > slideCount) {
      console.log(`[updateSlide] Invalid order: ${order}. There are ${slideCount} slides. Denying update.`);
      return { success: false, error: `Invalid position. Only positions 1 to ${slideCount} are allowed.` };
    }

    // Only update the order for the current slide, don't swap or move others
    const updatedSlide = await prisma.slide.update({
      where: { id },
      data: {
        title,
        description,
        bgColor,
        order,
        sliderImageurl: sliderImageurl ?? currentSlide.sliderImageurl,
      },
    });
    console.log(`[updateSlide] Slide ${id} updated successfully to order ${order}.`);

    // --- Delete previous image if replaced ---
    if (deleteOldImageUrl && sliderImageurl) {
      try {
        const url = new URL(deleteOldImageUrl);
        const key = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
        await blobDel(key);
        console.log(`[updateSlide] Deleted previous image: ${key}`);
      } catch (err) {
        console.error(`[updateSlide] Failed to delete previous image:`, err);
      }
    }

    return { success: true, data: updatedSlide };
  } catch (error) {
    // NEVER send sensitive info to client
    console.error("[updateSlide] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}
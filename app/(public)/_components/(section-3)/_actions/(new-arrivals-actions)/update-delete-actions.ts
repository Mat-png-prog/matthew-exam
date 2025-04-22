// app/(public)/_components/(section-3)/_actions/(new-arrivals-actions)/update-delete-actions.ts

"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put, del as blobDel } from "@vercel/blob";
import prisma from "@/lib/prisma";

// Constants
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
];
const MAX_IMAGE_SIZE = 6 * 1024 * 1024;

async function deleteImageFromBlob(url: string) {
  if (!url) return;
  try {
    const key = new URL(url).pathname.replace(/^\/+/, "");
    await blobDel(key);
    console.log("[Blob Delete] NewArrival image deleted from:", key);
  } catch (err) {
    console.error("[Blob Delete] Failed to delete NewArrival blob:", err);
  }
}

export async function updateNewArrival(id: string, formData: FormData) {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR") return redirect("/");

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const rating = parseInt(formData.get("rating") as string);

    if (!name || !price || !rating) throw new Error("All fields are required");
    if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
    if (price <= 0) throw new Error("Price must be > 0");

    const existing = await prisma.newArrival.findUnique({ where: { id } });
    if (!existing) throw new Error("New Arrival not found");

    let imageUrl = existing.imageUrl;
    const file = formData.get("image") as File;

    if (file && file.size) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as any))
        throw new Error("Invalid file type.");
      if (file.size > MAX_IMAGE_SIZE)
        throw new Error("File size must be < 6MB");
      const fileExt = file.name.split(".").pop() || "jpg";
      const path = `new-arrivals/product_${user.id}_${Date.now()}.${fileExt}`;
      const blob = await put(path, file, { access: "public", addRandomSuffix: false });
      if (!blob.url) throw new Error("Failed to upload image.");
      await deleteImageFromBlob(existing.imageUrl); // Remove old
      imageUrl = blob.url;
    }

    const updated = await prisma.newArrival.update({
      where: { id },
      data: { name, price, rating, imageUrl },
    });

    console.log(`[Update] NewArrival ${id} updated by user ${user.id}`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("[Update NewArrival]", error);
    return { success: false, error: error instanceof Error ? error.message : "Unexpected error" };
  }
}

export async function deleteNewArrival(id: string) {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR") return redirect("/");

    const existing = await prisma.newArrival.findUnique({ where: { id } });
    if (!existing) throw new Error("New Arrival not found");

    await deleteImageFromBlob(existing.imageUrl);

    await prisma.newArrival.delete({ where: { id } });

    console.log(`[Delete] NewArrival ${id} deleted by user ${user.id}`);

    return { success: true };
  } catch (error) {
    console.error("[Delete NewArrival]", error);
    return { success: false, error: error instanceof Error ? error.message : "Unexpected error" };
  }
}
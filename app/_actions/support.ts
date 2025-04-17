"use server";

import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SupportMessageStatus } from "@/types/support";
import { z } from "zod";

const supportMessageSchema = z.object({
  title: z.string().min(3).max(100),
  message: z.string().min(10).max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export async function createSupportMessage(formData: FormData) {
  const { user } = await validateRequest();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const validatedFields = supportMessageSchema.safeParse({
    title: formData.get("title"),
    message: formData.get("message"),
    priority: formData.get("priority"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid form data" };
  }

  try {
    await prisma.supportMessage.create({
      data: {
        ...validatedFields.data,
        userId: user.id,
        status: SupportMessageStatus.NEW,
      },
    });

    revalidatePath("/customer/support");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create support message" };
  }
}

export async function updateMessageStatus(messageId: string, status: SupportMessageStatus) {
  const { user } = await validateRequest();
  
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const now = new Date();
    const updateData: any = {
      status,
      updatedAt: now,
    };

    if (status === SupportMessageStatus.PENDING && !updateData.firstResponseAt) {
      updateData.firstResponseAt = now;
    } else if (status === SupportMessageStatus.RESOLVED) {
      updateData.resolvedAt = now;
    } else if (status === SupportMessageStatus.CLOSED) {
      updateData.closedAt = now;
    }

    await prisma.supportMessage.update({
      where: { id: messageId },
      data: updateData,
    });

    revalidatePath("/admin/support-messages");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update message status" };
  }
}

export async function getSupportMessages() {
  const { user } = await validateRequest();
  
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.supportMessage.findMany({
      select: {
        id: true,
        title: true,
        message: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        firstResponseAt: true,
        resolvedAt: true,
        closedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw new Error("Failed to fetch support messages");
  }
}
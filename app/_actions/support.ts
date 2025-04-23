//app/_actions/support.ts
"use server";

import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SupportMessageStatus } from "@/types/support";
import { z } from "zod";
import crypto from "crypto";

// 90 days retention for admin viewing
const ADMIN_DATA_RETENTION_DAYS = 90;

// AES-256-GCM encryption/decryption for message body (never expose key to client!)
const ENCRYPTION_KEY = process.env.ADMIN_MSG_ENCRYPT_KEY!;
const IV_LENGTH = 12; // 96 bits, recommended for GCM

/**
 * ====================================================================
 * DEBUG BLOCK: Validate ADMIN_MSG_ENCRYPT_KEY environment variable
 * --------------------------------------------------------------------
 * This block ensures your encryption key is present, 64 hex characters
 * (32 bytes when decoded), and decodable as hex. If misconfigured,
 * you will see a clear error in your terminal/server logs and the
 * server will halt. No sensitive values are logged.
 * ====================================================================
 */
if (!ENCRYPTION_KEY) {
  console.error('[SECURITY] ADMIN_MSG_ENCRYPT_KEY is missing or not loaded');
  throw new Error('Encryption key missing!');
}
if (ENCRYPTION_KEY.length !== 64) {
  console.error('[SECURITY] ADMIN_MSG_ENCRYPT_KEY has invalid length:', ENCRYPTION_KEY.length);
  throw new Error('Encryption key must be 64 hex characters');
}
try {
  const buf = Buffer.from(ENCRYPTION_KEY, 'hex');
  if (buf.length !== 32) {
    console.error('[SECURITY] ADMIN_MSG_ENCRYPT_KEY is not 32 bytes after hex decoding:', buf.length);
    throw new Error('Encryption key must decode to 32 bytes');
  }
} catch (e) {
  console.error('[SECURITY] ADMIN_MSG_ENCRYPT_KEY failed to decode as hex:', e);
  throw e;
}

/**
 * Encrypt a message string using AES-256-GCM.
 * Throws if key is missing or invalid.
 */
function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) throw new Error("Encryption key missing!");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  const tag = cipher.getAuthTag();
  // Store as iv:tag:data (all base64, separated by :)
  const result = [iv.toString("base64"), tag.toString("base64"), encrypted].join(":");
  console.log(`[INFO][${new Date().toISOString()}] Support message encrypted (length: ${result.length})`);
  return result;
}

/**
 * Decrypt a message string using AES-256-GCM.
 * Only used server-side for admin rendering.
 */
function decrypt(encrypted: string, msgId: string): string {
  try {
    if (!ENCRYPTION_KEY) throw new Error("Encryption key missing!");
    const [ivB64, tagB64, dataB64] = encrypted.split(":");
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY, "hex"),
      iv
    );
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(dataB64, "base64", "utf8");
    decrypted += decipher.final("utf8");
    console.log(`[ADMIN][${new Date().toISOString()}] Message decrypted for admin (msgId: ${msgId}, length: ${decrypted.length})`);
    return decrypted;
  } catch (e) {
    console.error(`[ADMIN][${new Date().toISOString()}] Decryption error for msgId ${msgId}:`, e);
    return "[Decryption Error]";
  }
}

const supportMessageSchema = z.object({
  title: z.string().min(3).max(100),
  message: z.string().min(10).max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

/**
 * Create a new support message, encrypting the message content.
 * Uses Zod for validation and secure server-side handling.
 */
export async function createSupportMessage(formData: FormData) {
  const { user } = await validateRequest();
  if (!user) {
    console.warn(`[SUPPORT] Unauthorized create attempt at ${new Date().toISOString()}`);
    throw new Error("Unauthorized");
  }

  const validatedFields = supportMessageSchema.safeParse({
    title: formData.get("title"),
    message: formData.get("message"),
    priority: formData.get("priority"),
  });

  if (!validatedFields.success) {
    console.warn(`[SUPPORT] Invalid form data at ${new Date().toISOString()}:`, validatedFields.error.errors);
    return { error: "Invalid form data" };
  }

  try {
    const encryptedMessage = encrypt(validatedFields.data.message);

    await prisma.supportMessage.create({
      data: {
        ...validatedFields.data,
        message: encryptedMessage,
        userId: user.id,
        status: SupportMessageStatus.NEW,
      },
    });

    console.log(`[SUPPORT] Message created for userId ${user.id} at ${new Date().toISOString()}`);
    revalidatePath("/customer/support");
    return { success: true };
  } catch (error) {
    console.error(`[SUPPORT] Failed to create support message:`, error);
    return { error: "Failed to create support message" };
  }
}

/**
 * Admin-only: Update the status of a support message.
 * All actions logged; unauthorized access is blocked.
 */
export async function updateMessageStatus(messageId: string, status: SupportMessageStatus) {
  const { user } = await validateRequest();
  if (!user || (user.role !== "ADMIN" &&
    user.role!=="SUPERADMIN")
  ) {
    console.warn(`[SUPPORT] Unauthorized status update attempt at ${new Date().toISOString()}`);
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

    console.log(`[SUPPORT] Status updated for messageId ${messageId} by adminId ${user.id} at ${now.toISOString()} to status ${status}`);
    revalidatePath("/admin/support-messages");
    return { success: true };
  } catch (error) {
    console.error(`[SUPPORT] Failed to update message status:`, error);
    return { error: "Failed to update message status" };
  }
}

/**
 * Admin-only: Fetch all support messages for the retention period.
 * Messages are decrypted server-side, never exposed to the client.
 */
export async function getSupportMessages() {
  const { user } = await validateRequest();
  if (!user || user.role !== "ADMIN") {
    console.warn(`[SUPPORT] Unauthorized fetch attempt at ${new Date().toISOString()}`);
    throw new Error("Unauthorized");
  }

  try {
    const cutoffDate = new Date(Date.now() - ADMIN_DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const messages = await prisma.supportMessage.findMany({
      where: {
        createdAt: {
          gte: cutoffDate,
        },
      },
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

    // Decrypt message only for admin server-side rendering
    const decryptedMessages = messages.map((msg) => ({
      ...msg,
      message: decrypt(msg.message, msg.id),
    }));

    console.log(`[SUPPORT] Admin fetched ${decryptedMessages.length} messages at ${new Date().toISOString()}`);
    return decryptedMessages;
  } catch (error) {
    console.error(`[SUPPORT] Failed to fetch support messages:`, error);
    throw new Error("Failed to fetch support messages");
  }
}

/**
 * Admin-only: Force revalidation of the admin support message list.
 */
export async function refreshAdminSupportMessages() {
  const { user } = await validateRequest();
  if (!user || user.role !== "ADMIN") {
    console.warn(`[SUPPORT] Unauthorized refresh attempt at ${new Date().toISOString()}`);
    throw new Error("Unauthorized");
  }
  revalidatePath("/admin/support-messages");
  console.log(`[SUPPORT] Admin triggered support message refresh at ${new Date().toISOString()}`);
  return { success: true };
}
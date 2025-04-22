//app/(customer)/customer/settings/_actions/pass.ts

"use server";

import { revalidatePath } from "next/cache";
import { hash, verify } from "@node-rs/argon2";
import prisma from "@/lib/prisma";
import { logger } from "@/utils/Logger";
import { AUTH_CONFIG } from "@/lib/auth";
import { securitySchema, SecurityFormValues } from "../validations";
import { isRedirectError } from "next/dist/client/components/redirect";
import { Prisma } from "@prisma/client";

export async function updatePassword(
  userId: string,
  formData: SecurityFormValues
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate data similar to register action
    const validatedData = securitySchema.parse(formData);

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
        failedAttempts: true,
        lastFailedAttempt: true
      }
    });

    if (!currentUser?.passwordHash) {
      return { 
        success: false, 
        message: "User credentials not found" 
      };
    }

    // Check lockout
    if (currentUser.failedAttempts >= AUTH_CONFIG.MAX_PASSWORD_ATTEMPTS) {
      const lockoutEnd = currentUser.lastFailedAttempt && new Date(
        currentUser.lastFailedAttempt.getTime() + 
        (AUTH_CONFIG.LOCKOUT_DURATION * 60 * 1000)
      );
      
      if (lockoutEnd && lockoutEnd > new Date()) {
        const minutes = Math.ceil(
          (lockoutEnd.getTime() - Date.now()) / (1000 * 60)
        );
        return {
          success: false,
          message: `Account is locked. Try again in ${minutes} minutes`
        };
      }
    }

    // Verify current password
    const isValid = await verify(
      currentUser.passwordHash,
      validatedData.currentPassword
    );

    if (!isValid) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          failedAttempts: { increment: 1 },
          lastFailedAttempt: new Date()
        }
      });

      return { 
        success: false, 
        message: "Current password is incorrect" 
      };
    }

    // Hash new password with the same parameters used in signup
    const passwordHash = await hash(validatedData.newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Update password and reset counters
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        failedAttempts: 0,
        lastFailedAttempt: null
      }
    });

    revalidatePath("/customer/settings");
    logger.dev("Password updated successfully", { userId });
    
    return { 
      success: true, 
      message: "Password updated successfully" 
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    logger.error("Password update error:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        message: "Database error occurred. Please try again."
      };
    }

    return { 
      success: false, 
      message: "Failed to update password. Please try again later" 
    };
  }
}
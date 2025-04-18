//app/(customer)/customer/settings/_actions/settings.ts

"use server";

import { revalidatePath } from "next/cache";
import { 
  PersonalInfoFormValues,
  CheckoutDetailsFormValues,
  SecurityFormValues
} from ".././validations"; 
import prisma from "@/lib/prisma";

export async function updatePersonalInfo(
  userId: string,
  values: PersonalInfoFormValues
) {
  try {
    // Check if username is already taken
    if (values.username) {
      const existingUser = await prisma.user.findUnique({
        where: {
          username: values.username,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        return { success: false, message: "Username is already taken" };
      }
    }

    // Check if email is already taken
    if (values.email) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: values.email,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        return { success: false, message: "Email is already taken" };
      }
    }

    // Update user
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
        displayName: values.displayName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        streetAddress: values.streetAddress,
        suburb: values.suburb || null,
        townCity: values.townCity,
        postcode: values.postcode,
        country: values.country,
      },
    });

    revalidatePath("/customer/settings");
    return { success: true, message: "Personal information updated successfully" };
  } catch (error) {
    console.error("Error updating personal info:", error);
    return { success: false, message: "Failed to update personal information" };
  }
}

/* export async function updateSecurity(
  userId: string,
  values: SecurityFormValues
) {
  try {
    // Get current user with password
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    /*     // Verify current password
        const isPasswordValid = await compare(values.currentPassword, user.passwordHash);
        if (!isPasswordValid) {
          return { success: false, message: "Current password is incorrect" };
        }
    
        // Hash new password
        const hashedPassword = await hash(values.newPassword, 10); */

    // Update password
    /*     await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            passwordHash: hashedPassword,
          },
        });
    
        return { success: true, message: "Password updated successfully" };
      } catch (error) {
        console.error("Error updating security info:", error);
        return { success: false, message: "Failed to update security information" };
      }
    } 
    
    export async function updateCheckoutDetails(
      userId: string,
      values: CheckoutDetailsFormValues
    ) {
    try {
      // This is a placeholder for checkout preferences that would be stored elsewhere
      // For now, we'll just return success
      return { success: true, message: "Checkout details updated successfully" };
    } catch (error) {
      console.error("Error updating checkout details:", error);
      return { success: false, message: "Failed to update checkout details" };
    }
  }
*/
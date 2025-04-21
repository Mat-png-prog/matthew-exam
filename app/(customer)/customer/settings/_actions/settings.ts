//app/(customer)/customer/settings/_actions/settings.ts

"use server";

import { revalidatePath } from "next/cache";
import {
  OrderUpdateFormValues,
  orderUpdateSchema,
  PersonalInfoFormValues,
  SecurityFormValues
} from ".././validations";
import { prisma } from "@/lib/prisma";

/**
 * Updates the personal information of a user.
 */
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

/**
 * Update (if order exists) or create (if not) an order for settings form.
 * Only allow settings-appropriate fields. Set others to null/default.
 */
export async function updateOrCreateOrder(
  orderId: string | undefined | null,
  values: OrderUpdateFormValues,
  userId: string
) {
  const logs: string[] = [];
  try {
    logs.push(`[${new Date().toISOString()}] Starting order upsert for user ${userId}`);

    // Validate input
    const parsed = orderUpdateSchema.safeParse(values);
    if (!parsed.success) {
      logs.push(`[${new Date().toISOString()}] Validation failed: ${JSON.stringify(parsed.error.flatten())}`);
      return { success: false, message: "Validation failed", logs };
    }
    logs.push(`[${new Date().toISOString()}] Validation passed`);

    // Prepare data for settings ONLY, using safe defaults for required fields.
    // Only status, totalAmount, and orderItems are excluded from user input and set as safe defaults.
    const settingsData = {
      Branch: "",
      methodOfCollection: "",
      salesRep: parsed.data.salesRep ?? null,                // optional
      referenceNumber: parsed.data.referenceNumber ?? null,  // optional
      firstName: parsed.data.firstName ?? "",
      lastName: parsed.data.lastName ?? "",
      companyName: parsed.data.companyName ?? "",
      countryRegion: parsed.data.countryRegion ?? "",
      streetAddress: parsed.data.streetAddress ?? "",
      apartmentSuite: parsed.data.apartmentSuite ?? null,    // optional
      townCity: parsed.data.townCity ?? "",
      province: parsed.data.province ?? "",
      postcode: parsed.data.postcode ?? "",
      phone: parsed.data.phone ?? "",
      email: parsed.data.email ?? "",
      orderNotes: parsed.data.orderNotes ?? null,            // optional
      agreeTerms: false,
      receiveEmailReviews: parsed.data.receiveEmailReviews ?? false,
      // Prisma-required, but not editable in settings:
      status: undefined,         // Let Prisma use model default (PENDING)
      totalAmount: 0,            // Settings cannot set this, use 0 as safe default
      userId,
      // orderItems not set here, never touch in settings form!
    };

    let order;
    if (orderId) {
      order = await prisma.order.findUnique({ where: { id: orderId } });
    } else {
      order = null;
    }

    if (order) {
      await prisma.order.update({
        where: { id: orderId! },
        data: settingsData,
      });
      logs.push(`[${new Date().toISOString()}] Order updated successfully`);
      revalidatePath("/customer/orders");
      revalidatePath("/customer/settings");
      logs.push(`[${new Date().toISOString()}] Pages revalidated`);
      return { success: true, message: "Order updated successfully", logs };
    } else {
      // Remove undefined keys to prevent Prisma client error (status: undefined)
      const createData: typeof settingsData = { ...settingsData };
      if (createData.status === undefined) {
        delete (createData as any).status;
      }
      await prisma.order.create({
        data: createData,
      });
      logs.push(`[${new Date().toISOString()}] Order created successfully`);
      revalidatePath("/customer/orders");
      revalidatePath("/customer/settings");
      logs.push(`[${new Date().toISOString()}] Pages revalidated`);
      return { success: true, message: "Order created successfully", logs };
    }
  } catch (error) {
    logs.push(`[${new Date().toISOString()}] Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error("Order save error:", error);
    return { success: false, message: "Order save failed", logs };
  }
}

/*
// Uncomment and implement this function if required in the future.
export async function updateSecurity(
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

    // Verify current password
    // const isPasswordValid = await compare(values.currentPassword, user.passwordHash);
    // if (!isPasswordValid) {
    //   return { success: false, message: "Current password is incorrect" };
    // }

    // Hash new password
    // const hashedPassword = await hash(values.newPassword, 10);

    // Update password
    // await prisma.user.update({
    //   where: {
    //     id: userId,
    //   },
    //   data: {
    //     passwordHash: hashedPassword,
    //   },
    // });

    // return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Error updating security info:", error);
    return { success: false, message: "Failed to update security information" };
  }
}
*/

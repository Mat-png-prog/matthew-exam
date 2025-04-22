//app/(customer)/customer/settings/_actions/settings.ts

"use server";

import { revalidatePath } from "next/cache";
import { 
  OrderUpdateFormValues,
  orderUpdateSchema,
  PersonalInfoFormValues,
} from ".././validations"; 
import prisma from "@/lib/prisma";

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
 * Updates the user's checkout preferences.
 * This implementation stores checkout settings in the User table.
 * Assumes you have added the corresponding fields to your User Prisma model:
 *   - defaultShippingMethod: String?
 *   - savePaymentInfo: Boolean?
 * If these fields do not exist, you need to add them to the User model and run `prisma migrate`.
 */

/**
 * Update user's checkout default preferences.
 * Assumes corresponding fields exist on the User model (add and migrate if missing).

 * Update an existing order with validated data.
 * - orderId: string (the order to update)
 * - values: OrderUpdateFormValues (validated partial fields)
 * - userId: string (for security - only allow users to update their own orders, or check admin)
 * Returns logs for transparency.
 */
export async function updateOrder(orderId: string, values: OrderUpdateFormValues, userId: string) {
  const logs: string[] = [];
  try {
    logs.push(`[${new Date().toISOString()}] Starting order update for order ${orderId} by user ${userId}`);

    // Validate input
    const parsed = orderUpdateSchema.safeParse(values);
    if (!parsed.success) {
      logs.push(`[${new Date().toISOString()}] Validation failed: ${JSON.stringify(parsed.error.flatten())}`);
      return { success: false, message: "Validation failed", logs };
    }
    logs.push(`[${new Date().toISOString()}] Validation passed`);

    // Optionally, check user permission (update your logic as needed)
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      logs.push(`[${new Date().toISOString()}] Order not found`);
      return { success: false, message: "Order not found", logs };
    }
    if (order.userId !== userId /* && !isAdmin(userId) */) {
      logs.push(`[${new Date().toISOString()}] Access denied`);
      return { success: false, message: "You do not have permission to update this order.", logs };
    }

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: parsed.data,
    });
    logs.push(`[${new Date().toISOString()}] Order updated successfully`);

    revalidatePath("/customer/orders");
    logs.push(`[${new Date().toISOString()}] Orders page revalidated`);

    return { success: true, message: "Order updated successfully", logs };
  } catch (error) {
    logs.push(`[${new Date().toISOString()}] Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error("Order update error:", error);
    return { success: false, message: "Order update failed", logs };
  }
}
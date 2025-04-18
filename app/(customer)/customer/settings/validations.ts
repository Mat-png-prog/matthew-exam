//app/(customer)/customer/settings/validations.ts

import * as z from "zod";

// Consistent validation schema for personal information
export const personalInfoSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email cannot exceed 100 characters"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name cannot exceed 100 characters"),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name cannot exceed 100 characters"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, {
      message: "Please enter a valid phone number",
    }),
  streetAddress: z
    .string()
    .min(1, "Street address is required")
    .max(200, "Street address cannot exceed 200 characters"),
  suburb: z
    .string()
    .optional(),
  townCity: z
    .string()
    .min(1, "Town/City is required")
    .max(100, "Town/City cannot exceed 100 characters"),
  postcode: z
    .string()
    .min(1, "Postcode is required")
    .max(20, "Postcode cannot exceed 20 characters"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country cannot exceed 100 characters"),
});

export const checkoutDetailsSchema = z.object({
  defaultShippingMethod: z.string().optional(),
  savePaymentInfo: z.boolean().default(false),
});

export const securitySchema = z.object({
  currentPassword: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password cannot exceed 255 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
export type CheckoutDetailsFormValues = z.infer<typeof checkoutDetailsSchema>;
export type SecurityFormValues = z.infer<typeof securitySchema>;
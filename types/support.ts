//types/support.ts
import { z } from "zod";

export enum SupportMessagePriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}

export enum SupportMessageStatus {
  NEW = "NEW",
  PENDING = "PENDING",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED"
}

export const supportMessageSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must not exceed 5000 characters"),
  priority: z.nativeEnum(SupportMessagePriority).default(SupportMessagePriority.LOW),
});

// UPDATED here: Include updatedAt, resolvedAt, closedAt
export const supportMessageResponseSchema = supportMessageSchema.extend({
  id: z.string(),
  status: z.nativeEnum(SupportMessageStatus),
  createdAt: z.string(),
  firstResponseAt: z.string().nullable(),
  updatedAt: z.string(),
  resolvedAt: z.string().nullable(),
  closedAt: z.string().nullable(),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }),
});

export type SupportMessageSchema = z.infer<typeof supportMessageSchema>;
export type SupportMessage = z.infer<typeof supportMessageResponseSchema>;
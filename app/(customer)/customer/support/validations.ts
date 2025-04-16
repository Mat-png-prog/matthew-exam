import { z } from 'zod';

export const supportMessageSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

export type SupportMessageSchema = z.infer<typeof supportMessageSchema>;
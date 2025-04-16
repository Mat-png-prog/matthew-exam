'use server';

import { prisma } from '@/lib/prisma';
import { getUser } from '@/auth'; // Import from your root auth.ts
import { supportMessageSchema } from './validation';

// Secure server action: gets real user from session, not from the client.
export async function submitSupportMessage(formData: FormData) {
  // getUser() MUST securely fetch the current session user
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const raw = {
    title: (formData.get('title') || '').toString(),
    message: (formData.get('message') || '').toString(),
  };

  const parsed = supportMessageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  // Only store what is needed, and do NOT trust frontend for user info
  await prisma.supportMessage.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      message: parsed.data.message,
    },
  });

  return { success: true };
}
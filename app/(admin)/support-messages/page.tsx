'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { supportMessageSchema } from './validations';

export async function submitSupportMessage(formData: FormData) {
  const user = await getCurrentUser();
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

  // Only store what is needed, only select what is needed
  await prisma.supportMessage.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      message: parsed.data.message,
    },
  });

  return { success: true };
}
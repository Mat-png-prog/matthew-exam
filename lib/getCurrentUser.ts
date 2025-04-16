// Fetch the current user from the session (adjust for your auth system!)

import { prisma } from './prisma';
import { cookies } from 'next/headers';

export async function getCurrentUser() {
  // Example: assume userId is stored in a cookie named 'uid'
  const uid = cookies().get('uid')?.value;
  if (!uid) return null;
  return prisma.user.findUnique({
    where: { id: uid },
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  });
}
//app/_stores/supportMessagesStore.ts

import { create } from 'zustand';
import { SupportMessage, SupportMessagePriority, SupportMessageStatus } from '@/types/support';
import { getSupportMessages } from '@/app/_actions/support';

// Cache duration: 90 days for support messages metadata (in ms)
const CACHE_DURATION = 90 * 24 * 60 * 60 * 1000;

interface SupportMessagesState {
  messages: Omit<SupportMessage, "message">[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number;
  fetchMessages: () => Promise<void>;
  updateMessage: (messageId: string, updates: Partial<Omit<SupportMessage, "message">>) => void;
  invalidateCache: () => void;
}

// Helper to convert Prisma/DB fields to your app type
function formatMessageMetadataFromPrisma(message: any): Omit<SupportMessage, "message"> {
  return {
    id: message.id,
    title: message.title,
    priority: message.priority as SupportMessagePriority,
    status: message.status as SupportMessageStatus,
    createdAt: (message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt),
    firstResponseAt: message.firstResponseAt ? (message.firstResponseAt instanceof Date ? message.firstResponseAt.toISOString() : message.firstResponseAt) : null,
    user: {
      firstName: message.user.firstName,
      lastName: message.user.lastName,
      email: message.user.email,
    },
    updatedAt: message.updatedAt instanceof Date ? message.updatedAt.toISOString() : message.updatedAt,
    resolvedAt: message.resolvedAt ? (message.resolvedAt instanceof Date ? message.resolvedAt.toISOString() : message.resolvedAt) : null,
    closedAt: message.closedAt ? (message.closedAt instanceof Date ? message.closedAt.toISOString() : message.closedAt) : null,
  };
}

export const useSupportMessagesStore = create<SupportMessagesState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  lastFetched: 0,
  fetchMessages: async () => {
    const now = Date.now();
    const cacheAge = now - get().lastFetched;

    // Only fetch if cache is expired or empty
    if (get().messages.length > 0 && cacheAge < CACHE_DURATION) {
      console.log(`[ZUSTAND] Using 90-day cached support messages metadata at ${new Date().toISOString()}`);
      return;
    }

    set({ isLoading: true });
    try {
      const prismaMessages = await getSupportMessages();
      set({
        messages: prismaMessages.map(formatMessageMetadataFromPrisma),
        lastFetched: now,
        error: null,
      });
      console.log(`[ZUSTAND] Cached ${prismaMessages.length} support message metadata entries for 90 days at ${new Date().toISOString()}`);
    } catch (error) {
      set({ error: 'Failed to fetch messages' });
      console.error('[ZUSTAND] Error fetching messages:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  updateMessage: (messageId, updates) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId ? { ...message, ...updates } : message
      ),
    }));
    console.log(`[ZUSTAND] Updated message metadata for messageId ${messageId} at ${new Date().toISOString()}`);
  },
  invalidateCache: () => {
    set({ lastFetched: 0, messages: [] });
    console.log(`[ZUSTAND] Invalidated support messages cache at ${new Date().toISOString()}`);
  },
}));
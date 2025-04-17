import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SupportMessage, SupportMessagePriority, SupportMessageStatus } from '@/types/support';
import { getSupportMessages } from '@/app/_actions/support';
import { createSecureStorage } from '@/lib/secureStorage';

// Cache duration: 24 hours for support messages considering:
// - Data sensitivity
// - Update frequency
// - User experience
// - Server load
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface SupportMessagesState {
  messages: SupportMessage[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number;
  fetchMessages: () => Promise<void>;
  updateMessage: (messageId: string, updates: Partial<SupportMessage>) => void;
  invalidateCache: () => void;
}

interface PrismaMessage {
  id: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const formatMessageFromPrisma = (message: PrismaMessage): SupportMessage => ({
  id: message.id,
  title: message.title,
  message: message.message,
  priority: message.priority as SupportMessagePriority,
  status: message.status as SupportMessageStatus,
  createdAt: message.createdAt.toISOString(),
  firstResponseAt: message.firstResponseAt?.toISOString() || null,
  user: {
    firstName: message.user.firstName,
    lastName: message.user.lastName,
    email: message.user.email,
  },
});

export const useSupportMessagesStore = create<SupportMessagesState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      error: null,
      lastFetched: 0,
      fetchMessages: async () => {
        const now = Date.now();
        const cacheAge = now - get().lastFetched;

        // Only fetch if cache is expired or empty
        if (get().messages.length > 0 && cacheAge < CACHE_DURATION) {
          return;
        }

        set({ isLoading: true });
        try {
          const prismaMessages = await getSupportMessages();
          const formattedMessages = prismaMessages.map(formatMessageFromPrisma);
          set({ messages: formattedMessages, lastFetched: now, error: null });
        } catch (error) {
          set({ error: 'Failed to fetch messages' });
          console.error('Error fetching messages:', error);
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
      },
      invalidateCache: () => {
        set({ lastFetched: 0, messages: [] });
      },
    }),
    {
      name: 'support-messages-storage',
      storage: createJSONStorage(() => createSecureStorage()),
      partialize: (state) => ({
        messages: state.messages,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
/**
 * Chat UI State Store (Zustand)
 * Implements chat app UI state and streaming management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ===============================
// Types
// ===============================

export interface ChatStore {
  // State
  activeConversationId: string | null;
  isSidebarOpen: boolean;
  draftByConversation: Record<string, string>;
  isSending: boolean;
  currentMessage: string | null;
  abortController: AbortController | null;

  // Actions
  setActiveConversation: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  setDraft: (id: string, text: string) => void;
  getDraft: (id: string) => string;
  clearDraft: (id: string) => void;

  beginSending: () => void;
  endSending: () => void;

  setStreamMessage: (content: string) => void;
  clearStreamMessage: () => void;

  setAbortController: (controller: AbortController | null) => void;
}

// Detect mobile for default sidebar state (SSR safe)
const getDefaultSidebarOpen = () => {
  if (typeof window === 'undefined') return true;
  try {
    return window.innerWidth >= 768; // desktop/tablet default open
  } catch {
    return true;
  }
};

const initialState = () => ({
  activeConversationId: null as string | null,
  isSidebarOpen: getDefaultSidebarOpen(),
  draftByConversation: {} as Record<string, string>,
  isSending: false,
  currentMessage: null as string | null,
  abortController: null as AbortController | null,
});

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // =========================
      // State
      // =========================
      ...initialState(),

      // =========================
      // Actions
      // =========================
      setActiveConversation: (id) => set({ activeConversationId: id }),

      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

      setDraft: (id, text) =>
        set((s) => ({ draftByConversation: { ...s.draftByConversation, [id]: text } })),
      getDraft: (id) => get().draftByConversation[id] || '',
      clearDraft: (id) =>
        set((s) => {
          const { [id]: _omit, ...rest } = s.draftByConversation;
          return { draftByConversation: rest };
        }),

      beginSending: () => set({ isSending: true }),
      endSending: () => set({ isSending: false }),

      setStreamMessage: (content: string) => set({ currentMessage: content }),
      clearStreamMessage: () => set({ currentMessage: null }),

      setAbortController: (controller) => set({ abortController: controller }),
    }),
    {
      name: 'chat-store-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeConversationId: state.activeConversationId,
        isSidebarOpen: state.isSidebarOpen,
        draftByConversation: state.draftByConversation,
      }),
      version: 1,
    }
  )
);

// ===============================
// Selectors
// ===============================

export const useSidebarState = () => {
  const isOpen = useChatStore((s) => s.isSidebarOpen);
  const toggle = useChatStore((s) => s.toggleSidebar);
  const setOpen = useChatStore((s) => s.setSidebarOpen);
  return { isOpen, toggle, setOpen };
};

export const useActiveConversationId = () => useChatStore((s) => s.activeConversationId);

export const useConversationDraft = (conversationId: string) => {
  const draft = useChatStore((s) => s.getDraft(conversationId));
  const setDraft = useChatStore((s) => s.setDraft);
  const clearDraft = useChatStore((s) => s.clearDraft);
  return {
    draft,
    setDraft: (text: string) => setDraft(conversationId, text),
    clearDraft: () => clearDraft(conversationId),
  };
};

export const useSendingState = () => {
  const isSending = useChatStore((s) => s.isSending);
  const beginSending = useChatStore((s) => s.beginSending);
  const endSending = useChatStore((s) => s.endSending);
  return { isSending, beginSending, endSending };
};

export const useStreamingState = () => {
  const currentMessage = useChatStore((s) => s.currentMessage);
  const setStreamMessage = useChatStore((s) => s.setStreamMessage);
  const clearStreamMessage = useChatStore((s) => s.clearStreamMessage);
  const abortController = useChatStore((s) => s.abortController);
  const setAbortController = useChatStore((s) => s.setAbortController);
  return {
    currentMessage,
    setStreamMessage,
    clearStreamMessage,
    abortController,
    setAbortController,
  };
};

// Convenience hook aliases requested
export const useActiveConversation = () => {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  return { activeConversationId, setActiveConversation };
};

export const useSidebarToggle = () => {
  const isSidebarOpen = useChatStore((s) => s.isSidebarOpen);
  const toggleSidebar = useChatStore((s) => s.toggleSidebar);
  return { isSidebarOpen, toggleSidebar };
};

export const useDraft = (conversationId: string) => {
  const draft = useChatStore((s) => s.getDraft(conversationId));
  const setDraft = useChatStore((s) => s.setDraft);
  const clearDraft = useChatStore((s) => s.clearDraft);
  return {
    draft,
    setDraft: (text: string) => setDraft(conversationId, text),
    clearDraft: () => clearDraft(conversationId),
  };
};

// ===============================
// Cross-tab sync for persisted slice
// ===============================
// In tests/jsdom, 'storage' events can behave differently and may trigger
// feedback loops with persist. Limit cross-tab sync to real browsers only.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'chat-store-v1' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.state) {
          const { activeConversationId, isSidebarOpen, draftByConversation } = parsed.state;
          useChatStore.setState({ activeConversationId, isSidebarOpen, draftByConversation });
        }
      } catch {}
    }
  });
}

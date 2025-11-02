// Lightweight tests for useChatStore to ensure API and core actions work.
import { describe, it, expect } from 'vitest';
import { useChatStore } from '../useChatStore';

function simulate() {
  const s = useChatStore.getState();

  // Sidebar toggle
  const open0 = s.isSidebarOpen;
  s.toggleSidebar();
  const open1 = useChatStore.getState().isSidebarOpen;
  expect(open1).toBe(!open0);

  // Drafts
  useChatStore.getState().setDraft('conv-1', 'hello');
  const draft = useChatStore.getState().getDraft('conv-1');
  expect(draft).toBe('hello');
  useChatStore.getState().clearDraft('conv-1');
  const draftCleared = useChatStore.getState().getDraft('conv-1');
  expect(draftCleared).toBe('');

  // Sending
  useChatStore.getState().beginSending();
  expect(useChatStore.getState().isSending).toBe(true);
  useChatStore.getState().endSending();
  expect(useChatStore.getState().isSending).toBe(false);

  // Streaming
  useChatStore.getState().setStreamMessage('partial');
  expect(useChatStore.getState().currentMessage).toBe('partial');
  useChatStore.getState().clearStreamMessage();
  expect(useChatStore.getState().currentMessage).toBeNull();
}

describe('useChatStore', () => {
  it('supports core actions and selectors', () => {
    simulate();
  });
});

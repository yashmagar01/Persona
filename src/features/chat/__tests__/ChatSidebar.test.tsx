import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, within, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders, resetChatStore } from '@/test/test-utils';
import ChatSidebar from '@/features/chat/components/Sidebar/ChatSidebar';
import { useChatStore } from '@/features/chat/hooks/useChatStore';

describe('ChatSidebar', () => {
  beforeEach(() => {
    resetChatStore();
  });

  it('syncs active conversation id from route param', async () => {
    renderWithProviders(
      (
        <>
          {/* Define a matching route so useParams receives the param */}
          <Routes>
            <Route path="/chat/:conversationId" element={<ChatSidebar />} />
          </Routes>
        </>
      ) as any,
      { route: '/chat/guest-1730544000002' }
    );
    // Effect should sync to store
    await waitFor(() => {
      expect(useChatStore.getState().activeConversationId).toBe('guest-1730544000002');
    });
  });

  it('creates a new chat and sets active conversation', async () => {
    renderWithProviders(<ChatSidebar />, { route: '/' });
    const newBtn = screen.getByRole('button', { name: /new chat/i });
    fireEvent.click(newBtn);
    await waitFor(() => {
      const activeId = useChatStore.getState().activeConversationId;
      expect(activeId).toBeTruthy();
      expect(activeId?.startsWith('guest-')).toBe(true);
    });
  });

  it('deletes a conversation from the list', async () => {
    renderWithProviders(<ChatSidebar />, { route: '/chat/guest-1730544000001' });
    // There are 3 mock items
    expect(screen.getAllByRole('button', { name: /open conversation:/i }).length).toBe(3);

    // Delete the first conversation item
    const listItem = screen.getAllByRole('listitem')[0];
    const delBtn = within(listItem).getByRole('button', { name: /delete conversation/i });
    fireEvent.click(delBtn);

    expect(screen.getAllByRole('button', { name: /open conversation:/i }).length).toBe(2);
  });
});

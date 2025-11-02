import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, resetChatStore } from '@/test/test-utils';
import { ChatContainer } from '@/features/chat/components/ChatContainer/ChatContainer';

// Force online in this suite
vi.mock('@/hooks/use-network-status', () => ({
  useNetworkStatus: () => ({ isOnline: true, wasOffline: false }),
}));

// Mock ChatHeader to avoid Radix dropdown menu side-effects during tests
vi.mock('@/features/chat/components/ChatContainer/ChatHeader', () => ({
  ChatHeader: ({ title }: { title?: string }) => <header aria-label="Chat header">{title || 'Header'}</header>,
  default: ({ title }: { title?: string }) => <header aria-label="Chat header">{title || 'Header'}</header>,
}));

// Mock ChatSidebar to avoid Radix avatar and swipe logic
vi.mock('@/features/chat/components/Sidebar/ChatSidebar', () => ({
  default: () => <aside aria-label="Mock Sidebar" />,
}));

describe('ChatContainer', () => {
  beforeEach(() => {
    resetChatStore();
    localStorage.clear();
  });

  it('sends an example message and renders it in the list (guest conversation flow)', async () => {
    renderWithProviders(<ChatContainer />, { route: '/' , withRoutes: true});

    // Empty state shows examples
    const example = await screen.findByRole('button', { name: /what are the best study techniques/i });
    fireEvent.click(example);

    // After clicking example, a guest conversation is created and route updates; the message should appear
    await waitFor(() => {
      expect(screen.getByText(/what are the best study techniques/i)).toBeInTheDocument();
    });
  });
});

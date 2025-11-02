import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import { resetChatStore } from '@/test/test-utils';

// Force online by mocking the hook
vi.mock('@/hooks/use-network-status', () => ({
  useNetworkStatus: () => ({ isOnline: true, wasOffline: false }),
}));

describe('ChatInput', () => {
  beforeEach(() => {
    resetChatStore();
  });

  it('allows typing and sends on click, then clears draft', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    const ChatInput = (await import('@/features/chat/components/ChatInput/ChatInput')).default;
    render(<ChatInput conversationId="conv-1" onSend={onSend} />);

    const textarea = screen.getByPlaceholderText('Message College Sahayak…');
    // Focus + type
    textarea.focus();
    fireEvent.change(textarea, { target: { value: 'Hello world' } });

    const sendBtn = screen.getByRole('button', { name: /send message/i });
    expect(sendBtn).toBeEnabled();

    // Click send
    fireEvent.click(sendBtn);
    expect(onSend).toHaveBeenCalledWith('Hello world');

    // Draft cleared (wait for state to flush)
    await waitFor(() => expect((textarea as HTMLTextAreaElement).value).toBe(''));
  });

  it('Enter sends, Shift+Enter adds newline', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    const ChatInput = (await import('@/features/chat/components/ChatInput/ChatInput')).default;
    render(<ChatInput conversationId="conv-2" onSend={onSend} />);

    const textarea = screen.getByPlaceholderText('Message College Sahayak…');
    textarea.focus();
    fireEvent.change(textarea, { target: { value: 'Hi' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('Hi');

    fireEvent.change(textarea, { target: { value: 'Line1' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    // Should not send again
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('disables send while offline', async () => {
    // Remock hook for this test
    vi.resetModules();
    vi.doMock('@/hooks/use-network-status', () => ({
      useNetworkStatus: () => ({ isOnline: false, wasOffline: false }),
    }));
    const onSend = vi.fn();
    const ChatInput = (await import('@/features/chat/components/ChatInput/ChatInput')).default;
    render(<ChatInput conversationId="conv-3" onSend={onSend} />);

    const textarea = screen.getByPlaceholderText('Message College Sahayak…');
    textarea.focus();
    fireEvent.change(textarea, { target: { value: 'Msg' } });
    // The button should be disabled when offline
    const sendBtn = screen.getByRole('button', { name: /cannot send while offline/i });
    expect(sendBtn).toBeDisabled();
  });
});

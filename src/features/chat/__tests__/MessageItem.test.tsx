import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { MessageItem } from '@/features/chat/components/MessageList/MessageItem';

describe('MessageItem', () => {
  it('renders a user message and copies content', async () => {
    const message = {
      id: 'm1',
      role: 'user' as const,
      content: 'User text',
      createdAt: new Date(),
    };

    renderWithProviders(
      <MessageItem message={message} />
    );

    expect(screen.getByRole('article', { name: /user message/i })).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /copy message/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('User text');
  });

  it('renders assistant markdown content', async () => {
    const message = {
      id: 'm2',
      role: 'assistant' as const,
      content: '# Title\nSome `code` snippet',
      createdAt: new Date(),
    };

    renderWithProviders(
      <MessageItem message={message} assistantName="Bot" />
    );

    // Heading text should render and inline code should be present
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('code')).toBeInTheDocument();
  });

  it('shows error actions when message has error status', async () => {
    const onRetry = vi.fn();
    const onDelete = vi.fn();
    const message = {
      id: 'm3',
      role: 'user' as const,
      content: 'failed',
      status: 'error' as const,
    };

    renderWithProviders(
      <MessageItem message={message} onRetry={onRetry} onDelete={onDelete} />
    );

    const retryBtn = screen.getByRole('button', { name: /retry message/i });
    const deleteBtn = screen.getByRole('button', { name: /delete message/i });
    fireEvent.click(retryBtn);
    fireEvent.click(deleteBtn);
    expect(onRetry).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });
});

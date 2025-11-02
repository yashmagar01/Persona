import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
// Mock Streamdown to avoid CSS/Katex imports in tests
vi.mock('streamdown', () => {
  return {
    Streamdown: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  };
});

// Mock Supabase client to avoid network during route render
vi.mock('@/integrations/supabase/client', () => {
  const noOp = () => {};
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn(noOp) } } }),
        signOut: vi.fn().mockResolvedValue({ error: null })
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }))
    }
  } as any;
});

describe('AppShell routing with sidebar', () => {
  it('renders the sidebar on /chatboard', async () => {
    // Ensure matchMedia exists for libs that expect it
    if (typeof window.matchMedia !== 'function') {
      // @ts-ignore
      window.matchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });
    }
  window.history.pushState({}, '', '/chatboard');
  const { default: App } = await import('@/App');
  render(<App />);

    // Sidebar brand from AppShell
  await waitFor(() => expect(screen.getByText(/^Persona$/)).toBeInTheDocument());

    // Sidebar navigation group label
    expect(screen.getByText(/navigation/i)).toBeInTheDocument();
  });
});

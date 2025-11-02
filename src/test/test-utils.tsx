import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type RenderOptions = {
  route?: string;
  queryClient?: QueryClient;
  withRoutes?: boolean;
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/', queryClient = createTestQueryClient(), withRoutes = false }: RenderOptions = {}
) {
  window.history.pushState({}, 'Test page', route);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        {withRoutes ? (
          <Routes>
            <Route path="/*" element={children as any} />
          </Routes>
        ) : (
          children
        )}
      </MemoryRouter>
    </QueryClientProvider>
  );

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper }),
  };
}

// Zustand store reset helper (keeps tests isolated)
export function resetChatStore() {
  try {
    // Lazy import to avoid test-time circular deps if not needed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useChatStore } = require('@/features/chat/hooks/useChatStore');
    useChatStore.setState({
      activeConversationId: null,
      isSidebarOpen: true,
      draftByConversation: {},
      isSending: false,
      currentMessage: null,
      abortController: null,
    });
  } catch {}
}

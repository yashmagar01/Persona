import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Chatboard from "./pages/Chatboard";
import Chat from "./pages/Chat";
import Conversations from "./pages/Conversations";
import SeedPersonalities from "./pages/SeedPersonalities";
import NotFound from "./pages/NotFound";
import AppShell from "@/components/AppShell";
import { applyTheme } from "./styles/theme";

const queryClient = new QueryClient();

const App = () => {
  // Initialize ChatGPT-inspired theme on mount
  useEffect(() => {
    applyTheme('dark');
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <OfflineBanner />
          <BrowserRouter>
            <Routes>
              {/* Public routes without the sidebar */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />

              {/* Routes that share the app shell with sidebar */
              }
              <Route element={<AppShell />}>
                <Route path="/chatboard" element={<Chatboard />} />
                <Route path="/chat/:conversationId" element={<Chat />} />
                <Route path="/conversations" element={<Conversations />} />
                <Route path="/seed" element={<SeedPersonalities />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

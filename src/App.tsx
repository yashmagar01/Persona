import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Header } from "@/components/Header";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Chatboard from "./pages/Chatboard";
import Chat from "./pages/Chat";
import Conversations from "./pages/Conversations";
import SeedPersonalities from "./pages/SeedPersonalities";
import ToastDemo from "./pages/ToastDemo";
import ToastTest from "./pages/ToastTest";
import NotFound from "./pages/NotFound";
import AppShell from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
          <HotToaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#1f2937',
                color: '#fff',
                borderRadius: '0.5rem',
                border: '1px solid rgba(249, 115, 22, 0.2)',
                padding: '16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
              },
              success: {
                iconTheme: {
                  primary: '#f97316',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <OfflineBanner />
          <BrowserRouter>
            {/* Header persists across all routes */}
            <Header />
            <Routes>
              {/* Public routes without the sidebar */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/toast-demo" element={<ToastDemo />} />
              <Route path="/toast-test" element={<ToastTest />} />

              {/* Routes that share the app shell with sidebar */}
              <Route element={<AppShell />}>
                <Route path="/chatboard" element={<Chatboard />} />
                <Route path="/chat/:conversationId" element={<Chat />} />
                <Route 
                  path="/conversations" 
                  element={
                    <ProtectedRoute>
                      <Conversations />
                    </ProtectedRoute>
                  } 
                />
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

import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { SimpleThemeProvider } from "@/contexts/SimpleThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { Navigation } from "@/components/layout/Navigation";
import { SimpleToaster } from "@/components/ui/simple-toaster";

// Import pages
import Index from "@/pages/Index";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SimpleThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-slate-900 text-white">
              <Navigation />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={
                  <div className="flex items-center justify-center min-h-screen">
                    <h1 className="text-4xl font-bold">Page Not Found</h1>
                  </div>
                } />
              </Routes>
              <SimpleToaster />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </SimpleThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
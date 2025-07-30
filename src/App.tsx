import * as React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { SimpleThemeProvider } from "@/contexts/SimpleThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { Navigation } from "@/components/layout/Navigation";

// Import pages
import Index from "@/pages/Index";

function App() {
  return (
    <ErrorBoundary>
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
            </div>
          </BrowserRouter>
        </AuthProvider>
      </SimpleThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
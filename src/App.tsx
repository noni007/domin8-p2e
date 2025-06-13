
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LazyComponentWrapper } from "@/components/common/LazyComponentWrapper";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/ui/command-palette";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { useAuth } from "@/hooks/useAuth";
import { lazy, useEffect, useState } from "react";
import "./App.css";

// Lazy load pages for better performance
const Index = lazy(() => import("@/pages/Index"));
const Tournaments = lazy(() => import("@/pages/Tournaments"));
const Teams = lazy(() => import("@/pages/Teams"));
const Leaderboards = lazy(() => import("@/pages/Leaderboards"));
const Rankings = lazy(() => import("@/pages/Rankings"));
const Friends = lazy(() => import("@/pages/Friends"));
const Profile = lazy(() => import("@/pages/Profile"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Activity = lazy(() => import("@/pages/Activity"));
const Auth = lazy(() => import("@/pages/Auth"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes - increased for better caching
      gcTime: 10 * 60 * 1000, // 10 minutes - keep data longer
      refetchOnWindowFocus: false, // Reduce unnecessary requests
      refetchOnMount: false, // Don't refetch on mount if data is fresh
    },
    mutations: {
      retry: false,
    },
  },
});

function AppContent() {
  const { user } = useAuth();
  const commandPalette = useCommandPalette();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user should see onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (user && !hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 w-full">
      <ErrorBoundary>
        <Navigation />
      </ErrorBoundary>
      <main>
        <Routes>
          <Route path="/" element={
            <LazyComponentWrapper>
              <Index />
            </LazyComponentWrapper>
          } />
          <Route path="/tournaments" element={
            <LazyComponentWrapper>
              <Tournaments />
            </LazyComponentWrapper>
          } />
          <Route path="/teams" element={
            <LazyComponentWrapper>
              <Teams />
            </LazyComponentWrapper>
          } />
          <Route path="/leaderboards" element={
            <LazyComponentWrapper>
              <Leaderboards />
            </LazyComponentWrapper>
          } />
          <Route path="/rankings" element={
            <LazyComponentWrapper>
              <Rankings />
            </LazyComponentWrapper>
          } />
          <Route path="/friends" element={
            <LazyComponentWrapper>
              <Friends />
            </LazyComponentWrapper>
          } />
          <Route path="/profile" element={
            <LazyComponentWrapper>
              <Profile />
            </LazyComponentWrapper>
          } />
          <Route path="/user/:userId" element={
            <LazyComponentWrapper>
              <UserProfile />
            </LazyComponentWrapper>
          } />
          <Route path="/activity" element={
            <LazyComponentWrapper>
              <Activity />
            </LazyComponentWrapper>
          } />
          <Route path="/auth" element={
            <LazyComponentWrapper>
              <Auth />
            </LazyComponentWrapper>
          } />
          <Route path="*" element={
            <LazyComponentWrapper>
              <NotFound />
            </LazyComponentWrapper>
          } />
        </Routes>
      </main>
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
      <Toaster />
      <CommandPalette 
        open={commandPalette.isOpen} 
        onOpenChange={commandPalette.setIsOpen} 
      />
      {showOnboarding && <OnboardingFlow />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="domin8-theme">
          <AuthProvider>
            <Router>
              <AppContent />
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

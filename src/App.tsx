
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import Index from "@/pages/Index";
import Tournaments from "@/pages/Tournaments";
import Leaderboards from "@/pages/Leaderboards";
import Rankings from "@/pages/Rankings";
import Friends from "@/pages/Friends";
import Profile from "@/pages/Profile";
import UserProfile from "@/pages/UserProfile";
import Activity from "@/pages/Activity";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import "./App.css";

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
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
              <ErrorBoundary>
                <Navigation />
              </ErrorBoundary>
              <main>
                <Routes>
                  <Route path="/" element={
                    <ErrorBoundary>
                      <Index />
                    </ErrorBoundary>
                  } />
                  <Route path="/tournaments" element={
                    <ErrorBoundary>
                      <Tournaments />
                    </ErrorBoundary>
                  } />
                  <Route path="/leaderboards" element={
                    <ErrorBoundary>
                      <Leaderboards />
                    </ErrorBoundary>
                  } />
                  <Route path="/rankings" element={
                    <ErrorBoundary>
                      <Rankings />
                    </ErrorBoundary>
                  } />
                  <Route path="/friends" element={
                    <ErrorBoundary>
                      <Friends />
                    </ErrorBoundary>
                  } />
                  <Route path="/profile" element={
                    <ErrorBoundary>
                      <Profile />
                    </ErrorBoundary>
                  } />
                  <Route path="/user/:userId" element={
                    <ErrorBoundary>
                      <UserProfile />
                    </ErrorBoundary>
                  } />
                  <Route path="/activity" element={
                    <ErrorBoundary>
                      <Activity />
                    </ErrorBoundary>
                  } />
                  <Route path="/auth" element={
                    <ErrorBoundary>
                      <Auth />
                    </ErrorBoundary>
                  } />
                  <Route path="*" element={
                    <ErrorBoundary>
                      <NotFound />
                    </ErrorBoundary>
                  } />
                </Routes>
              </main>
              <ErrorBoundary>
                <Footer />
              </ErrorBoundary>
            </div>
            <Toaster />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

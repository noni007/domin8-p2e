import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

// Import pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Tournaments from "@/pages/Tournaments";
import Teams from "@/pages/Teams";
import Activity from "@/pages/Activity";
import Wallet from "@/pages/Wallet";
import Rankings from "@/pages/Rankings";
import Leaderboards from "@/pages/Leaderboards";
import Friends from "@/pages/Friends";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background text-foreground">
                <Navigation />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/tournaments" element={<Tournaments />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/rankings" element={<Rankings />} />
                  <Route path="/leaderboards" element={<Leaderboards />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
              </div>
              <Toaster />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { SimpleThemeProvider } from "@/contexts/SimpleThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { Navigation } from "@/components/layout/Navigation";
import { SimpleToaster } from "@/components/ui/simple-toaster";

// Import pages
import { Index } from "@/pages/Index";
import Tournaments from "@/pages/Tournaments";
import Leaderboards from "@/pages/Leaderboards";
import Rankings from "@/pages/Rankings";
import Teams from "@/pages/Teams";
import Friends from "@/pages/Friends";
import Wallet from "@/pages/Wallet";
import Activity from "@/pages/Activity";
import Profile from "@/pages/Profile";
import UserProfile from "@/pages/UserProfile";
import Admin from "@/pages/Admin";
import Web3Admin from "@/pages/Web3Admin";
import Auth from "@/pages/Auth";
import Testing from "@/pages/Testing";
import TournamentDetails from "@/pages/TournamentDetails";
import MatchSpectatingDemo from "@/pages/MatchSpectatingDemo";
import MobileDevelopmentGuide from "@/pages/MobileDevelopmentGuide";
import ResetPassword from "@/pages/ResetPassword";

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
  console.log('[App] Starting app initialization...');
  
  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('[App] Error caught by boundary:', error, errorInfo);
    }}>
      <QueryClientProvider client={queryClient}>
        <SimpleThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-slate-900 text-white">
              <Navigation />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tournaments" element={<Tournaments />} />
                <Route path="/tournaments/:id" element={<TournamentDetails />} />
                <Route path="/leaderboards" element={<Leaderboards />} />
                <Route path="/rankings" element={<Rankings />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<UserProfile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/web3-admin" element={<Web3Admin />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/testing" element={<Testing />} />
                <Route path="/match-spectating" element={<MatchSpectatingDemo />} />
                <Route path="/mobile-guide" element={<MobileDevelopmentGuide />} />
                <Route path="/reset-password" element={<ResetPassword />} />
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
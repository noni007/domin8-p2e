
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/layout/Navigation";
import { Footer } from "./components/layout/Footer";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Web3Provider } from "@/contexts/Web3Provider";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Tournaments from "./pages/Tournaments";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Leaderboards from "./pages/Leaderboards";
import Rankings from "./pages/Rankings";
import Teams from "./pages/Teams";
import Wallet from "./pages/Wallet";
import Activity from "./pages/Activity";
import Friends from "./pages/Friends";
import Admin from "./pages/Admin";
import Web3Admin from "./pages/Web3Admin";
import NotFound from "./pages/NotFound";
import MobileDevelopmentGuide from "./pages/MobileDevelopmentGuide";
import MatchSpectatingDemo from "./pages/MatchSpectatingDemo";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Web3Provider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen flex flex-col bg-background">
                  <Navigation />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={
                        <ProtectedRoute requireAuth={false}>
                          <Auth />
                        </ProtectedRoute>
                      } />
                      <Route path="/reset-password" element={
                        <ProtectedRoute requireAuth={false}>
                          <ResetPassword />
                        </ProtectedRoute>
                      } />
                      <Route path="/tournaments" element={<Tournaments />} />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile/:userId" element={<UserProfile />} />
                      <Route path="/leaderboards" element={<Leaderboards />} />
                      <Route path="/rankings" element={<Rankings />} />
                      <Route path="/teams" element={<Teams />} />
                      <Route path="/wallet" element={
                        <ProtectedRoute>
                          <Wallet />
                        </ProtectedRoute>
                      } />
                      <Route path="/activity" element={
                        <ProtectedRoute>
                          <Activity />
                        </ProtectedRoute>
                      } />
                      <Route path="/friends" element={
                        <ProtectedRoute>
                          <Friends />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin" element={
                        <ProtectedRoute>
                          <Admin />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/web3" element={
                        <ProtectedRoute>
                          <Web3Admin />
                        </ProtectedRoute>
                      } />
                      <Route path="/mobile-dev" element={<MobileDevelopmentGuide />} />
                      <Route path="/match-spectating" element={<MatchSpectatingDemo />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </Web3Provider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

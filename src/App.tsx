import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Web3Provider } from "@/contexts/Web3Provider";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { SimpleToaster } from "@/components/ui/simple-toaster";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import { MobileOptimizations } from "@/components/mobile/MobileOptimizations";
import { useIsMobile } from "@/hooks/use-mobile";

// Import pages
import Index from "@/pages/Index";
import Tournaments from "@/pages/Tournaments";
import TournamentDetails from "@/pages/TournamentDetails";
import Profile from "@/pages/Profile";
import Wallet from "@/pages/Wallet";
import Teams from "@/pages/Teams";
import Rankings from "@/pages/Rankings";
import Activity from "@/pages/Activity";
import Admin from "@/pages/Admin";
import Web3Admin from "@/pages/Web3Admin";
import Friends from "@/pages/Friends";
import UserProfile from "@/pages/UserProfile";
import MobileDevelopmentGuide from "@/pages/MobileDevelopmentGuide";
import Testing from "@/pages/Testing";
import NotFound from "@/pages/NotFound";

function App() {
  const isMobile = useIsMobile();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Web3Provider>
          <AuthProvider>
            <MobileOptimizations>
              <MobileAppShell>
                <BrowserRouter>
                  <div className="min-h-screen flex flex-col">
                    <OfflineIndicator />
                    {!isMobile && <Navigation />}
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/tournaments" element={<Tournaments />} />
                        <Route path="/tournaments/:id" element={<TournamentDetails />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/wallet" element={<Wallet />} />
                        <Route path="/teams" element={<Teams />} />
                        <Route path="/rankings" element={<Rankings />} />
                        <Route path="/activity" element={<Activity />} />
                        <Route path="/friends" element={<Friends />} />
                        <Route path="/user/:id" element={<UserProfile />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/web3-admin" element={<Web3Admin />} />
                        <Route path="/mobile-guide" element={<MobileDevelopmentGuide />} />
                        <Route path="/testing" element={<Testing />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    {!isMobile && <Footer />}
                    {isMobile && <MobileNavigation />}
                    <SimpleToaster />
                  </div>
                </BrowserRouter>
              </MobileAppShell>
            </MobileOptimizations>
          </AuthProvider>
        </Web3Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

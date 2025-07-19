import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Web3Provider } from "@/contexts/Web3Provider";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { SimpleToaster } from "@/components/ui/simple-toaster";

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
// import Testing from "@/pages/Testing";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Web3Provider>
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <Navigation />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/tournaments" element={<Tournaments />} />
                  <Route path="/tournaments/:id" element={<TournamentDetails />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/rankings" element={<Rankings />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/admin" element={<Admin />} />
                  {/* <Route path="/testing" element={<Testing />} /> */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
                <SimpleToaster />
              </div>
            </BrowserRouter>
          </AuthProvider>
        </Web3Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

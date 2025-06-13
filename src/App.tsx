
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tournaments" element={<Tournaments />} />
                <Route path="/leaderboards" element={<Leaderboards />} />
                <Route path="/rankings" element={<Rankings />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

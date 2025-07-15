import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigation } from '@/components/layout/Navigation'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { SwipeableLayout } from '@/components/layout/SwipeableLayout'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/hooks/useTheme'
import { MobileOptimizations } from '@/components/mobile/MobileOptimizations'
import { DeviceCompatibilityTester } from '@/components/testing/DeviceCompatibilityTester'

// Pages
import Index from '@/pages/Index'
import Tournaments from '@/pages/Tournaments'
import Rankings from '@/pages/Rankings'
import Teams from '@/pages/Teams'
import Profile from '@/pages/Profile'
import UserProfile from '@/pages/UserProfile'
import Activity from '@/pages/Activity'
import Auth from '@/pages/Auth'
import Friends from '@/pages/Friends'
import Leaderboards from '@/pages/Leaderboards'
import Admin from '@/pages/Admin'
import Wallet from '@/pages/Wallet'
import NotFound from '@/pages/NotFound'
import ResetPassword from '@/pages/ResetPassword'
import MobileDevelopmentGuide from '@/pages/MobileDevelopmentGuide'
import MatchSpectatingDemo from '@/pages/MatchSpectatingDemo'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <MobileOptimizations>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
                <Navigation />
                <SwipeableLayout>
                  <main>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/tournaments" element={<Tournaments />} />
                      <Route path="/rankings" element={<Rankings />} />
                      <Route path="/teams" element={<Teams />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/:userId" element={<UserProfile />} />
                      <Route path="/activity" element={<Activity />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/friends" element={<Friends />} />
                      <Route path="/leaderboards" element={<Leaderboards />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/wallet" element={<Wallet />} />
                      <Route path="/mobile-guide" element={<MobileDevelopmentGuide />} />
                      <Route path="/match-spectating" element={<MatchSpectatingDemo />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </SwipeableLayout>
                <BottomNavigation />
                <Footer />
                <DeviceCompatibilityTester />
              </div>
              <Toaster />
            </Router>
          </MobileOptimizations>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

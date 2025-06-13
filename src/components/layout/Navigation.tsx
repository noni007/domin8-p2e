
import { useState, memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserMenu } from "@/components/layout/UserMenu";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { Search } from "lucide-react";

const Navigation = memo(() => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const commandPalette = useCommandPalette();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [signOut]);

  const handleAuthModalOpen = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const handleAuthModalClose = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  return (
    <>
      <nav className="bg-transparent backdrop-blur-sm sticky top-0 z-50" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md p-1" 
                aria-label="Domin8 - Go to homepage"
              >
                <img 
                  src="/lovable-uploads/7754c2e2-2bb1-4a54-92b5-a2a7fc48a8cf.png" 
                  alt="Domin8 Logo" 
                  className="h-8 w-auto"
                  loading="eager"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8" role="menubar">
              <Link 
                to="/tournaments" 
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                role="menuitem"
                aria-label="View tournaments"
              >
                Tournaments
              </Link>
              <Link 
                to="/teams" 
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                role="menuitem"
                aria-label="View teams"
              >
                Teams
              </Link>
              <Link 
                to="/leaderboards" 
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                role="menuitem"
                aria-label="View leaderboards"
              >
                Leaderboards
              </Link>
              <Link 
                to="/rankings" 
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                role="menuitem"
                aria-label="View rankings"
              >
                Rankings
              </Link>
              {user && (
                <Link 
                  to="/friends" 
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                  role="menuitem"
                  aria-label="View friends"
                >
                  Friends
                </Link>
              )}
            </div>

            {/* Desktop Controls */}
            <div className="flex items-center space-x-2">
              {/* Command Palette Trigger */}
              <Button
                variant="ghost"
                size="icon"
                onClick={commandPalette.open}
                className="hidden md:flex h-9 w-9 text-gray-400 hover:text-white"
                aria-label="Open command palette (Ctrl+K)"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Desktop Auth */}
              <div className="hidden md:block">
                {user ? (
                  <UserMenu user={user} onSignOut={handleSignOut} />
                ) : (
                  <Button 
                    onClick={handleAuthModalOpen}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Sign in or create account"
                  >
                    Login / Sign Up
                  </Button>
                )}
              </div>

              {/* Mobile Menu */}
              <MobileMenu 
                user={user}
                onAuthClick={handleAuthModalOpen}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} />
    </>
  );
});

Navigation.displayName = "Navigation";

export default Navigation;

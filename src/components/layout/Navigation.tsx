
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserMenu } from "@/components/layout/UserMenu";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <nav className="bg-transparent backdrop-blur-sm sticky top-0 z-50" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center" aria-label="Home">
                <img 
                  src="/lovable-uploads/7754c2e2-2bb1-4a54-92b5-a2a7fc48a8cf.png" 
                  alt="Domin8 Logo" 
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/tournaments" 
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              >
                Tournaments
              </Link>
              <Link 
                to="/leaderboards" 
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              >
                Leaderboards
              </Link>
              <Link 
                to="/rankings" 
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              >
                Rankings
              </Link>
              {user && (
                <Link 
                  to="/friends" 
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                >
                  Friends
                </Link>
              )}
            </div>

            {/* Desktop Auth / Mobile Menu */}
            <div className="flex items-center">
              {/* Desktop Auth */}
              <div className="hidden md:block">
                {user ? (
                  <UserMenu user={user} onSignOut={handleSignOut} />
                ) : (
                  <Button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Login / Sign Up
                  </Button>
                )}
              </div>

              {/* Mobile Menu */}
              <MobileMenu 
                user={user}
                onAuthClick={() => setShowAuthModal(true)}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Navigation;

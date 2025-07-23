import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Users, 
  Wallet, 
  BarChart3, 
  User, 
  Activity,
  UserPlus,
  Menu,
  X,
  Shield
} from "lucide-react";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";
import { LiveNotificationFeed } from "@/components/notifications/LiveNotificationFeed";
import { WalletConnectButton } from "@/components/web3/WalletConnectButton";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { isFeatureEnabled } = useFeatureFlags();
  
  const isWeb3Enabled = isFeatureEnabled('feature_web3_wallets');

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/be31ac20-7045-4c65-bf6f-1dda987cd378.png" 
              alt="Domin8 Logo" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link 
              to="/tournaments" 
              className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
            >
              <Trophy className="h-4 w-4" />
              <span>Tournaments</span>
            </Link>
            <Link 
              to="/leaderboards" 
              className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Leaderboards</span>
            </Link>
            <Link 
              to="/rankings" 
              className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Rankings</span>
            </Link>
            <Link 
              to="/teams" 
              className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
            >
              <Users className="h-4 w-4" />
              <span>Teams</span>
            </Link>
            <Link 
              to="/friends" 
              className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
            >
              <UserPlus className="h-4 w-4" />
              <span>Community</span>
            </Link>
            {user && (
              <>
                <Link 
                  to="/wallet" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Wallet</span>
                </Link>
                <Link 
                  to="/activity" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
                >
                  <Activity className="h-4 w-4" />
                  <span>Activity</span>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
            <Link 
              to="/mobile-guide" 
              className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
            >
              <span>📱 Mobile Guide</span>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <LiveNotificationFeed />
                {isWeb3Enabled && <WalletConnectButton />}
                <UserMenu />
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <MobileMenu 
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            onAuthClick={() => {
              setIsMobileMenuOpen(false);
              setIsAuthModalOpen(true);
            }}
          />
        )}
      </div>
    </nav>
  );
};
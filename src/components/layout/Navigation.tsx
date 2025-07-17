
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
import { NotificationBell } from "@/components/notifications/NotificationBell";
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
    <nav className="bg-black/90 backdrop-blur-md border-b border-blue-800/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold text-white">Gamed</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/tournaments" 
              className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
            >
              <Trophy className="h-4 w-4" />
              <span>Tournaments</span>
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
                <Link 
                  to="/friends" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Friends</span>
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
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell />
                {isWeb3Enabled && <WalletConnectButton />}
                <UserMenu />
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
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

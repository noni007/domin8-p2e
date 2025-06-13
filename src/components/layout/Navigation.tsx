
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="border-b border-blue-800/30 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/be31ac20-7045-4c65-bf6f-1dda987cd378.png" 
              alt="Logo" 
              className="h-10 w-auto cursor-pointer"
              onClick={() => window.location.href = '/'}
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white"
              onClick={() => window.location.href = '/tournaments'}
            >
              Tournaments
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white"
              onClick={() => window.location.href = '/leaderboards'}
            >
              Leaderboards
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white"
              onClick={() => window.location.href = '/rankings'}
            >
              Rankings
            </Button>
            
            {/* Show notification bell only for authenticated users */}
            {user && <NotificationBell />}
            
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-blue-800/30 py-4">
            <div className="flex flex-col space-y-2">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white justify-start"
                onClick={() => {
                  window.location.href = '/tournaments';
                  setMobileMenuOpen(false);
                }}
              >
                Tournaments
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white justify-start"
                onClick={() => {
                  window.location.href = '/leaderboards';
                  setMobileMenuOpen(false);
                }}
              >
                Leaderboards
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white justify-start"
                onClick={() => {
                  window.location.href = '/rankings';
                  setMobileMenuOpen(false);
                }}
              >
                Rankings
              </Button>
              
              {/* Mobile notification and user menu */}
              <div className="pt-2 flex items-center gap-2">
                {user && <NotificationBell />}
                <UserMenu />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

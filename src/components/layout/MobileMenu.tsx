
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MobileMenuProps {
  user: any;
  onAuthClick: () => void;
  onSignOut: () => void;
}

export const MobileMenu = ({ user, onAuthClick, onSignOut }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { to: "/tournaments", label: "Tournaments" },
    { to: "/leaderboards", label: "Leaderboards" },
    { to: "/rankings", label: "Rankings" },
    ...(user ? [{ to: "/friends", label: "Friends" }] : [])
  ];

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="text-gray-300 hover:text-white"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeMenu}
            aria-hidden="true"
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-blue-800/30 z-50">
            <nav className="px-4 py-6 space-y-4" role="navigation" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block text-gray-300 hover:text-white px-3 py-2 text-lg font-medium transition-colors rounded-md hover:bg-blue-800/20"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-700">
                {user ? (
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      className="block text-gray-300 hover:text-white px-3 py-2 text-lg font-medium transition-colors rounded-md hover:bg-blue-800/20"
                      onClick={closeMenu}
                    >
                      Profile
                    </Link>
                    <Button
                      onClick={() => {
                        onSignOut();
                        closeMenu();
                      }}
                      variant="outline"
                      className="w-full border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      onAuthClick();
                      closeMenu();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Login / Sign Up
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

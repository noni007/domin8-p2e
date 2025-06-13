
import { useState, useEffect, useRef } from "react";
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
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        closeMenu();
        toggleButtonRef.current?.focus();
      }

      if (event.key === 'Tab') {
        const focusableElements = menuRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus management when menu opens
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstFocusable = menuRef.current.querySelector(
        'a[href], button:not([disabled])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);

  const navItems = [
    { to: "/tournaments", label: "Tournaments" },
    { to: "/leaderboards", label: "Leaderboards" },
    { to: "/rankings", label: "Rankings" },
    ...(user ? [{ to: "/friends", label: "Friends" }] : [])
  ];

  return (
    <div className="md:hidden">
      <Button
        ref={toggleButtonRef}
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="text-gray-300 hover:text-white"
        aria-label={isOpen ? "Close mobile menu" : "Open mobile menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-haspopup="true"
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
          <div 
            id="mobile-menu"
            ref={menuRef}
            className="fixed top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-blue-800/30 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-heading"
          >
            <div className="sr-only" id="mobile-menu-heading">
              Mobile Navigation Menu
            </div>
            <nav className="px-4 py-6 space-y-4" role="navigation" aria-label="Mobile navigation">
              {navItems.map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block text-gray-300 hover:text-white px-3 py-2 text-lg font-medium transition-colors rounded-md hover:bg-blue-800/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={closeMenu}
                  tabIndex={0}
                  aria-label={`Go to ${item.label}`}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-700" role="separator" aria-label="User actions">
                {user ? (
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      className="block text-gray-300 hover:text-white px-3 py-2 text-lg font-medium transition-colors rounded-md hover:bg-blue-800/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      onClick={closeMenu}
                      aria-label="Go to your profile"
                    >
                      Profile
                    </Link>
                    <Button
                      onClick={() => {
                        onSignOut();
                        closeMenu();
                      }}
                      variant="outline"
                      className="w-full border-red-600 text-red-400 hover:bg-red-600/20 focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label="Sign out of your account"
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Sign in or create account"
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

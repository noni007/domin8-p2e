import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { useSwipeGestures } from '@/hooks/useSwipeGestures'
import { Trophy, Shield, Wallet, User, Settings } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onAuthClick: () => void
}

export const MobileMenu = ({ isOpen, onClose, onAuthClick }: MobileMenuProps) => {
  const { user, signOut } = useAuth()
  const { isAdmin } = useAdmin()

  // Add swipe gesture to close menu
  const swipeRef = useSwipeGestures({
    onSwipeRight: onClose,
    threshold: 100
  })

  const navItems = [
    { to: '/tournaments', label: 'Tournaments' },
    { to: '/leaderboards', label: 'Leaderboards' },
    { to: '/rankings', label: 'Rankings' },
    { to: '/teams', label: 'Teams' },
    { to: '/friends', label: 'Community' },
    { to: '/activity', label: 'Activity' },
  ]

  const handleLinkClick = () => {
    onClose()
  }

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        ref={swipeRef as any}
        side="right" 
        className="w-[300px] bg-slate-900/95 backdrop-blur-md border-blue-800/30"
      >
        <SheetHeader>
          <SheetTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/be31ac20-7045-4c65-bf6f-1dda987cd378.png" 
                alt="Domin8 Logo" 
                className="h-6 w-auto mr-2"
              />
              Domin8
            </div>
            <span className="text-xs text-gray-400">Swipe right to close</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col space-y-4 mt-8">
          {/* Navigation Links */}
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleLinkClick}
              className="text-gray-300 hover:text-blue-400 transition-colors py-2"
            >
              {item.label}
            </Link>
          ))}
          
          {user && (
            <>
              <Link
                to="/wallet"
                onClick={handleLinkClick}
                className="text-gray-300 hover:text-blue-400 transition-colors py-2 flex items-center"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </Link>
              
              <Link
                to="/profile"
                onClick={handleLinkClick}
                className="text-gray-300 hover:text-blue-400 transition-colors py-2 flex items-center"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
              
              <Link
                to="/friends"
                onClick={handleLinkClick}
                className="text-gray-300 hover:text-blue-400 transition-colors py-2"
              >
                Friends
              </Link>
            </>
          )}
          
          {isAdmin && (
            <Link
              to="/admin"
              onClick={handleLinkClick}
              className="text-blue-400 hover:text-blue-300 transition-colors py-2 flex items-center"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Panel
            </Link>
          )}

          {/* Auth Section */}
          <div className="border-t border-gray-700 pt-4 mt-4">
            {user ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  {user.email}
                </p>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={onAuthClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Sign In / Register
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
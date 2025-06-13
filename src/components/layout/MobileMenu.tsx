
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { Trophy, Shield, Wallet, X } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onAuthClick: () => void
}

export const MobileMenu = ({ isOpen, onClose, onAuthClick }: MobileMenuProps) => {
  const { user, signOut } = useAuth()
  const { isAdmin } = useAdmin()

  const navItems = [
    { to: '/tournaments', label: 'Tournaments' },
    { to: '/rankings', label: 'Rankings' },
    { to: '/teams', label: 'Teams' },
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
      <SheetContent side="right" className="w-[300px] bg-slate-900 border-blue-800/30">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-blue-400" />
            TourneyPro
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col space-y-4 mt-8">
          {/* Navigation Links */}
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleLinkClick}
              className="text-gray-300 hover:text-white transition-colors py-2"
            >
              {item.label}
            </Link>
          ))}
          
          {user && (
            <>
              <Link
                to="/wallet"
                onClick={handleLinkClick}
                className="text-gray-300 hover:text-white transition-colors py-2 flex items-center"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </Link>
              
              <Link
                to="/profile"
                onClick={handleLinkClick}
                className="text-gray-300 hover:text-white transition-colors py-2"
              >
                Profile
              </Link>
            </>
          )}
          
          {isAdmin && (
            <Link
              to="/admin"
              onClick={handleLinkClick}
              className="text-yellow-400 hover:text-yellow-300 transition-colors py-2 flex items-center"
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
                className="w-full bg-blue-600 hover:bg-blue-700"
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


import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { AuthModal } from '@/components/auth/AuthModal'
import { UserMenu } from './UserMenu'
import { MobileMenu } from './MobileMenu'
import { Menu, Trophy, Shield, Wallet } from 'lucide-react'

export const Navigation = () => {
  const { user } = useAuth()
  const { isAdmin } = useAdmin()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const navigate = useNavigate()

  const navItems = [
    { to: '/tournaments', label: 'Tournaments' },
    { to: '/rankings', label: 'Rankings' },
    { to: '/teams', label: 'Teams' },
    { to: '/activity', label: 'Activity' },
  ]

  return (
    <>
      <nav className="bg-black/20 backdrop-blur-sm border-b border-blue-800/30 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">TourneyPro</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              
              {user && (
                <Link
                  to="/wallet"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <Wallet className="h-4 w-4 mr-1" />
                  Wallet
                </Link>
              )}
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-yellow-400 hover:text-yellow-300 transition-colors flex items-center"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              )}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <UserMenu />
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAuthModal(true)}
                    className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(true)}
                className="text-white"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onAuthClick={() => {
          setShowMobileMenu(false)
          setShowAuthModal(true)
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}

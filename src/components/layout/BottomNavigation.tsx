import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, TrendingUp, Users, Activity, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Home', icon: Home, authRequired: false },
  { to: '/tournaments', label: 'Tournaments', icon: Trophy, authRequired: false },
  { to: '/rankings', label: 'Rankings', icon: TrendingUp, authRequired: false },
  { to: '/teams', label: 'Teams', icon: Users, authRequired: false },
  { to: '/activity', label: 'Activity', icon: Activity, authRequired: false },
  { to: '/wallet', label: 'Wallet', icon: Wallet, authRequired: true },
];

export const BottomNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter(item => 
    !item.authRequired || (item.authRequired && user)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-blue-800/30 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center min-w-[60px] py-2 px-1 rounded-lg transition-colors touch-manipulation",
                isActive 
                  ? "text-blue-400 bg-blue-900/30" 
                  : "text-gray-400 hover:text-gray-300 active:bg-gray-800/30"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
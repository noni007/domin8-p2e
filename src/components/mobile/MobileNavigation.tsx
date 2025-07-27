import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Trophy, 
  Users, 
  User, 
  Wallet,
  Activity,
  Bell
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

const navigationItems = [
  {
    to: '/',
    icon: Home,
    label: 'Home',
    exactMatch: true
  },
  {
    to: '/tournaments',
    icon: Trophy,
    label: 'Tournaments'
  },
  {
    to: '/activity',
    icon: Activity,
    label: 'Activity'
  },
  {
    to: '/friends',
    icon: Users,
    label: 'Friends'
  },
  {
    to: '/profile',
    icon: User,
    label: 'Profile'
  }
];

export const MobileNavigation = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const isActive = (to: string, exactMatch?: boolean) => {
    if (exactMatch) {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {navigationItems.map(({ to, icon: Icon, label, exactMatch }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive: routerIsActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 relative",
                "min-w-[60px] min-h-[60px] flex-1 text-center touch-manipulation",
                "active:scale-95 active:bg-muted/50",
                (routerIsActive || isActive(to, exactMatch))
                  ? "text-primary bg-primary/10 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )
            }
          >
            <div className="relative">
              <Icon className="h-6 w-6" />
              {to === '/activity' && unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-semibold animate-pulse"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-medium truncate max-w-full leading-none">
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
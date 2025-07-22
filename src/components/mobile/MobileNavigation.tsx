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
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 pb-safe">
      <div className="flex items-center justify-around px-2 py-1">
        {navigationItems.map(({ to, icon: Icon, label, exactMatch }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive: routerIsActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative",
                "min-w-0 flex-1 text-center",
                (routerIsActive || isActive(to, exactMatch))
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {to === '/activity' && unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium truncate max-w-full">
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to handle authentication redirects
 * Automatically redirects users to appropriate pages based on auth state
 */
export const useAuthRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (loading) return;

    const currentPath = location.pathname;
    const isAuthPage = currentPath === '/auth';
    const isResetPage = currentPath === '/reset-password';
    
    // Redirect authenticated users away from auth pages
    if (user && (isAuthPage || isResetPage)) {
      const intendedPath = location.state?.from?.pathname || '/';
      navigate(intendedPath, { replace: true });
      return;
    }

    // Protected routes that require authentication
    const protectedRoutes = [
      '/profile',
      '/wallet',
      '/admin',
      '/admin/web3',
      '/friends',
      '/activity'
    ];

    const requiresAuth = protectedRoutes.some(route => 
      currentPath.startsWith(route)
    );

    // Redirect unauthenticated users to auth page
    if (!user && requiresAuth) {
      navigate('/auth', { 
        state: { from: location },
        replace: true 
      });
    }
  }, [user, loading, navigate, location]);

  return { user, loading };
};
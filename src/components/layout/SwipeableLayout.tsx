import { ReactNode } from 'react';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useNavigate, useLocation } from 'react-router-dom';

interface SwipeableLayoutProps {
  children: ReactNode;
}

const pageOrder = ['/', '/tournaments', '/rankings', '/teams', '/activity', '/wallet'];

export const SwipeableLayout = ({ children }: SwipeableLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = pageOrder.indexOf(location.pathname);

  const swipeRef = useSwipeGestures({
    onSwipeLeft: () => {
      // Navigate to next page
      if (currentIndex >= 0 && currentIndex < pageOrder.length - 1) {
        navigate(pageOrder[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      // Navigate to previous page
      if (currentIndex > 0) {
        navigate(pageOrder[currentIndex - 1]);
      }
    },
    threshold: 80,
  });

  return (
    <div ref={swipeRef as any} className="min-h-screen">
      {children}
    </div>
  );
};
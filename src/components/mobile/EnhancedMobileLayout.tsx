import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useMobileInteractions } from '@/hooks/useMobileInteractions';

interface EnhancedMobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  enableHaptics?: boolean;
  optimizeScrolling?: boolean;
}

export const EnhancedMobileLayout = ({ 
  children, 
  className,
  enableHaptics = true,
  optimizeScrolling = true 
}: EnhancedMobileLayoutProps) => {
  const { isMobile, isTouchDevice } = useResponsiveLayout();
  const { optimizeForTouch } = useMobileInteractions();

  React.useEffect(() => {
    if (isMobile && optimizeScrolling) {
      // Add mobile-specific scroll optimizations
      document.body.classList.add('mobile-optimized');
      
      // Prevent overscroll on mobile
      document.body.style.overscrollBehavior = 'contain';
      
      // Optimize scrolling performance
      const scrollContainers = document.querySelectorAll('.mobile-scroll-container');
      scrollContainers.forEach(container => {
        container.classList.add('mobile-scroll');
      });
    }

    return () => {
      document.body.classList.remove('mobile-optimized');
      document.body.style.overscrollBehavior = '';
    };
  }, [isMobile, optimizeScrolling]);

  React.useEffect(() => {
    if (isTouchDevice && enableHaptics) {
      // Optimize touch targets
      const touchElements = document.querySelectorAll('button, [role="button"], a');
      touchElements.forEach(element => {
        if (element instanceof HTMLElement) {
          optimizeForTouch(element);
        }
      });
    }
  }, [isTouchDevice, enableHaptics, optimizeForTouch]);

  return (
    <div 
      className={cn(
        "min-h-screen w-full",
        isMobile && [
          "pb-safe-bottom pt-safe-top",
          "mobile-scroll-container"
        ],
        isTouchDevice && "touch-optimized",
        className
      )}
    >
      {children}
    </div>
  );
};
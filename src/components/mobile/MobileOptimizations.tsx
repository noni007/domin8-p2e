import React, { useEffect } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface MobileOptimizationsProps {
  children: React.ReactNode;
}

export const MobileOptimizations = ({ children }: MobileOptimizationsProps) => {
  const { isMobile, isTouchDevice } = useResponsiveLayout();

  useEffect(() => {
    // Add mobile-specific CSS classes
    if (isMobile) {
      document.body.classList.add('mobile-device');
    } else {
      document.body.classList.remove('mobile-device');
    }

    // Add touch device specific classes
    if (isTouchDevice) {
      document.body.classList.add('touch-device');
    } else {
      document.body.classList.remove('touch-device');
    }

    // Prevent zoom on input focus (iOS Safari)
    if (isMobile) {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
    }

    // Add mobile-specific styles
    const style = document.createElement('style');
    style.innerHTML = `
      .mobile-device {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      
      .touch-device button,
      .touch-device [role="button"] {
        min-height: 44px;
        min-width: 44px;
        touch-action: manipulation;
      }
      
      .mobile-device input,
      .mobile-device textarea,
      .mobile-device select {
        font-size: 16px; /* Prevents zoom on iOS */
      }
      
      @media (max-width: 768px) {
        .mobile-scroll {
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
      document.body.classList.remove('mobile-device', 'touch-device');
    };
  }, [isMobile, isTouchDevice]);

  return <>{children}</>;
};
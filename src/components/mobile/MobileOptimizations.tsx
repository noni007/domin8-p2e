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
      .touch-device [role="button"],
      .touch-device a[role="button"] {
        min-height: 48px;
        min-width: 48px;
        touch-action: manipulation;
        user-select: none;
      }
      
      .mobile-device input,
      .mobile-device textarea,
      .mobile-device select {
        font-size: 16px; /* Prevents zoom on iOS */
        -webkit-appearance: none;
        border-radius: 0;
      }
      
      .mobile-device input:focus,
      .mobile-device textarea:focus,
      .mobile-device select:focus {
        outline: none;
        box-shadow: 0 0 0 2px hsl(var(--ring));
      }
      
      @media (max-width: 768px) {
        .mobile-scroll {
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
        }
        
        /* Safe area support */
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        .safe-area-inset-top {
          padding-top: env(safe-area-inset-top);
        }
        
        /* Better touch targets */
        .touch-target {
          min-height: 48px;
          min-width: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Improved scrolling */
        .mobile-scroll-container {
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .mobile-scroll-container::-webkit-scrollbar {
          display: none;
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
import { useCallback } from 'react';

declare global {
  interface Window {
    Capacitor?: any;
  }
}

export const useMobileInteractions = () => {
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    // Check if we're in a native environment (Capacitor)
    if (window.Capacitor) {
      const { Haptics, ImpactStyle } = require('@capacitor/haptics');
      try {
        const hapticType = type === 'light' ? ImpactStyle.Light : 
                          type === 'medium' ? ImpactStyle.Medium : 
                          ImpactStyle.Heavy;
        Haptics.impact({ style: hapticType });
      } catch {
        // Fallback if haptics import fails
        if ('vibrate' in navigator) {
          const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 30;
          navigator.vibrate(duration);
        }
      }
    } else if ('vibrate' in navigator) {
      // Fallback for web browsers
      const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
    }
  }, []);

  const createTouchHandler = useCallback((
    onClick: () => void, 
    hapticType: 'light' | 'medium' | 'heavy' = 'light'
  ) => {
    return {
      onClick: () => {
        triggerHapticFeedback(hapticType);
        onClick();
      },
      onTouchStart: (event: React.TouchEvent) => {
        // Add visual feedback for touch start
        const target = event.currentTarget as HTMLElement;
        if (target) {
          target.style.transform = 'scale(0.98)';
          target.style.transition = 'transform 0.1s ease';
        }
      },
      onTouchEnd: (event: React.TouchEvent) => {
        // Remove visual feedback on touch end
        const target = event.currentTarget as HTMLElement;
        if (target) {
          target.style.transform = '';
        }
      }
    };
  }, [triggerHapticFeedback]);

  const optimizeForTouch = useCallback((element: HTMLElement) => {
    // Ensure minimum touch target size
    const minSize = 44; // iOS/Android recommendation
    const rect = element.getBoundingClientRect();
    
    if (rect.width < minSize || rect.height < minSize) {
      element.style.minWidth = `${minSize}px`;
      element.style.minHeight = `${minSize}px`;
    }
    
    // Add touch-friendly properties
    element.style.touchAction = 'manipulation';
    element.style.userSelect = 'none';
    (element.style as any).webkitTapHighlightColor = 'transparent';
    
    return element;
  }, []);

  return {
    triggerHapticFeedback,
    createTouchHandler,
    optimizeForTouch
  };
};
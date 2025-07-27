import { useCallback } from 'react';
import { useHaptics } from './useHaptics';
import { useMobileFeatures } from './useMobileFeatures';
import { ImpactStyle } from '@capacitor/haptics';

export const useMobileInteractions = () => {
  const { haptics, isNativePlatform } = useMobileFeatures();

  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (isNativePlatform && haptics.isSupported) {
      switch (type) {
        case 'light':
          haptics.impact(ImpactStyle.Light);
          break;
        case 'medium':
          haptics.impact(ImpactStyle.Medium);
          break;
        case 'heavy':
          haptics.impact(ImpactStyle.Heavy);
          break;
      }
    } else if ('vibrate' in navigator) {
      // Fallback for web
      const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 50;
      navigator.vibrate(duration);
    }
  }, [haptics, isNativePlatform]);

  const createTouchHandler = useCallback((
    onClick: () => void,
    hapticType: 'light' | 'medium' | 'heavy' = 'light'
  ) => {
    return {
      onClick: () => {
        triggerHapticFeedback(hapticType);
        onClick();
      },
      onTouchStart: () => {
        // Add visual feedback for touch start
        const target = event?.currentTarget as HTMLElement;
        if (target) {
          target.style.transform = 'scale(0.98)';
          target.style.transition = 'transform 0.1s ease';
        }
      },
      onTouchEnd: () => {
        // Remove visual feedback on touch end
        const target = event?.currentTarget as HTMLElement;
        if (target) {
          target.style.transform = '';
        }
      }
    };
  }, [triggerHapticFeedback]);

  const optimizeForTouch = useCallback((element: HTMLElement) => {
    // Ensure minimum touch target size
    const rect = element.getBoundingClientRect();
    if (rect.width < 48 || rect.height < 48) {
      element.style.minWidth = '48px';
      element.style.minHeight = '48px';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
    }

    // Add touch-friendly classes
    element.classList.add('touch-target');
    element.style.touchAction = 'manipulation';
    element.style.userSelect = 'none';
    
    return element;
  }, []);

  return {
    triggerHapticFeedback,
    createTouchHandler,
    optimizeForTouch,
    isNativePlatform
  };
};
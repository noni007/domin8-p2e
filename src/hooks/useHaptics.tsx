import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

interface UseHapticsReturn {
  isSupported: boolean;
  impact: (style?: ImpactStyle) => Promise<void>;
  notification: (type?: NotificationType) => Promise<void>;
  vibrate: (duration?: number) => Promise<void>;
  selectionStart: () => Promise<void>;
  selectionChanged: () => Promise<void>;
  selectionEnd: () => Promise<void>;
}

export const useHaptics = (): UseHapticsReturn => {
  const isSupported = Capacitor.isNativePlatform();

  const impact = async (style: ImpactStyle = ImpactStyle.Medium): Promise<void> => {
    if (!isSupported) {
      // Web fallback - use basic vibration if available
      if (navigator.vibrate) {
        const duration = style === ImpactStyle.Light ? 50 : style === ImpactStyle.Heavy ? 200 : 100;
        navigator.vibrate(duration);
      }
      return;
    }

    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.warn('Haptics impact failed:', error);
    }
  };

  const notification = async (type: NotificationType = NotificationType.Success): Promise<void> => {
    if (!isSupported) {
      // Web fallback - use pattern vibration if available
      if (navigator.vibrate) {
        const pattern = type === NotificationType.Error 
          ? [100, 50, 100] 
          : type === NotificationType.Warning 
          ? [50, 50, 50] 
          : [100];
        navigator.vibrate(pattern);
      }
      return;
    }

    try {
      await Haptics.notification({ type });
    } catch (error) {
      console.warn('Haptics notification failed:', error);
    }
  };

  const vibrate = async (duration: number = 100): Promise<void> => {
    if (!isSupported) {
      // Web fallback
      if (navigator.vibrate) {
        navigator.vibrate(duration);
      }
      return;
    }

    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.warn('Haptics vibrate failed:', error);
    }
  };

  const selectionStart = async (): Promise<void> => {
    if (!isSupported) {
      // Web fallback - light vibration
      if (navigator.vibrate) {
        navigator.vibrate(25);
      }
      return;
    }

    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.warn('Haptics selection start failed:', error);
    }
  };

  const selectionChanged = async (): Promise<void> => {
    if (!isSupported) {
      // Web fallback - very light vibration
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      return;
    }

    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.warn('Haptics selection changed failed:', error);
    }
  };

  const selectionEnd = async (): Promise<void> => {
    if (!isSupported) {
      // Web fallback - light vibration
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      return;
    }

    try {
      await Haptics.selectionEnd();
    } catch (error) {
      console.warn('Haptics selection end failed:', error);
    }
  };

  return {
    isSupported,
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
  };
};
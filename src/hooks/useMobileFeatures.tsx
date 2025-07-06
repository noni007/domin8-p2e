import { useCamera } from './useCamera';
import { useGeolocation } from './useGeolocation';
import { usePushNotifications } from './usePushNotifications';
import { useHaptics } from './useHaptics';
import { Capacitor } from '@capacitor/core';

interface UseMobileFeaturesReturn {
  // Platform info
  isNativePlatform: boolean;
  platform: string;
  
  // Camera features
  camera: ReturnType<typeof useCamera>;
  
  // Geolocation features
  geolocation: ReturnType<typeof useGeolocation>;
  
  // Push notifications
  pushNotifications: ReturnType<typeof usePushNotifications>;
  
  // Haptics
  haptics: ReturnType<typeof useHaptics>;
  
  // Utility functions
  checkSupport: () => {
    camera: boolean;
    geolocation: boolean;
    pushNotifications: boolean;
    haptics: boolean;
  };
}

export const useMobileFeatures = (): UseMobileFeaturesReturn => {
  const camera = useCamera();
  const geolocation = useGeolocation();
  const pushNotifications = usePushNotifications();
  const haptics = useHaptics();
  
  const isNativePlatform = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  const checkSupport = () => ({
    camera: camera.isNativeCamera || ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices),
    geolocation: geolocation.isNativeGeolocation || ('geolocation' in navigator),
    pushNotifications: pushNotifications.isSupported,
    haptics: haptics.isSupported || ('vibrate' in navigator),
  });

  return {
    isNativePlatform,
    platform,
    camera,
    geolocation,
    pushNotifications,
    haptics,
    checkSupport,
  };
};
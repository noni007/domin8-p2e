import React from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

interface PushNotification {
  title: string;
  body: string;
  id: string;
  data?: any;
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  notifications: PushNotification[];
  requestPermission: () => Promise<boolean>;
  register: () => Promise<void>;
  unregister: () => Promise<void>;
  clearNotifications: () => void;
  error: string | null;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [notifications, setNotifications] = React.useState<PushNotification[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  
  const isSupported = Capacitor.isNativePlatform();

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are only supported on mobile devices');
      return false;
    }

    try {
      const result = await PushNotifications.requestPermissions();
      return result.receive === 'granted';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Permission request failed';
      setError(errorMessage);
      return false;
    }
  };

  const register = async (): Promise<void> => {
    if (!isSupported) {
      setError('Push notifications are only supported on mobile devices');
      return;
    }

    try {
      setError(null);
      await PushNotifications.register();
      setIsRegistered(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
    }
  };

  const unregister = async (): Promise<void> => {
    if (!isSupported) return;

    try {
      await PushNotifications.removeAllDeliveredNotifications();
      setIsRegistered(false);
      setToken(null);
      setNotifications([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unregistration failed';
      setError(errorMessage);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  React.useEffect(() => {
    if (!isSupported) return;

    // Add listeners for push notification events
    const addListeners = async () => {
      // On registration success
      await PushNotifications.addListener('registration', (token) => {
        setToken(token.value);
        setError(null);
      });

      // On registration error
      await PushNotifications.addListener('registrationError', (err) => {
        setError(err.error);
      });

      // On push notification received
      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        const newNotification: PushNotification = {
          title: notification.title || 'No title',
          body: notification.body || 'No message',
          id: notification.id || Date.now().toString(),
          data: notification.data,
        };
        setNotifications(prev => [newNotification, ...prev]);
      });

      // On push notification action performed
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
        // Handle notification tap/action here
      });
    };

    addListeners();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [isSupported]);

  return {
    isSupported,
    isRegistered,
    token,
    notifications,
    requestPermission,
    register,
    unregister,
    clearNotifications,
    error,
  };
};
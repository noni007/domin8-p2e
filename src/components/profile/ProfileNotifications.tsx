
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { NotificationDebugPanel } from '@/components/notifications/NotificationDebugPanel';

export const ProfileNotifications = () => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="space-y-6">
      <NotificationSettings />
      
      {isDevelopment && (
        <div className="border-t border-blue-800/30 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Development Tools</h3>
          <NotificationDebugPanel />
        </div>
      )}
    </div>
  );
};

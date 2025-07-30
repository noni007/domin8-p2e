
import * as React from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Settings } from 'lucide-react';

interface MaintenanceCheckProps {
  children: React.ReactNode;
}

export const MaintenanceCheck = ({ children }: MaintenanceCheckProps) => {
  const { flags, loading } = useFeatureFlags();
  const { isAdmin } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (flags.feature_maintenance_mode && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-black/40 border-yellow-800/30 backdrop-blur-sm max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Settings className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-white mb-2">Maintenance Mode</h2>
            <p className="text-gray-300 mb-4">
              TourneyPro is currently undergoing maintenance to improve your experience.
            </p>
            <p className="text-gray-400 text-sm">
              We'll be back online shortly. Thank you for your patience!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

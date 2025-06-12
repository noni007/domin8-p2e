
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { createSampleNotifications, clearUserNotifications } from '@/utils/sampleNotifications';
import { notificationTriggers } from '@/utils/notificationTriggers';
import { Trash2, TestTube, Zap } from 'lucide-react';

export const NotificationDebugPanel = () => {
  const { user } = useAuth();
  const { refetch } = useNotifications();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCreateSamples = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await createSampleNotifications(user.id);
      await refetch();
      toast({
        title: 'Success',
        description: 'Sample notifications created successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create sample notifications.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await clearUserNotifications(user.id);
      await refetch();
      toast({
        title: 'Success',
        description: 'All notifications cleared successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear notifications.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestTrigger = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await notificationTriggers.onTournamentRegistration(
        user.id,
        'Test Tournament 2024',
        'test-tournament-id'
      );
      await refetch();
      toast({
        title: 'Success',
        description: 'Test notification trigger executed!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to execute notification trigger.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="bg-black/40 border-blue-800/30">
        <CardContent className="p-6">
          <p className="text-gray-400">Please log in to test notifications.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-blue-800/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Notification Debug Panel
        </CardTitle>
        <CardDescription className="text-gray-300">
          Development tools for testing the notification system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleCreateSamples}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Create Samples
          </Button>
          
          <Button
            onClick={handleTestTrigger}
            disabled={loading}
            variant="outline"
            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
          >
            <Zap className="h-4 w-4 mr-2" />
            Test Trigger
          </Button>
          
          <Button
            onClick={handleClearNotifications}
            disabled={loading}
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
        
        <div className="text-sm text-gray-400 space-y-1">
          <p><strong>Create Samples:</strong> Generates 6 sample notifications of different types</p>
          <p><strong>Test Trigger:</strong> Tests the tournament registration notification trigger</p>
          <p><strong>Clear All:</strong> Removes all notifications for the current user</p>
        </div>
      </CardContent>
    </Card>
  );
};

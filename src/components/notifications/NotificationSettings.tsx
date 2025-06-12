
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, Smartphone, Trophy, Gamepad2, Award, Users } from 'lucide-react';

export const NotificationSettings = () => {
  const { preferences, updatePreferences, loading } = useNotifications();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key: string, value: boolean) => {
    if (!preferences) return;

    setSaving(true);
    try {
      await updatePreferences({ [key]: value });
      toast({
        title: 'Settings updated',
        description: 'Your notification preferences have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading preferences...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Methods
          </CardTitle>
          <CardDescription className="text-gray-300">
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-blue-400" />
              <div>
                <Label htmlFor="email-notifications" className="text-white">Email Notifications</Label>
                <p className="text-sm text-gray-400">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences?.email_notifications || false}
              onCheckedChange={(checked) => handleToggle('email_notifications', checked)}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-green-400" />
              <div>
                <Label htmlFor="push-notifications" className="text-white">Push Notifications</Label>
                <p className="text-sm text-gray-400">Receive real-time browser notifications</p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences?.push_notifications || false}
              onCheckedChange={(checked) => handleToggle('push_notifications', checked)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-white">Notification Types</CardTitle>
          <CardDescription className="text-gray-300">
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <div>
                <Label htmlFor="tournament-updates" className="text-white">Tournament Updates</Label>
                <p className="text-sm text-gray-400">Registration confirmations, status changes</p>
              </div>
            </div>
            <Switch
              id="tournament-updates"
              checked={preferences?.tournament_updates || false}
              onCheckedChange={(checked) => handleToggle('tournament_updates', checked)}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gamepad2 className="h-4 w-4 text-purple-400" />
              <div>
                <Label htmlFor="match-updates" className="text-white">Match Updates</Label>
                <p className="text-sm text-gray-400">Schedule changes, results, reminders</p>
              </div>
            </div>
            <Switch
              id="match-updates"
              checked={preferences?.match_updates || false}
              onCheckedChange={(checked) => handleToggle('match_updates', checked)}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="h-4 w-4 text-orange-400" />
              <div>
                <Label htmlFor="achievement-notifications" className="text-white">Achievements</Label>
                <p className="text-sm text-gray-400">New badges, rank promotions, milestones</p>
              </div>
            </div>
            <Switch
              id="achievement-notifications"
              checked={preferences?.achievement_notifications || false}
              onCheckedChange={(checked) => handleToggle('achievement_notifications', checked)}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-pink-400" />
              <div>
                <Label htmlFor="friend-notifications" className="text-white">Social</Label>
                <p className="text-sm text-gray-400">Friend requests, team invitations</p>
              </div>
            </div>
            <Switch
              id="friend-notifications"
              checked={preferences?.friend_notifications || false}
              onCheckedChange={(checked) => handleToggle('friend_notifications', checked)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

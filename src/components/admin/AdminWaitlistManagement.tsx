
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useFeatureWaitlist } from '@/hooks/useFeatureWaitlist';
import { Users, Target, Trophy, Download, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WaitlistEntry {
  id: string;
  email: string;
  feature_name: string;
  join_position: number;
  referral_code: string;
  referred_by: string | null;
  created_at: string;
}

export const AdminWaitlistManagement = () => {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { stats, milestones } = useFeatureWaitlist();
  const { toast } = useToast();

  const fetchWaitlistEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_waitlist')
        .select('*')
        .order('join_position', { ascending: true });

      if (error) throw error;
      setWaitlistEntries(data || []);
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
      toast({
        title: "Error loading waitlist",
        description: "Failed to load waitlist data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportWaitlist = () => {
    const csvContent = [
      ['Position', 'Email', 'Feature', 'Referral Code', 'Referred By', 'Joined Date'],
      ...waitlistEntries.map(entry => [
        entry.join_position,
        entry.email,
        entry.feature_name,
        entry.referral_code,
        entry.referred_by || 'Direct',
        new Date(entry.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchWaitlistEntries();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const referralStats = waitlistEntries.reduce((acc, entry) => {
    if (entry.referred_by) {
      acc.referred++;
    } else {
      acc.direct++;
    }
    return acc;
  }, { direct: 0, referred: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Waitlist Management</h2>
        <Button onClick={exportWaitlist} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Signups</p>
                <p className="text-2xl font-bold">{stats?.total_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Next Milestone</p>
                <p className="text-2xl font-bold">{stats?.next_milestone_target || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Direct Signups</p>
                <p className="text-2xl font-bold">{referralStats.direct}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Referrals</p>
                <p className="text-2xl font-bold">{referralStats.referred}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones Progress</CardTitle>
          <CardDescription>Track progress toward development milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((milestone) => {
              const isReached = (stats?.total_count || 0) >= milestone.milestone_count;
              return (
                <div key={milestone.id} className="space-y-2">
                  <Badge variant={isReached ? "default" : "outline"} className="w-full justify-center">
                    {milestone.title}
                  </Badge>
                  <p className="text-sm text-center">{milestone.milestone_count} signups</p>
                  <p className="text-xs text-gray-600 text-center">{milestone.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
          <CardDescription>Latest waitlist registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {waitlistEntries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">#{entry.join_position} - {entry.email}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(entry.created_at).toLocaleDateString()} • 
                    {entry.referred_by ? ` Referred by ${entry.referred_by}` : ' Direct signup'}
                  </p>
                </div>
                <Badge variant="outline">{entry.feature_name}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

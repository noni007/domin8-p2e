
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart, 
  RefreshCw,
  User,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";

interface OnboardingMetrics {
  totalUsers: number;
  completedOnboarding: number;
  averageCompletionTime: number;
  stepCompletionRates: Record<string, number>;
  dropoffPoints: Array<{ step: string; dropoffRate: number }>;
}

interface UserOnboardingData {
  user_id: string;
  email: string;
  username: string;
  created_at: string;
  onboarding_status: 'completed' | 'in_progress' | 'abandoned';
  steps_completed: string[];
  total_time_spent: number;
  last_activity: string;
}

export const AdminOnboardingAnalytics = () => {
  const { isAdmin } = useAdmin();
  const [metrics, setMetrics] = useState<OnboardingMetrics>({
    totalUsers: 0,
    completedOnboarding: 0,
    averageCompletionTime: 0,
    stepCompletionRates: {},
    dropoffPoints: []
  });
  const [userAnalytics, setUserAnalytics] = useState<UserOnboardingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    if (isAdmin) {
      fetchOnboardingAnalytics();
    }
  }, [isAdmin, selectedTimeRange]);

  const fetchOnboardingAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch onboarding analytics from user_activities
      const timeRange = getTimeRangeFilter();
      const { data: activities, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('activity_type', 'onboarding_analytics')
        .gte('created_at', timeRange);

      if (error) throw error;

      // Process analytics data
      const processedMetrics = processOnboardingData(activities || []);
      setMetrics(processedMetrics);

      // Fetch user data for detailed view
      const userData = await fetchUserOnboardingData();
      setUserAnalytics(userData);

    } catch (error) {
      console.error('Error fetching onboarding analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeFilter = () => {
    const now = new Date();
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    const pastDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return pastDate.toISOString();
  };

  const processOnboardingData = (activities: any[]): OnboardingMetrics => {
    const userSessions = new Map();
    
    // Group activities by user
    activities.forEach(activity => {
      const userId = activity.user_id;
      if (!userSessions.has(userId)) {
        userSessions.set(userId, {
          steps: new Set(),
          startTime: null,
          endTime: null,
          completed: false
        });
      }
      
      const session = userSessions.get(userId);
      const step = activity.metadata?.step;
      const action = activity.metadata?.action;
      
      if (step) session.steps.add(step);
      if (action === 'onboarding_completed') session.completed = true;
      
      if (!session.startTime) session.startTime = new Date(activity.created_at);
      session.endTime = new Date(activity.created_at);
    });

    // Calculate metrics
    const totalUsers = userSessions.size;
    const completedUsers = Array.from(userSessions.values()).filter(s => s.completed).length;
    const avgTime = Array.from(userSessions.values())
      .filter(s => s.completed && s.startTime && s.endTime)
      .reduce((acc, s) => acc + (s.endTime.getTime() - s.startTime.getTime()), 0) / completedUsers / 1000 / 60; // in minutes

    // Step completion rates
    const stepCounts = { welcome: 0, profile: 0, features: 0, tournaments: 0 };
    userSessions.forEach(session => {
      session.steps.forEach(step => {
        if (stepCounts.hasOwnProperty(step)) {
          stepCounts[step]++;
        }
      });
    });

    const stepCompletionRates = Object.entries(stepCounts).reduce((acc, [step, count]) => {
      acc[step] = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
      return acc;
    }, {} as Record<string, number>);

    // Calculate dropoff points
    const dropoffPoints = Object.entries(stepCompletionRates)
      .map(([step, rate]) => ({ step, dropoffRate: 100 - rate }))
      .sort((a, b) => b.dropoffRate - a.dropoffRate);

    return {
      totalUsers,
      completedOnboarding: completedUsers,
      averageCompletionTime: avgTime || 0,
      stepCompletionRates,
      dropoffPoints
    };
  };

  const fetchUserOnboardingData = async (): Promise<UserOnboardingData[]> => {
    try {
      // This would require a more complex query joining profiles and activities
      // For now, return mock data structure
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, username, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return profiles?.map(profile => ({
        user_id: profile.id,
        email: profile.email,
        username: profile.username || 'Anonymous',
        created_at: profile.created_at,
        onboarding_status: 'completed' as const, // Would need to calculate from activities
        steps_completed: ['welcome', 'profile'],
        total_time_spent: Math.floor(Math.random() * 300) + 60, // Mock data
        last_activity: profile.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching user data:', error);
      return [];
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'in_progress': return 'bg-yellow-600';
      case 'abandoned': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (!isAdmin) {
    return (
      <Card className="bg-black/40 border-blue-800/30">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Onboarding Analytics</h2>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="bg-black/40 border border-blue-800/30 text-white rounded px-3 py-1"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={fetchOnboardingAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-blue-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.totalUsers}</div>
            <p className="text-xs text-gray-400">Started onboarding</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.totalUsers > 0 ? Math.round((metrics.completedOnboarding / metrics.totalUsers) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-400">{metrics.completedOnboarding} completed</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg. Time</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {Math.round(metrics.averageCompletionTime)}m
            </div>
            <p className="text-xs text-gray-400">Average completion time</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Drop-off Rate</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.dropoffPoints[0]?.dropoffRate ? Math.round(metrics.dropoffPoints[0].dropoffRate) : 0}%
            </div>
            <p className="text-xs text-gray-400">Highest drop-off step</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-black/40 border-blue-800/30">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="steps">Step Analysis</TabsTrigger>
          <TabsTrigger value="users">User Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-black/40 border-blue-800/30">
            <CardHeader>
              <CardTitle className="text-white">Step Completion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.stepCompletionRates).map(([step, rate]) => (
                  <div key={step} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300 capitalize">{step}</span>
                      <span className="text-white">{Math.round(rate)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${rate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps" className="space-y-4">
          <Card className="bg-black/40 border-blue-800/30">
            <CardHeader>
              <CardTitle className="text-white">Drop-off Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Step</TableHead>
                    <TableHead className="text-gray-300">Completion Rate</TableHead>
                    <TableHead className="text-gray-300">Drop-off Rate</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.dropoffPoints.map((point) => (
                    <TableRow key={point.step}>
                      <TableCell className="text-white capitalize">{point.step}</TableCell>
                      <TableCell className="text-gray-300">
                        {Math.round(100 - point.dropoffRate)}%
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {Math.round(point.dropoffRate)}%
                      </TableCell>
                      <TableCell>
                        <Badge className={point.dropoffRate > 50 ? 'bg-red-600' : point.dropoffRate > 25 ? 'bg-yellow-600' : 'bg-green-600'}>
                          {point.dropoffRate > 50 ? 'Critical' : point.dropoffRate > 25 ? 'Warning' : 'Good'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-black/40 border-blue-800/30">
            <CardHeader>
              <CardTitle className="text-white">Recent User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Steps Completed</TableHead>
                    <TableHead className="text-gray-300">Time Spent</TableHead>
                    <TableHead className="text-gray-300">Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAnalytics.slice(0, 10).map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="text-white">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.onboarding_status)}>
                          {user.onboarding_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {user.steps_completed.length}/4
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {formatDuration(user.total_time_spent)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">
                            {new Date(user.last_activity).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

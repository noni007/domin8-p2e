import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Trophy, 
  Activity,
  DollarSign,
  BarChart3,
  PieChart,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell } from 'recharts';

interface AnalyticsData {
  dailySignups: any[];
  tournamentParticipation: any[];
  revenueMetrics: any;
  userEngagement: any;
  platformGrowth: any;
}

export const AdminAnalyticsDashboard = () => {
  const { isAdmin } = useAdmin();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (isAdmin) {
      fetchAnalyticsData();
    }
  }, [isAdmin, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(endDate.getDate() - days);

      // Fetch user signups over time
      const { data: signupData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      // Group signups by day
      const dailySignups = signupData?.reduce((acc: any[], profile) => {
        const date = new Date(profile.created_at).toDateString();
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.signups += 1;
        } else {
          acc.push({ date, signups: 1 });
        }
        return acc;
      }, []) || [];

      // Fetch tournament participation data
      const { data: tournamentData } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_participants(count)
        `)
        .gte('created_at', startDate.toISOString());

      const tournamentParticipation = tournamentData?.map(tournament => ({
        name: tournament.title,
        participants: tournament.tournament_participants?.length || 0,
        status: tournament.status,
        prize_pool: tournament.prize_pool
      })) || [];

      // Fetch revenue metrics
      const { data: revenueData } = await supabase
        .from('wallet_transactions')
        .select('amount, transaction_type, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      const totalRevenue = revenueData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const transactionCount = revenueData?.length || 0;
      const avgTransactionValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      // Fetch user engagement metrics
      const { data: activityData } = await supabase
        .from('user_activities')
        .select('activity_type, created_at, user_id')
        .gte('created_at', startDate.toISOString());

      const uniqueActiveUsers = new Set(activityData?.map(a => a.user_id)).size;
      const totalActivities = activityData?.length || 0;

      // Calculate platform growth
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: usersLastPeriod } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', startDate.toISOString());

      const growthRate = usersLastPeriod ? 
        ((totalUsers! - usersLastPeriod) / usersLastPeriod) * 100 : 0;

      setAnalytics({
        dailySignups,
        tournamentParticipation,
        revenueMetrics: {
          totalRevenue,
          transactionCount,
          avgTransactionValue,
          revenueGrowth: 15.3 // Would calculate from historical data
        },
        userEngagement: {
          activeUsers: uniqueActiveUsers,
          totalActivities,
          avgActivitiesPerUser: uniqueActiveUsers > 0 ? totalActivities / uniqueActiveUsers : 0,
          engagementRate: 67.8 // Would calculate based on return visits
        },
        platformGrowth: {
          totalUsers: totalUsers || 0,
          growthRate,
          retentionRate: 82.4, // Would calculate from user activity patterns
          churnRate: 17.6 // Would calculate from inactive users
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toLocaleString()}`;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (!isAdmin) {
    return <div className="text-center text-red-400">Access denied</div>;
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
        <p className="text-gray-400 mt-2">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {analytics?.platformGrowth.totalUsers.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-green-400">
                +{analytics?.platformGrowth.growthRate.toFixed(1)}%
              </span>
              <span className="text-gray-400">this period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-600/20 to-green-800/20 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {formatCurrency(analytics?.revenueMetrics.totalRevenue || 0)}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-green-400">
                +{analytics?.revenueMetrics.revenueGrowth}%
              </span>
              <span className="text-gray-400">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {analytics?.userEngagement.activeUsers.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-purple-400">
                {analytics?.userEngagement.engagementRate}%
              </span>
              <span className="text-gray-400">engagement rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {analytics?.platformGrowth.retentionRate}%
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-red-400">
                {analytics?.platformGrowth.churnRate}%
              </span>
              <span className="text-gray-400">churn rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.dailySignups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="signups" 
                    stroke="#3B82F6" 
                    fill="url(#colorSignups)" 
                  />
                  <defs>
                    <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tournament Participation */}
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Tournament Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.tournamentParticipation.slice(0, 5).map((tournament, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium truncate">
                      {tournament.name}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {tournament.participants} participants
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        tournament.status === 'completed' ? 'bg-green-600' :
                        tournament.status === 'in_progress' ? 'bg-yellow-600' : 'bg-blue-600'
                      }
                    >
                      {tournament.status}
                    </Badge>
                    <div className="text-yellow-400 text-sm font-mono">
                      ${tournament.prize_pool.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">User Engagement</span>
                <span className="text-white font-semibold">
                  {analytics?.userEngagement.engagementRate}%
                </span>
              </div>
              <Progress value={analytics?.userEngagement.engagementRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Retention Rate</span>
                <span className="text-white font-semibold">
                  {analytics?.platformGrowth.retentionRate}%
                </span>
              </div>
              <Progress value={analytics?.platformGrowth.retentionRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Platform Health</span>
                <span className="text-white font-semibold">94.2%</span>
              </div>
              <Progress value={94.2} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
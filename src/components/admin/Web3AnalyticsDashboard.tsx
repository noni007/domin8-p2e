import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Coins,
  Activity,
  Download,
  Calendar,
  PieChart
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsData {
  totalTransactions: number;
  totalVolume: number;
  averageTransactionValue: number;
  topTokens: Array<{ symbol: string; volume: number; count: number }>;
  dailyVolume: Array<{ date: string; volume: number; transactions: number }>;
  userAdoption: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    retentionRate: number;
  };
  networkDistribution: Array<{ network: string; percentage: number; volume: number }>;
  transactionTypes: Array<{ type: string; count: number; volume: number }>;
}

export const Web3AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Fetch crypto transactions
      const { data: transactions, error: txError } = await supabase
        .from('crypto_transactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (txError) throw txError;

      // Fetch user data
      const { data: users, error: userError } = await supabase
        .from('user_web3_wallets')
        .select('user_id, created_at')
        .gte('created_at', startDate.toISOString());

      if (userError) throw userError;

      // Process analytics data
      const totalTransactions = transactions?.length || 0;
      const confirmedTx = transactions?.filter(tx => tx.status === 'confirmed') || [];
      const totalVolume = confirmedTx.reduce((sum, tx) => sum + tx.amount_formatted, 0);
      const averageTransactionValue = totalVolume / (confirmedTx.length || 1);

      // Token analysis
      const tokenStats = confirmedTx.reduce((acc, tx) => {
        const symbol = tx.token_symbol || 'MATIC';
        if (!acc[symbol]) {
          acc[symbol] = { symbol, volume: 0, count: 0 };
        }
        acc[symbol].volume += tx.amount_formatted;
        acc[symbol].count += 1;
        return acc;
      }, {} as Record<string, { symbol: string; volume: number; count: number }>);

      const topTokens = Object.values(tokenStats)
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5);

      // Daily volume analysis
      const dailyStats = confirmedTx.reduce((acc, tx) => {
        const date = new Date(tx.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, volume: 0, transactions: 0 };
        }
        acc[date].volume += tx.amount_formatted;
        acc[date].transactions += 1;
        return acc;
      }, {} as Record<string, { date: string; volume: number; transactions: number }>);

      const dailyVolume = Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));

      // User adoption metrics
      const totalUsersCount = await supabase
        .from('user_web3_wallets')
        .select('user_id', { count: 'exact' })
        .single();

      const activeUsersCount = new Set(confirmedTx.map(tx => tx.user_id)).size;
      const newUsersCount = users?.length || 0;

      const userAdoption = {
        totalUsers: totalUsersCount.count || 0,
        activeUsers: activeUsersCount,
        newUsers: newUsersCount,
        retentionRate: totalUsersCount.count ? (activeUsersCount / totalUsersCount.count) * 100 : 0
      };

      // Network distribution
      const networkStats = confirmedTx.reduce((acc, tx) => {
        const networkName = getNetworkName(tx.network_id);
        if (!acc[networkName]) {
          acc[networkName] = { network: networkName, volume: 0, count: 0 };
        }
        acc[networkName].volume += tx.amount_formatted;
        acc[networkName].count += 1;
        return acc;
      }, {} as Record<string, { network: string; volume: number; count: number }>);

      const networkDistribution = Object.values(networkStats).map(stat => ({
        ...stat,
        percentage: (stat.volume / totalVolume) * 100
      }));

      // Transaction types
      const typeStats = confirmedTx.reduce((acc, tx) => {
        const type = tx.transaction_type || 'unknown';
        if (!acc[type]) {
          acc[type] = { type, count: 0, volume: 0 };
        }
        acc[type].count += 1;
        acc[type].volume += tx.amount_formatted;
        return acc;
      }, {} as Record<string, { type: string; count: number; volume: number }>);

      const transactionTypes = Object.values(typeStats);

      setAnalytics({
        totalTransactions,
        totalVolume,
        averageTransactionValue,
        topTokens,
        dailyVolume,
        userAdoption,
        networkDistribution,
        transactionTypes
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getNetworkName = (networkId: number) => {
    switch (networkId) {
      case 1: return 'Ethereum';
      case 137: return 'Polygon';
      case 56: return 'BSC';
      default: return `Network ${networkId}`;
    }
  };

  const exportData = () => {
    if (!analytics) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Transactions', analytics.totalTransactions.toString()],
      ['Total Volume (MATIC)', analytics.totalVolume.toFixed(2)],
      ['Average Transaction Value', analytics.averageTransactionValue.toFixed(4)],
      ['Total Users', analytics.userAdoption.totalUsers.toString()],
      ['Active Users', analytics.userAdoption.activeUsers.toString()],
      ['New Users', analytics.userAdoption.newUsers.toString()],
      ['Retention Rate (%)', analytics.userAdoption.retentionRate.toFixed(2)]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `web3_analytics_${timeRange}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading || !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Web3 Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Web3 Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{analytics.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">{analytics.totalVolume.toFixed(2)} MATIC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold">{analytics.averageTransactionValue.toFixed(4)} MATIC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{analytics.userAdoption.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Adoption Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Adoption
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Total Users</span>
                  <span>{analytics.userAdoption.totalUsers}</span>
                </div>
                <Progress value={100} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Active Users</span>
                  <span>{analytics.userAdoption.activeUsers}</span>
                </div>
                <Progress 
                  value={(analytics.userAdoption.activeUsers / analytics.userAdoption.totalUsers) * 100} 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Retention Rate</span>
                  <span>{analytics.userAdoption.retentionRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.userAdoption.retentionRate} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  +{analytics.userAdoption.newUsers}
                </div>
                <div className="text-sm text-muted-foreground">New Users ({timeRange})</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Distribution & Transaction Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Top Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topTokens.map((token, index) => (
                <div key={token.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="font-medium">{token.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{token.volume.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{token.count} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Transaction Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.transactionTypes.map((type, index) => (
                <div key={type.type} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="capitalize">{type.type.replace('_', ' ')}</span>
                    <span className="font-semibold">{type.count}</span>
                  </div>
                  <Progress 
                    value={(type.count / analytics.totalTransactions) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Volume Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.dailyVolume.map((day) => (
              <div key={day.date} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{new Date(day.date).toLocaleDateString()}</span>
                  <span>{day.volume.toFixed(2)} MATIC ({day.transactions} txs)</span>
                </div>
                <Progress 
                  value={(day.volume / Math.max(...analytics.dailyVolume.map(d => d.volume))) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
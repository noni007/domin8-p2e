import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp,
  RefreshCw,
  Gauge,
  Cpu,
  HardDrive
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  transactionSpeed: number;
  networkLatency: number;
  gasEfficiency: number;
  walletResponseTime: number;
  systemLoad: number;
  memoryUsage: number;
  errorRate: number;
}

interface NetworkStats {
  currentBlock: number;
  gasPrice: string;
  networkCongestion: number;
  averageBlockTime: number;
}

export const Web3PerformanceMonitor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    transactionSpeed: 0,
    networkLatency: 0,
    gasEfficiency: 0,
    walletResponseTime: 0,
    systemLoad: 0,
    memoryUsage: 0,
    errorRate: 0
  });
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    currentBlock: 0,
    gasPrice: '0',
    networkCongestion: 0,
    averageBlockTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPerformanceData();
      startMonitoring();
    }
  }, [user]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent transactions for performance analysis
      const { data: transactions } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Calculate performance metrics
      const calculatedMetrics = calculatePerformanceMetrics(transactions || []);
      setMetrics(calculatedMetrics);

      // Simulate network stats (in a real app, this would come from Web3 providers)
      const networkData = await fetchNetworkStats();
      setNetworkStats(networkData);

    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        title: "Error",
        description: "Failed to load performance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformanceMetrics = (transactions: any[]): PerformanceMetrics => {
    if (transactions.length === 0) {
      return {
        transactionSpeed: 0,
        networkLatency: 0,
        gasEfficiency: 0,
        walletResponseTime: 0,
        systemLoad: 0,
        memoryUsage: 0,
        errorRate: 0
      };
    }

    // Calculate transaction speed (transactions per minute)
    const recentTransactions = transactions.filter(t => 
      Date.now() - new Date(t.created_at).getTime() < 60 * 60 * 1000
    );
    const transactionSpeed = recentTransactions.length / 60;

    // Calculate error rate
    const failedTransactions = transactions.filter(t => t.status === 'failed').length;
    const errorRate = (failedTransactions / transactions.length) * 100;

    // Calculate gas efficiency (mock calculation)
    const totalGasUsed = transactions.reduce((sum, t) => sum + (t.gas_used || 0), 0);
    const avgGasUsed = totalGasUsed / transactions.length;
    const gasEfficiency = Math.max(0, 100 - (avgGasUsed / 21000) * 100);

    // Simulate other metrics
    const networkLatency = Math.random() * 100 + 50; // 50-150ms
    const walletResponseTime = Math.random() * 200 + 100; // 100-300ms
    const systemLoad = Math.random() * 100;
    const memoryUsage = Math.random() * 100;

    return {
      transactionSpeed,
      networkLatency,
      gasEfficiency,
      walletResponseTime,
      systemLoad,
      memoryUsage,
      errorRate
    };
  };

  const fetchNetworkStats = async (): Promise<NetworkStats> => {
    // In a real app, this would fetch from Web3 providers
    return {
      currentBlock: Math.floor(Math.random() * 1000000) + 18000000,
      gasPrice: (Math.random() * 50 + 20).toFixed(2),
      networkCongestion: Math.random() * 100,
      averageBlockTime: Math.random() * 5 + 10
    };
  };

  const startMonitoring = () => {
    setMonitoring(true);
    
    // Set up real-time monitoring
    const interval = setInterval(() => {
      fetchPerformanceData();
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
      setMonitoring(false);
    };
  };

  const getPerformanceColor = (value: number, threshold: number = 70) => {
    if (value >= threshold) return 'text-green-400';
    if (value >= threshold - 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLatencyColor = (value: number) => {
    if (value <= 100) return 'text-green-400';
    if (value <= 200) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-300">Loading performance monitor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Gauge className="h-5 w-5 mr-2 text-blue-400" />
            Performance Overview
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={monitoring ? 'bg-green-600' : 'bg-gray-600'}>
              <Activity className="h-3 w-3 mr-1" />
              {monitoring ? 'Monitoring' : 'Offline'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPerformanceData}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getPerformanceColor(100 - metrics.errorRate)}`}>
                {(100 - metrics.errorRate).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getLatencyColor(metrics.networkLatency)}`}>
                {metrics.networkLatency.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-400">Network Latency</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getPerformanceColor(metrics.gasEfficiency)}`}>
                {metrics.gasEfficiency.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Gas Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {metrics.transactionSpeed.toFixed(1)}/min
              </div>
              <div className="text-sm text-gray-400">Transaction Speed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Performance */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cpu className="h-5 w-5 mr-2 text-blue-400" />
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">System Load</span>
                <span className="text-sm text-white">{metrics.systemLoad.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.systemLoad} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Memory Usage</span>
                <span className="text-sm text-white">{metrics.memoryUsage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Wallet Response Time</span>
                <span className={`text-sm ${getLatencyColor(metrics.walletResponseTime)}`}>
                  {metrics.walletResponseTime.toFixed(0)}ms
                </span>
              </div>
              <Progress 
                value={Math.min(metrics.walletResponseTime / 5, 100)} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Statistics */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-blue-400" />
            Network Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {networkStats.currentBlock.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Current Block</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {networkStats.gasPrice} Gwei
              </div>
              <div className="text-sm text-gray-400">Gas Price</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getPerformanceColor(100 - networkStats.networkCongestion)}`}>
                {networkStats.networkCongestion.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400">Network Congestion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {networkStats.averageBlockTime.toFixed(1)}s
              </div>
              <div className="text-sm text-gray-400">Avg Block Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Recommendations */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
            Performance Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.errorRate > 10 && (
              <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-red-400 mr-2" />
                  <span className="text-red-300">High error rate detected. Consider reviewing transaction parameters.</span>
                </div>
              </div>
            )}
            
            {metrics.networkLatency > 200 && (
              <div className="p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-400 mr-2" />
                  <span className="text-yellow-300">High network latency. Consider using a different RPC endpoint.</span>
                </div>
              </div>
            )}
            
            {metrics.gasEfficiency < 50 && (
              <div className="p-3 bg-orange-900/20 border border-orange-800/30 rounded-lg">
                <div className="flex items-center">
                  <HardDrive className="h-4 w-4 text-orange-400 mr-2" />
                  <span className="text-orange-300">Low gas efficiency. Consider optimizing transaction parameters.</span>
                </div>
              </div>
            )}
            
            {metrics.errorRate <= 5 && metrics.networkLatency <= 100 && metrics.gasEfficiency >= 80 && (
              <div className="p-3 bg-green-900/20 border border-green-800/30 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-green-300">Excellent performance! All metrics are within optimal ranges.</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
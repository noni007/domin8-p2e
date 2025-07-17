import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock,
  Eye,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  type: 'wallet_connect' | 'wallet_disconnect' | 'transaction' | 'failed_auth' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  user_id?: string;
  metadata?: any;
}

interface SecurityMetrics {
  totalWallets: number;
  activeConnections: number;
  suspiciousActivities: number;
  failedTransactions: number;
  riskScore: number;
}

export const Web3SecurityMonitor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalWallets: 0,
    activeConnections: 0,
    suspiciousActivities: 0,
    failedTransactions: 0,
    riskScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSecurityData();
      startMonitoring();
    }
  }, [user]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet connections
      const { data: wallets } = await supabase
        .from('user_web3_wallets')
        .select('*')
        .eq('user_id', user?.id);

      // Fetch crypto transactions
      const { data: transactions } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Calculate metrics
      const activeConnections = wallets?.filter(w => w.is_active).length || 0;
      const failedTransactions = transactions?.filter(t => t.status === 'failed').length || 0;
      const suspiciousActivities = detectSuspiciousActivities(transactions || []);
      const riskScore = calculateRiskScore(wallets || [], transactions || []);

      setMetrics({
        totalWallets: wallets?.length || 0,
        activeConnections,
        suspiciousActivities,
        failedTransactions,
        riskScore
      });

      // Generate security events
      const securityEvents = generateSecurityEvents(wallets || [], transactions || []);
      setEvents(securityEvents);

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const detectSuspiciousActivities = (transactions: any[]) => {
    let suspicious = 0;
    
    // Check for rapid transactions
    const recentTransactions = transactions.filter(t => 
      Date.now() - new Date(t.created_at).getTime() < 5 * 60 * 1000
    );
    
    if (recentTransactions.length > 10) suspicious++;
    
    // Check for unusual amounts
    const amounts = transactions.map(t => parseFloat(t.amount_formatted));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const unusualAmounts = amounts.filter(a => a > avgAmount * 10);
    
    if (unusualAmounts.length > 0) suspicious++;
    
    return suspicious;
  };

  const calculateRiskScore = (wallets: any[], transactions: any[]) => {
    let score = 0;
    
    // Base score from wallet connections
    score += wallets.length * 10;
    
    // Failed transactions increase risk
    const failedTx = transactions.filter(t => t.status === 'failed').length;
    score += failedTx * 5;
    
    // Recent activity increases risk
    const recentTx = transactions.filter(t => 
      Date.now() - new Date(t.created_at).getTime() < 24 * 60 * 60 * 1000
    ).length;
    score += recentTx * 2;
    
    return Math.min(score, 100);
  };

  const generateSecurityEvents = (wallets: any[], transactions: any[]): SecurityEvent[] => {
    const events: SecurityEvent[] = [];
    
    // Add wallet connection events
    wallets.forEach(wallet => {
      events.push({
        id: wallet.id,
        type: 'wallet_connect',
        severity: 'low',
        description: `Wallet connected: ${wallet.wallet_address.substring(0, 6)}...${wallet.wallet_address.substring(-4)}`,
        timestamp: wallet.connected_at,
        user_id: wallet.user_id,
        metadata: { wallet_type: wallet.wallet_type }
      });
    });
    
    // Add transaction events
    transactions.slice(0, 10).forEach(tx => {
      events.push({
        id: tx.id,
        type: 'transaction',
        severity: tx.status === 'failed' ? 'medium' : 'low',
        description: `${tx.transaction_type} transaction: ${tx.amount_formatted} ${tx.token_symbol}`,
        timestamp: tx.created_at,
        user_id: tx.user_id,
        metadata: { status: tx.status, hash: tx.transaction_hash }
      });
    });
    
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const startMonitoring = () => {
    setMonitoring(true);
    
    // Set up real-time monitoring
    const channel = supabase
      .channel('security-monitor')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'crypto_transactions',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        fetchSecurityData();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      setMonitoring(false);
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'high': return 'bg-orange-600';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 20) return 'text-green-400';
    if (score < 50) return 'text-yellow-400';
    if (score < 80) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-300">Loading security monitor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Status */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-400" />
            Security Status
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={monitoring ? 'bg-green-600' : 'bg-gray-600'}>
              <Eye className="h-3 w-3 mr-1" />
              {monitoring ? 'Monitoring' : 'Offline'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSecurityData}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{metrics.totalWallets}</div>
              <div className="text-sm text-gray-400">Total Wallets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{metrics.activeConnections}</div>
              <div className="text-sm text-gray-400">Active Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{metrics.suspiciousActivities}</div>
              <div className="text-sm text-gray-400">Suspicious Activities</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRiskColor(metrics.riskScore)}`}>
                {metrics.riskScore}%
              </div>
              <div className="text-sm text-gray-400">Risk Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      {metrics.riskScore > 70 && (
        <Alert className="border-red-800/30 bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            High risk activity detected. Please review your recent transactions and wallet connections.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Events */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2 text-blue-400" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                No security events recorded
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {event.description}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {event.type === 'wallet_connect' && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    {event.type === 'transaction' && event.metadata?.status === 'failed' && (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
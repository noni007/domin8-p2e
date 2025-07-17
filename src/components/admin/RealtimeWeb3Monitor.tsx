import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface RealtimeTransaction {
  id: string;
  user_id: string;
  transaction_hash: string;
  transaction_type: string;
  amount_formatted: number;
  token_symbol: string;
  status: string;
  created_at: string;
  confirmed_at?: string;
  block_number?: number;
  gas_used?: number;
  network_id: number;
  wallet_address: string;
  metadata?: any;
}

interface NetworkStats {
  pending: number;
  confirmed: number;
  failed: number;
  totalVolume: number;
}

export const RealtimeWeb3Monitor = () => {
  const [transactions, setTransactions] = useState<RealtimeTransaction[]>([]);
  const [stats, setStats] = useState<NetworkStats>({
    pending: 0,
    confirmed: 0,
    failed: 0,
    totalVolume: 0
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchTransactions, 10000); // Refresh every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel('crypto_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crypto_transactions'
        },
        (payload) => {
          console.log('Real-time transaction update:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setTransactions(prev => [payload.new, ...prev].slice(0, 50));
      toast({
        title: "New Transaction",
        description: `${payload.new.transaction_type} transaction detected`
      });
    } else if (payload.eventType === 'UPDATE') {
      setTransactions(prev => prev.map(tx => 
        tx.id === payload.new.id ? payload.new : tx
      ));
      
      if (payload.old.status !== payload.new.status) {
        toast({
          title: "Transaction Updated",
          description: `Transaction ${payload.new.status}`,
          variant: payload.new.status === 'confirmed' ? 'default' : 
                   payload.new.status === 'failed' ? 'destructive' : 'default'
        });
      }
    }
    
    updateStats();
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setTransactions(data || []);
      updateStats(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (txData?: RealtimeTransaction[]) => {
    const data = txData || transactions;
    
    const pending = data.filter(tx => tx.status === 'pending').length;
    const confirmed = data.filter(tx => tx.status === 'confirmed').length;
    const failed = data.filter(tx => tx.status === 'failed').length;
    const totalVolume = data
      .filter(tx => tx.status === 'confirmed')
      .reduce((sum, tx) => sum + tx.amount_formatted, 0);

    setStats({ pending, confirmed, failed, totalVolume });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  const retryTransaction = async (transactionId: string) => {
    try {
      // In a real implementation, this would retry the transaction
      toast({
        title: "Retry Initiated",
        description: "Transaction retry has been initiated"
      });
    } catch (error) {
      console.error('Error retrying transaction:', error);
      toast({
        title: "Retry Failed",
        description: "Failed to retry transaction",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-time Web3 Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-xl font-bold">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-xl font-bold">{stats.totalVolume.toFixed(2)} MATIC</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Monitor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Real-time Transaction Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button size="sm" onClick={fetchTransactions}>
                Refresh Now
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No Web3 transactions found
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map((tx) => (
                <div key={tx.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tx.status)}
                      <span className="font-medium">{tx.transaction_type.replace('_', ' ')}</span>
                      <Badge className={`${getStatusColor(tx.status)} text-white`}>
                        {tx.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <div className="font-semibold">{tx.amount_formatted} {tx.token_symbol}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Network:</span>
                      <div>{getNetworkName(tx.network_id)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gas Used:</span>
                      <div>{tx.gas_used ? tx.gas_used.toLocaleString() : 'Pending'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Block:</span>
                      <div>{tx.block_number || 'Pending'}</div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Hash:</span>
                    <div className="font-mono text-xs break-all">{tx.transaction_hash}</div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://polygonscan.com/tx/${tx.transaction_hash}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on Explorer
                    </Button>
                    
                    {tx.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryTransaction(tx.id)}
                      >
                        Retry Transaction
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ExternalLink, 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useCryptoTransactions } from '@/hooks/useCryptoTransactions';
import { useAuth } from '@/hooks/useAuth';
import { NETWORKS } from '@/lib/web3/config';
import { formatDistanceToNow } from 'date-fns';

interface CryptoTransaction {
  id: string;
  transaction_hash: string;
  transaction_type: string;
  amount_formatted: number;
  token_symbol: string;
  status: string;
  network_id: number;
  created_at: string;
  confirmed_at?: string;
  metadata?: any;
}

export const CryptoTransactionHistory: React.FC = () => {
  const { user } = useAuth();
  const { getUserTransactions } = useCryptoTransactions();
  
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userTransactions = await getUserTransactions();
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Failed to fetch crypto transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.transaction_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.transaction_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.token_symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.transaction_type === typeFilter);
    }

    setFilteredTransactions(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type.includes('deposit') || type.includes('received') 
      ? <ArrowDownLeft className="h-4 w-4 text-green-500" />
      : <ArrowUpRight className="h-4 w-4 text-red-500" />;
  };

  const getExplorerUrl = (hash: string, networkId: number) => {
    const network = networkId === 137 ? NETWORKS.POLYGON_MAINNET : NETWORKS.POLYGON_MUMBAI;
    return `${network.blockExplorer}/tx/${hash}`;
  };

  const formatTransactionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crypto Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Crypto Transaction History
          <Badge variant="secondary">{filteredTransactions.length} transactions</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tournament_entry">Tournament Entry</SelectItem>
              <SelectItem value="prize_payout">Prize Payout</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {transactions.length === 0 
              ? "No crypto transactions found"
              : "No transactions match your filters"
            }
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.transaction_type)}
                        <span className="text-sm">
                          {formatTransactionType(tx.transaction_type)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm font-medium">
                        {tx.amount_formatted} {tx.token_symbol}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <Badge
                          variant={
                            tx.status === 'confirmed' ? 'default' :
                            tx.status === 'pending' ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                    </TableCell>
                    
                    <TableCell className="font-mono text-xs">
                      {tx.transaction_hash.slice(0, 8)}...{tx.transaction_hash.slice(-6)}
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getExplorerUrl(tx.transaction_hash, tx.network_id), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
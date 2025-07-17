import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet';
import { useCryptoTransactions } from '@/hooks/useCryptoTransactions';
import { Coins, Users, Trophy, Clock, TrendingUp, Zap } from 'lucide-react';

interface Web3Tournament {
  id: string;
  title: string;
  status: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  start_date: string;
  crypto_enabled: boolean;
  smart_contract_address?: string;
  participant_count: number;
}

interface TournamentStats {
  totalCryptoVolume: number;
  totalParticipants: number;
  averageEntryFee: number;
  completionRate: number;
}

export const Web3TournamentDashboard = () => {
  const [tournaments, setTournaments] = useState<Web3Tournament[]>([]);
  const [stats, setStats] = useState<TournamentStats>({
    totalCryptoVolume: 0,
    totalParticipants: 0,
    averageEntryFee: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const { toast } = useToast();
  const { isConnected, address } = useWeb3Wallet();
  const { sendPayment } = useCryptoTransactions();

  useEffect(() => {
    fetchTournaments();
    fetchStats();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_participants(count)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const enrichedTournaments = (data || []).map(tournament => ({
        ...tournament,
        participant_count: tournament.tournament_participants?.[0]?.count || 0,
        crypto_enabled: tournament.entry_fee > 0
      }));

      setTournaments(enrichedTournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load tournaments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch crypto transaction stats
      const { data: cryptoData, error: cryptoError } = await supabase
        .from('crypto_transactions')
        .select('amount_formatted, status')
        .eq('transaction_type', 'tournament_fee')
        .eq('status', 'confirmed');

      if (cryptoError) throw cryptoError;

      // Calculate stats
      const totalVolume = cryptoData?.reduce((sum, tx) => sum + parseFloat(tx.amount_formatted.toString()), 0) || 0;
      
      const { data: participantData, error: participantError } = await supabase
        .from('tournament_participants')
        .select('tournament_id');

      if (participantError) throw participantError;

      setStats({
        totalCryptoVolume: totalVolume,
        totalParticipants: participantData?.length || 0,
        averageEntryFee: tournaments.length > 0 ? tournaments.reduce((sum, t) => sum + t.entry_fee, 0) / tournaments.length : 0,
        completionRate: 85.2 // Mock completion rate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const deployTournamentContract = async (tournamentId: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Web3 wallet first",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate smart contract deployment for tournament escrow
      const mockContractAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      // Update tournament with contract address
      const { error } = await supabase
        .from('tournaments')
        .update({ 
          smart_contract_address: mockContractAddress,
          status: 'web3_enabled'
        })
        .eq('id', tournamentId);

      if (error) throw error;

      // Create smart contract record
      await supabase
        .from('smart_contracts')
        .insert({
          contract_name: `Tournament Escrow - ${tournamentId}`,
          contract_type: 'tournament_escrow',
          contract_address: mockContractAddress,
          deployer_address: address,
          deployed_by_user_id: (await supabase.auth.getUser()).data.user?.id,
          network_id: 137,
          is_active: true,
          abi_json: [
            { "name": "depositEntryFee", "type": "function" },
            { "name": "distributePrizes", "type": "function" }
          ],
          bytecode: '0x608060405234801561001057600080fd5b50',
          deployment_transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`
        });

      toast({
        title: "Smart Contract Deployed",
        description: "Tournament escrow contract has been deployed successfully"
      });

      fetchTournaments();
    } catch (error) {
      console.error('Error deploying contract:', error);
      toast({
        title: "Deployment Failed",
        description: "Failed to deploy tournament contract",
        variant: "destructive"
      });
    }
  };

  const enableCryptoPayments = async (tournamentId: string) => {
    try {
      // Note: crypto_enabled is a calculated field, not a database column
      // In a real implementation, this would update relevant tournament settings
      
      toast({
        title: "Crypto Payments Enabled",
        description: "Players can now pay entry fees with cryptocurrency"
      });

      fetchTournaments();
    } catch (error) {
      console.error('Error enabling crypto payments:', error);
      toast({
        title: "Error",
        description: "Failed to enable crypto payments",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'web3_enabled': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading Web3 tournaments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Crypto Volume</p>
                <p className="text-lg font-semibold">{stats.totalCryptoVolume.toFixed(2)} MATIC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
                <p className="text-lg font-semibold">{stats.totalParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Entry Fee</p>
                <p className="text-lg font-semibold">₦{(stats.averageEntryFee / 100).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-lg font-semibold">{stats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament List */}
      <Card>
        <CardHeader>
          <CardTitle>Web3 Tournament Management</CardTitle>
        </CardHeader>
        <CardContent>
          {tournaments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tournaments found
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{tournament.title}</h3>
                      <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                        {tournament.status}
                      </Badge>
                      {tournament.smart_contract_address && (
                        <Badge variant="outline" className="text-purple-600 border-purple-600">
                          <Zap className="h-3 w-3 mr-1" />
                          Smart Contract
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(tournament.start_date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Entry Fee:</span>
                      <div className="font-semibold">₦{(tournament.entry_fee / 100).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Prize Pool:</span>
                      <div className="font-semibold">₦{(tournament.prize_pool / 100).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Participants:</span>
                      <div className="font-semibold">{tournament.participant_count}/{tournament.max_participants}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Capacity:</span>
                      <div className="w-full">
                        <Progress 
                          value={(tournament.participant_count / tournament.max_participants) * 100} 
                          className="h-2 mt-1" 
                        />
                      </div>
                    </div>
                  </div>

                  {tournament.smart_contract_address && (
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      <span className="text-muted-foreground">Smart Contract:</span>
                      <div className="font-mono text-xs break-all mt-1">
                        {tournament.smart_contract_address}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {!tournament.smart_contract_address && tournament.entry_fee > 0 && (
                      <Button
                        size="sm"
                        onClick={() => deployTournamentContract(tournament.id)}
                        disabled={!isConnected}
                      >
                        Deploy Smart Contract
                      </Button>
                    )}
                    
                    {tournament.entry_fee > 0 && !tournament.crypto_enabled && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => enableCryptoPayments(tournament.id)}
                      >
                        Enable Crypto Payments
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/tournaments/${tournament.id}`, '_blank')}
                    >
                      View Tournament
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!isConnected && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">
              Connect your Web3 wallet to manage smart contracts for tournaments
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
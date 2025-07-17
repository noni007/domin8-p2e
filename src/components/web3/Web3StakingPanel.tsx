import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet';
import { useCryptoTransactions } from '@/hooks/useCryptoTransactions';
import { Coins, TrendingUp, Clock, Award } from 'lucide-react';

interface StakingPool {
  id: string;
  name: string;
  tokenSymbol: string;
  apy: number;
  minStake: number;
  totalStaked: number;
  userStaked: number;
  lockPeriod: number; // in days
  isActive: boolean;
}

const mockStakingPools: StakingPool[] = [
  {
    id: '1',
    name: 'Tournament Rewards Pool',
    tokenSymbol: 'MATIC',
    apy: 12.5,
    minStake: 10,
    totalStaked: 50000,
    userStaked: 0,
    lockPeriod: 30,
    isActive: true
  },
  {
    id: '2',
    name: 'Gaming Token Pool',
    tokenSymbol: 'GTK',
    apy: 8.2,
    minStake: 100,
    totalStaked: 25000,
    userStaked: 0,
    lockPeriod: 7,
    isActive: true
  }
];

export const Web3StakingPanel = () => {
  const [stakingPools, setStakingPools] = useState<StakingPool[]>(mockStakingPools);
  const [selectedPool, setSelectedPool] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const { toast } = useToast();
  const { isConnected, address } = useWeb3Wallet();
  const { sendPayment } = useCryptoTransactions();

  const handleStake = async (poolId: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Web3 wallet first",
        variant: "destructive"
      });
      return;
    }

    const pool = stakingPools.find(p => p.id === poolId);
    if (!pool) return;

    const amount = parseFloat(stakeAmount);
    if (amount < pool.minStake) {
      toast({
        title: "Invalid Amount",
        description: `Minimum stake is ${pool.minStake} ${pool.tokenSymbol}`,
        variant: "destructive"
      });
      return;
    }

    setIsStaking(true);

    try {
      const result = await sendPayment({
        amount: stakeAmount,
        token: pool.tokenSymbol,
        purpose: `Staking in ${pool.name}`,
        metadata: {
          poolId,
          stakingAction: 'stake',
          lockPeriod: pool.lockPeriod
        }
      });

      if (result.success) {
        // Update local state
        setStakingPools(pools => pools.map(p => 
          p.id === poolId 
            ? { ...p, userStaked: p.userStaked + amount, totalStaked: p.totalStaked + amount }
            : p
        ));

        toast({
          title: "Staking Successful",
          description: `Successfully staked ${amount} ${pool.tokenSymbol} in ${pool.name}`
        });

        setStakeAmount('');
      } else {
        throw new Error(result.error || 'Staking failed');
      }
    } catch (error) {
      console.error('Staking error:', error);
      toast({
        title: "Staking Failed",
        description: error instanceof Error ? error.message : "Failed to stake tokens",
        variant: "destructive"
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async (poolId: string) => {
    const pool = stakingPools.find(p => p.id === poolId);
    if (!pool || pool.userStaked === 0) return;

    setIsStaking(true);

    try {
      const result = await sendPayment({
        amount: pool.userStaked.toString(),
        token: pool.tokenSymbol,
        purpose: `Unstaking from ${pool.name}`,
        metadata: {
          poolId,
          stakingAction: 'unstake'
        }
      });

      if (result.success) {
        // Update local state
        setStakingPools(pools => pools.map(p => 
          p.id === poolId 
            ? { ...p, userStaked: 0, totalStaked: p.totalStaked - pool.userStaked }
            : p
        ));

        toast({
          title: "Unstaking Successful",
          description: `Successfully unstaked ${pool.userStaked} ${pool.tokenSymbol} from ${pool.name}`
        });
      } else {
        throw new Error(result.error || 'Unstaking failed');
      }
    } catch (error) {
      console.error('Unstaking error:', error);
      toast({
        title: "Unstaking Failed",
        description: error instanceof Error ? error.message : "Failed to unstake tokens",
        variant: "destructive"
      });
    } finally {
      setIsStaking(false);
    }
  };

  const calculateRewards = (pool: StakingPool) => {
    if (pool.userStaked === 0) return 0;
    return (pool.userStaked * pool.apy / 100) / 365; // Daily rewards
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Staked</p>
                <p className="text-lg font-semibold">
                  {stakingPools.reduce((sum, pool) => sum + pool.userStaked, 0).toFixed(2)} MATIC
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Daily Rewards</p>
                <p className="text-lg font-semibold">
                  {stakingPools.reduce((sum, pool) => sum + calculateRewards(pool), 0).toFixed(4)} MATIC
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Pools</p>
                <p className="text-lg font-semibold">
                  {stakingPools.filter(pool => pool.userStaked > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stakingPools.map((pool) => (
        <Card key={pool.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {pool.name}
                <Badge variant={pool.isActive ? "default" : "secondary"}>
                  {pool.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-green-500">{pool.apy}% APY</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Token</p>
                <p className="font-semibold">{pool.tokenSymbol}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Min Stake</p>
                <p className="font-semibold">{pool.minStake} {pool.tokenSymbol}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lock Period</p>
                <p className="font-semibold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {pool.lockPeriod} days
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Your Stake</p>
                <p className="font-semibold">{pool.userStaked} {pool.tokenSymbol}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pool Utilization</span>
                <span>{((pool.totalStaked / 100000) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(pool.totalStaked / 100000) * 100} className="h-2" />
            </div>

            {pool.userStaked > 0 && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Estimated Daily Rewards</p>
                <p className="font-semibold">{calculateRewards(pool).toFixed(4)} {pool.tokenSymbol}</p>
              </div>
            )}

            <div className="flex gap-2">
              {pool.userStaked === 0 ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    type="number"
                    placeholder={`Min ${pool.minStake} ${pool.tokenSymbol}`}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    disabled={!isConnected || !pool.isActive}
                  />
                  <Button
                    onClick={() => handleStake(pool.id)}
                    disabled={!isConnected || isStaking || !pool.isActive || !stakeAmount}
                  >
                    {isStaking ? 'Staking...' : 'Stake'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleUnstake(pool.id)}
                  disabled={!isConnected || isStaking}
                >
                  {isStaking ? 'Unstaking...' : 'Unstake All'}
                </Button>
              )}
            </div>

            {!isConnected && (
              <p className="text-sm text-muted-foreground">
                Connect your Web3 wallet to participate in staking
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Gift, 
  Crown,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Award
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NFTReward {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'tournament' | 'achievement' | 'milestone' | 'special';
  requirements: {
    type: string;
    target: number;
    current: number;
  };
  unlocked: boolean;
  claimed: boolean;
  claimedAt?: string;
  contractAddress?: string;
  tokenId?: string;
}

interface RewardProgress {
  tournamentsWon: number;
  totalTournaments: number;
  achievementsUnlocked: number;
  walletTransactions: number;
  stakingRewards: number;
}

export const Web3NFTRewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<NFTReward[]>([]);
  const [progress, setProgress] = useState<RewardProgress>({
    tournamentsWon: 0,
    totalTournaments: 0,
    achievementsUnlocked: 0,
    walletTransactions: 0,
    stakingRewards: 0
  });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRewardsData();
    }
  }, [user]);

  const fetchRewardsData = async () => {
    try {
      setLoading(true);
      
      // Fetch user progress
      const userProgress = await calculateUserProgress();
      setProgress(userProgress);
      
      // Generate NFT rewards based on progress
      const nftRewards = generateNFTRewards(userProgress);
      setRewards(nftRewards);
      
    } catch (error) {
      console.error('Error fetching rewards data:', error);
      toast({
        title: "Error",
        description: "Failed to load rewards data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateUserProgress = async (): Promise<RewardProgress> => {
    // Fetch tournament participation
    const { data: tournaments } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('user_id', user?.id);

    const tournamentsWon = tournaments?.filter(t => t.status === 'winner').length || 0;
    const totalTournaments = tournaments?.length || 0;

    // Fetch achievements
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user?.id);

    const achievementsUnlocked = achievements?.length || 0;

    // Fetch wallet transactions
    const { data: transactions } = await supabase
      .from('crypto_transactions')
      .select('*')
      .eq('user_id', user?.id);

    const walletTransactions = transactions?.length || 0;

    return {
      tournamentsWon,
      totalTournaments,
      achievementsUnlocked,
      walletTransactions,
      stakingRewards: Math.floor(Math.random() * 10) // Mock staking rewards
    };
  };

  const generateNFTRewards = (progress: RewardProgress): NFTReward[] => {
    const rewards: NFTReward[] = [
      {
        id: '1',
        name: 'First Victory',
        description: 'Win your first tournament',
        image_url: '/lovable-uploads/trophy-nft.png',
        rarity: 'common',
        category: 'tournament',
        requirements: {
          type: 'tournaments_won',
          target: 1,
          current: progress.tournamentsWon
        },
        unlocked: progress.tournamentsWon >= 1,
        claimed: false
      },
      {
        id: '2',
        name: 'Champion',
        description: 'Win 5 tournaments',
        image_url: '/lovable-uploads/champion-nft.png',
        rarity: 'rare',
        category: 'tournament',
        requirements: {
          type: 'tournaments_won',
          target: 5,
          current: progress.tournamentsWon
        },
        unlocked: progress.tournamentsWon >= 5,
        claimed: false
      },
      {
        id: '3',
        name: 'Legend',
        description: 'Win 10 tournaments',
        image_url: '/lovable-uploads/legend-nft.png',
        rarity: 'legendary',
        category: 'tournament',
        requirements: {
          type: 'tournaments_won',
          target: 10,
          current: progress.tournamentsWon
        },
        unlocked: progress.tournamentsWon >= 10,
        claimed: false
      },
      {
        id: '4',
        name: 'Achievement Hunter',
        description: 'Unlock 5 achievements',
        image_url: '/lovable-uploads/hunter-nft.png',
        rarity: 'uncommon',
        category: 'achievement',
        requirements: {
          type: 'achievements_unlocked',
          target: 5,
          current: progress.achievementsUnlocked
        },
        unlocked: progress.achievementsUnlocked >= 5,
        claimed: false
      },
      {
        id: '5',
        name: 'Web3 Pioneer',
        description: 'Complete 10 wallet transactions',
        image_url: '/lovable-uploads/pioneer-nft.png',
        rarity: 'epic',
        category: 'milestone',
        requirements: {
          type: 'wallet_transactions',
          target: 10,
          current: progress.walletTransactions
        },
        unlocked: progress.walletTransactions >= 10,
        claimed: false
      }
    ];

    return rewards;
  };

  const claimReward = async (rewardId: string) => {
    try {
      setClaiming(rewardId);
      
      // Simulate NFT minting process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update reward as claimed
      setRewards(prev => prev.map(reward => 
        reward.id === rewardId 
          ? { ...reward, claimed: true, claimedAt: new Date().toISOString() }
          : reward
      ));
      
      toast({
        title: "NFT Claimed!",
        description: "Your reward has been minted to your wallet",
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Error",
        description: "Failed to claim reward",
        variant: "destructive"
      });
    } finally {
      setClaiming(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-600';
      case 'uncommon': return 'bg-green-600';
      case 'rare': return 'bg-blue-600';
      case 'epic': return 'bg-purple-600';
      case 'legendary': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="h-4 w-4" />;
      case 'uncommon': return <Award className="h-4 w-4" />;
      case 'rare': return <Trophy className="h-4 w-4" />;
      case 'epic': return <Crown className="h-4 w-4" />;
      case 'legendary': return <Sparkles className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-300">Loading NFT rewards...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2 text-blue-400" />
            Reward Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{progress.tournamentsWon}</div>
              <div className="text-sm text-gray-400">Tournaments Won</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{progress.achievementsUnlocked}</div>
              <div className="text-sm text-gray-400">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{progress.walletTransactions}</div>
              <div className="text-sm text-gray-400">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{progress.stakingRewards}</div>
              <div className="text-sm text-gray-400">Staking Rewards</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFT Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <Card key={reward.id} className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className={`${getRarityColor(reward.rarity)} text-white`}>
                  {getRarityIcon(reward.rarity)}
                  <span className="ml-1 capitalize">{reward.rarity}</span>
                </Badge>
                <Badge variant="outline" className="text-gray-300">
                  {reward.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* NFT Image Placeholder */}
              <div className="aspect-square bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg flex items-center justify-center">
                <div className="text-6xl">
                  {reward.claimed ? '🏆' : reward.unlocked ? '🎁' : '🔒'}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-white">{reward.name}</h3>
                <p className="text-sm text-gray-400">{reward.description}</p>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">
                    {reward.requirements.current}/{reward.requirements.target}
                  </span>
                </div>
                <Progress 
                  value={(reward.requirements.current / reward.requirements.target) * 100} 
                  className="h-2"
                />
              </div>
              
              {/* Action Button */}
              <div className="pt-2">
                {reward.claimed ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`https://opensea.io/assets/${reward.contractAddress}/${reward.tokenId}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on OpenSea
                  </Button>
                ) : reward.unlocked ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => claimReward(reward.id)}
                    disabled={claiming === reward.id}
                  >
                    {claiming === reward.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Minting...
                      </>
                    ) : (
                      <>
                        <Gift className="h-4 w-4 mr-2" />
                        Claim NFT
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    disabled
                  >
                    <span className="text-gray-500">Locked</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Claimed Rewards */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-blue-400" />
            Claimed Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rewards.filter(r => r.claimed).length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                No rewards claimed yet
              </div>
            ) : (
              rewards.filter(r => r.claimed).map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <div className="font-medium text-white">{reward.name}</div>
                      <div className="text-sm text-gray-400">
                        Claimed on {new Date(reward.claimedAt!).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getRarityColor(reward.rarity)} text-white`}>
                    {getRarityIcon(reward.rarity)}
                    <span className="ml-1 capitalize">{reward.rarity}</span>
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
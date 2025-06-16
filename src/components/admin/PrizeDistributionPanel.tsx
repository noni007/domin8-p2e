
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePrizeDistribution } from "@/hooks/usePrizeDistribution";
import { useTournaments } from "@/hooks/useTournaments";
import { Trophy, DollarSign, Percent, Loader2 } from "lucide-react";

export const PrizeDistributionPanel = () => {
  const { tournaments } = useTournaments();
  const { distributePrizes, distributing, getPlatformCommission } = usePrizeDistribution();
  const [commissionRate, setCommissionRate] = useState<number | null>(null);

  const completedTournaments = tournaments.filter(t => t.status === 'completed');

  const handleDistributePrizes = async (tournamentId: string) => {
    await distributePrizes(tournamentId);
  };

  const loadCommissionRate = async () => {
    const rate = await getPlatformCommission();
    setCommissionRate(rate);
  };

  // Load commission rate on mount
  useState(() => {
    loadCommissionRate();
  });

  const calculateCommission = (prizePool: number) => {
    if (!commissionRate) return 0;
    return Math.round(prizePool * commissionRate);
  };

  const calculateWinnerPrize = (prizePool: number) => {
    return prizePool - calculateCommission(prizePool);
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
          Prize Distribution Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {commissionRate && (
          <div className="flex items-center justify-between p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <div className="flex items-center space-x-2">
              <Percent className="h-5 w-5 text-blue-400" />
              <span className="text-blue-400 font-medium">Platform Commission</span>
            </div>
            <Badge className="bg-blue-600 text-white">
              {(commissionRate * 100).toFixed(1)}%
            </Badge>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-white font-semibold">Completed Tournaments</h3>
          {completedTournaments.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No completed tournaments requiring prize distribution
            </p>
          ) : (
            completedTournaments.map((tournament) => {
              const commission = calculateCommission(tournament.prize_pool);
              const winnerPrize = calculateWinnerPrize(tournament.prize_pool);
              
              return (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-gray-600/30"
                >
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{tournament.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>Pool: ${(tournament.prize_pool / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Trophy className="h-3 w-3 text-yellow-400" />
                        <span>Winner: ${(winnerPrize / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Percent className="h-3 w-3 text-blue-400" />
                        <span>Commission: ${(commission / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleDistributePrizes(tournament.id)}
                    disabled={distributing}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {distributing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Distributing...
                      </>
                    ) : (
                      'Distribute Prizes'
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

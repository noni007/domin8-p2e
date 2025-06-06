
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

interface TierData {
  tier: string;
  percentage: number;
  playerCount: number;
  color: string;
}

const tierData: TierData[] = [
  { tier: "Master", percentage: 3, playerCount: 127, color: "from-purple-600 to-pink-600" },
  { tier: "Diamond", percentage: 12, playerCount: 1248, color: "from-blue-400 to-cyan-400" },
  { tier: "Platinum", percentage: 22, playerCount: 2284, color: "from-teal-400 to-green-400" },
  { tier: "Gold", percentage: 35, playerCount: 3640, color: "from-yellow-500 to-orange-500" },
  { tier: "Silver", percentage: 20, playerCount: 2080, color: "from-gray-400 to-gray-500" },
  { tier: "Bronze", percentage: 8, playerCount: 832, color: "from-orange-600 to-red-600" }
];

export const TierDistribution = () => {
  const totalPlayers = tierData.reduce((sum, tier) => sum + tier.playerCount, 0);

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-400" />
          Tier Distribution
          <Badge variant="outline" className="border-gray-600 text-gray-300">
            {totalPlayers.toLocaleString()} Players
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tierData.map((tier) => (
            <div key={tier.tier} className="space-y-3">
              <div className="flex justify-between items-center">
                <Badge className={`bg-gradient-to-r ${tier.color} text-white`}>
                  {tier.tier}
                </Badge>
                <span className="text-white font-semibold">{tier.percentage}%</span>
              </div>
              <Progress 
                value={tier.percentage} 
                className="h-3 bg-gray-700"
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{tier.playerCount.toLocaleString()} players</span>
                <span className="text-gray-400">
                  {((tier.playerCount / totalPlayers) * 100).toFixed(1)}% of total
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementCard } from "./AchievementCard";
import { Trophy, Loader2 } from "lucide-react";

export const AchievementsPanel = () => {
  const { achievements, userAchievements, loading } = useAchievements();

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
          <p className="text-gray-400">Loading achievements...</p>
        </CardContent>
      </Card>
    );
  }

  const unlockedAchievements = userAchievements.map(ua => ua.achievement);
  const lockedAchievements = achievements.filter(
    a => !unlockedAchievements.find(ua => ua.id === a.id)
  );

  const categories = ['all', 'victory', 'participation', 'social', 'performance'];

  const getAchievementsByCategory = (category: string, unlocked: boolean) => {
    const targetAchievements = unlocked ? unlockedAchievements : lockedAchievements;
    if (category === 'all') return targetAchievements;
    return targetAchievements.filter(a => a.category === category);
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Achievements
          </div>
          <Badge className="bg-yellow-600 text-black">
            {unlockedAchievements.length}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unlocked" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unlocked">
              Unlocked ({unlockedAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Locked ({lockedAchievements.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unlocked" className="space-y-4">
            {unlockedAchievements.length > 0 ? (
              <div className="grid gap-4">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No achievements unlocked yet</p>
                <p className="text-gray-500 text-sm">
                  Participate in tournaments to start earning achievements!
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="locked" className="space-y-4">
            {lockedAchievements.length > 0 ? (
              <div className="grid gap-4">
                {lockedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-green-400 mx-auto mb-2" />
                <p className="text-green-400">All achievements unlocked!</p>
                <p className="text-gray-400 text-sm">
                  Congratulations on your amazing progress!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

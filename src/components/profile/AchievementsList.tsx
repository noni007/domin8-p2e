
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAchievements } from "@/hooks/useAchievements";
import { Award, Lock, Loader2 } from "lucide-react";

export const AchievementsList = () => {
  const { achievements, loading } = useAchievements();

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

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-500" />
            Achievements
          </div>
          <Badge className="bg-yellow-600 text-black">
            {unlockedCount}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`flex items-center space-x-3 p-3 rounded-lg ${
              achievement.unlocked
                ? "bg-yellow-600/20 border border-yellow-600/30"
                : "bg-gray-800/20 border border-gray-600/30"
            }`}
          >
            <div className="flex-shrink-0">
              {achievement.unlocked ? (
                <Award className="h-6 w-6 text-yellow-500" />
              ) : (
                <Lock className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold ${
                achievement.unlocked ? "text-yellow-400" : "text-gray-400"
              }`}>
                {achievement.name}
              </h4>
              <p className={`text-sm ${
                achievement.unlocked ? "text-gray-200" : "text-gray-500"
              }`}>
                {achievement.description}
              </p>
            </div>
            {achievement.unlocked && (
              <Badge className="bg-green-600 text-white">
                Unlocked
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

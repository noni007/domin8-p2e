
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, TrendingUp, Calendar, Users, Star, Medal, Target, Zap } from "lucide-react";

export const UserDashboard = () => {
  const { user, profile } = useAuth();

  const playerStats = {
    currentRank: "Gold III",
    aerPoints: 1247,
    tournamentsWon: 3,
    winRate: 68,
    gamesPlayed: 127,
    currentStreak: 5
  };

  const upcomingTournaments = [
    { name: "AER Weekly Championship", date: "Dec 15", prize: "$500", status: "Registered" },
    { name: "EA Sports FC 24 Masters", date: "Dec 20", prize: "$1,000", status: "Open" },
    { name: "Street Fighter 6 Cup", date: "Dec 22", prize: "$750", status: "Open" }
  ];

  const recentMatches = [
    { opponent: "GamerX_ZA", result: "Win", game: "EA FC 24", points: "+25" },
    { opponent: "ProPlayer_NG", result: "Win", game: "Street Fighter 6", points: "+18" },
    { opponent: "EsportsKing", result: "Loss", game: "EA FC 24", points: "-12" },
    { opponent: "AfricaChamp", result: "Win", game: "Street Fighter 6", points: "+22" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome back, {profile?.username || "Gamer"}!
        </h1>
        <p className="text-gray-300 text-lg">
          Ready to dominate the African esports scene?
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Medal className="h-4 w-4 text-yellow-400" />
              Current Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{playerStats.currentRank}</div>
            <Badge className="mt-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              {playerStats.aerPoints} AER Points
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-blue-400" />
              Tournaments Won
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{playerStats.tournamentsWon}</div>
            <p className="text-xs text-gray-400 mt-1">+1 this month</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Target className="h-4 w-4 text-green-400" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{playerStats.winRate}%</div>
            <p className="text-xs text-gray-400 mt-1">{playerStats.gamesPlayed} games played</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{playerStats.currentStreak}</div>
            <p className="text-xs text-gray-400 mt-1">wins in a row</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tournaments */}
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Upcoming Tournaments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTournaments.map((tournament, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{tournament.name}</h4>
                    <p className="text-sm text-gray-400">{tournament.date} • {tournament.prize}</p>
                  </div>
                  <Badge variant={tournament.status === "Registered" ? "default" : "outline"}>
                    {tournament.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              onClick={() => window.location.href = '/tournaments'}
            >
              View All Tournaments
            </Button>
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Recent Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMatches.map((match, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">vs {match.opponent}</h4>
                    <p className="text-sm text-gray-400">{match.game}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={match.result === "Win" ? "default" : "destructive"}>
                      {match.result}
                    </Badge>
                    <p className={`text-sm mt-1 ${match.result === "Win" ? "text-green-400" : "text-red-400"}`}>
                      {match.points}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={() => window.location.href = '/rankings'}
            >
              View Full History
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-16 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              onClick={() => window.location.href = '/tournaments'}
            >
              <div className="flex flex-col items-center">
                <Trophy className="h-6 w-6 mb-1" />
                Join Tournament
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              onClick={() => window.location.href = '/rankings'}
            >
              <div className="flex flex-col items-center">
                <Star className="h-6 w-6 mb-1" />
                Check Rankings
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black"
              onClick={() => window.location.href = '/profile'}
            >
              <div className="flex flex-col items-center">
                <Users className="h-6 w-6 mb-1" />
                Edit Profile
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

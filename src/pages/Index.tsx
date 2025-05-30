
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad, Trophy, Users, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("rankings");

  const topPlayers = [
    { rank: 1, name: "ShadowStrike", score: 2850, earnings: "$12,450", game: "Valorant" },
    { rank: 2, name: "CyberNinja", score: 2780, earnings: "$9,200", game: "CS2" },
    { rank: 3, name: "QuantumAce", score: 2720, earnings: "$8,100", game: "League" },
    { rank: 4, name: "NeonFury", score: 2680, earnings: "$7,500", game: "Valorant" },
    { rank: 5, name: "VoidHunter", score: 2640, earnings: "$6,900", game: "Apex" },
  ];

  const tournaments = [
    { name: "Summer Championship", prize: "$50,000", date: "Jul 15-20", status: "Live" },
    { name: "Winter Series", prize: "$25,000", date: "Aug 1-5", status: "Upcoming" },
    { name: "Pro League Finals", prize: "$100,000", date: "Aug 20-25", status: "Registration" },
  ];

  const earnOpportunities = [
    { title: "Daily Challenges", reward: "50-200 tokens", difficulty: "Easy" },
    { title: "Ranked Matches", reward: "100-500 tokens", difficulty: "Medium" },
    { title: "Tournament Entry", reward: "1000+ tokens", difficulty: "Hard" },
  ];

  const handleJoinTournament = (tournamentName: string) => {
    toast({
      title: "Tournament Registration",
      description: `Successfully registered for ${tournamentName}!`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Gamepad className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                RankArena
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => setSelectedTab("rankings")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedTab === "rankings"
                    ? "text-purple-400 border-b-2 border-purple-400"
                    : "text-gray-300 hover:text-purple-400"
                }`}
              >
                Rankings
              </button>
              <button
                onClick={() => setSelectedTab("tournaments")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedTab === "tournaments"
                    ? "text-purple-400 border-b-2 border-purple-400"
                    : "text-gray-300 hover:text-purple-400"
                }`}
              >
                Tournaments
              </button>
              <button
                onClick={() => setSelectedTab("earn")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedTab === "earn"
                    ? "text-purple-400 border-b-2 border-purple-400"
                    : "text-gray-300 hover:text-purple-400"
                }`}
              >
                Play to Earn
              </button>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold">
              Join Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Compete. Rank. Earn.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join the ultimate esports community where skill meets rewards. Rise through the ranks and earn real money playing your favorite games.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold px-8 py-3 text-lg">
              Start Playing
            </Button>
            <Button size="lg" variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black px-8 py-3 text-lg">
              View Rankings
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Rankings Tab */}
        {selectedTab === "rankings" && (
          <div className="space-y-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Top Players</h2>
              <p className="text-gray-400 text-lg">See where you stand among the elite</p>
            </div>
            
            <div className="grid gap-4">
              {topPlayers.map((player, index) => (
                <Card key={player.rank} className="bg-black/40 border-purple-800/30 backdrop-blur-sm hover:border-purple-600/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black" :
                          index === 1 ? "bg-gradient-to-r from-gray-300 to-gray-500 text-black" :
                          index === 2 ? "bg-gradient-to-r from-orange-400 to-orange-600 text-black" :
                          "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                        }`}>
                          {player.rank}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{player.name}</h3>
                          <Badge variant="secondary" className="bg-purple-900/50 text-purple-200">
                            {player.game}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-cyan-400">{player.score}</div>
                        <div className="text-green-400 font-semibold">{player.earnings}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tournaments Tab */}
        {selectedTab === "tournaments" && (
          <div className="space-y-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Tournaments</h2>
              <p className="text-gray-400 text-lg">Compete in high-stakes tournaments</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament, index) => (
                <Card key={index} className="bg-black/40 border-purple-800/30 backdrop-blur-sm hover:border-purple-600/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      {tournament.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {tournament.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-3xl font-bold text-green-400">{tournament.prize}</div>
                      <Badge 
                        className={`${
                          tournament.status === "Live" ? "bg-red-600 text-white" :
                          tournament.status === "Upcoming" ? "bg-blue-600 text-white" :
                          "bg-green-600 text-white"
                        }`}
                      >
                        {tournament.status}
                      </Badge>
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                        onClick={() => handleJoinTournament(tournament.name)}
                      >
                        {tournament.status === "Live" ? "Watch Live" : tournament.status === "Upcoming" ? "Set Reminder" : "Register Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Play to Earn Tab */}
        {selectedTab === "earn" && (
          <div className="space-y-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Play to Earn</h2>
              <p className="text-gray-400 text-lg">Turn your gaming skills into real rewards</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {earnOpportunities.map((opportunity, index) => (
                <Card key={index} className="bg-black/40 border-purple-800/30 backdrop-blur-sm hover:border-purple-600/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400" />
                      {opportunity.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-2xl font-bold text-green-400">{opportunity.reward}</div>
                      <Badge 
                        className={`${
                          opportunity.difficulty === "Easy" ? "bg-green-600 text-white" :
                          opportunity.difficulty === "Medium" ? "bg-yellow-600 text-white" :
                          "bg-red-600 text-white"
                        }`}
                      >
                        {opportunity.difficulty}
                      </Badge>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                        Start Earning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-purple-600/50 backdrop-blur-sm mt-12">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">1. Join</h3>
                    <p className="text-gray-400">Create your account and start playing ranked matches</p>
                  </div>
                  <div>
                    <Gamepad className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">2. Play</h3>
                    <p className="text-gray-400">Complete challenges and climb the rankings</p>
                  </div>
                  <div>
                    <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">3. Earn</h3>
                    <p className="text-gray-400">Convert your tokens to real cash rewards</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-purple-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Gamepad className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  RankArena
                </span>
              </div>
              <p className="text-gray-400">The ultimate esports community for competitive gaming and earning rewards.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Player Rankings</li>
                <li>Tournaments</li>
                <li>Play to Earn</li>
                <li>Community</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Games</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Valorant</li>
                <li>CS2</li>
                <li>League of Legends</li>
                <li>Apex Legends</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Discord</li>
                <li>Twitter</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-800/30 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RankArena. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

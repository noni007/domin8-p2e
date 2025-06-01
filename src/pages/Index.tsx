import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad, Trophy, Users, Star, Infinity } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("rankings");

  const topPlayers = [
    { rank: 1, name: "ShadowStrike", score: 2850, earnings: "$12,450", game: "Valorant" },
    { rank: 2, name: "CyberNinja", score: 2780, earnings: "$9,200", game: "CS2" },
    { rank: 3, name: "QuantumAce", score: 2720, earnings: "$8,100", game: "League" },
    { rank: 4, name: "NeonFury", score: 2680, earnings: "$7,500", game: "Valorant" },
    { rank: 5, name: "IRQHandler", score: 2640, earnings: "$6,900", game: "Apex" },
  ];

  const tournaments = [
    { name: "Summer Championship", prize: "$50,000", date: "Jul 15-20", status: "Live" },
    { name: "Winter Series", prize: "$25,000", date: "Aug 1-5", status: "Upcoming" },
    { name: "Pro League Finals", prize: "$100,000", date: "Aug 20-25", status: "Registration" },
  ];

  const earnOpportunities = [
    { title: "Diverse Challenges", reward: "Transform gameplay", difficulty: "All Levels", description: "Gaming adventures without constraints" },
    { title: "Compete and Win", reward: "Face opponents", difficulty: "Competitive", description: "Win prizes through skill-based competition" },
    { title: "Challenge Opponents", reward: "Friendly competition", difficulty: "Social", description: "Fair matchmaking and transparent gameplay" },
  ];

  const handleJoinTournament = (tournamentName: string) => {
    toast({
      title: "Tournament Registration",
      description: `Successfully registered for ${tournamentName}!`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-blue-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Infinity className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Domin8
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => setSelectedTab("rankings")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedTab === "rankings"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-300 hover:text-blue-400"
                }`}
              >
                Rankings
              </button>
              <button
                onClick={() => setSelectedTab("tournaments")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedTab === "tournaments"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-300 hover:text-blue-400"
                }`}
              >
                Tournaments
              </button>
              <button
                onClick={() => setSelectedTab("challenges")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedTab === "challenges"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-300 hover:text-blue-400"
                }`}
              >
                Challenges
              </button>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold">
              Join Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-teal-600/20 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-teal-200 bg-clip-text text-transparent">
            Welcome to the future of gaming
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your gameplay into cash wins. Join Africa's premier esports community where skill meets rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold px-8 py-3 text-lg">
              Start Playing
            </Button>
            <Button size="lg" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black px-8 py-3 text-lg">
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
              <p className="text-gray-400 text-lg">See where you stand among Africa's elite gamers</p>
            </div>
            
            <div className="grid gap-4">
              {topPlayers.map((player, index) => (
                <Card key={player.rank} className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black" :
                          index === 1 ? "bg-gradient-to-r from-gray-300 to-gray-500 text-black" :
                          index === 2 ? "bg-gradient-to-r from-orange-400 to-orange-600 text-black" :
                          "bg-gradient-to-r from-blue-600 to-teal-600 text-white"
                        }`}>
                          {player.rank}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{player.name}</h3>
                          <Badge variant="secondary" className="bg-blue-900/50 text-blue-200">
                            {player.game}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-400">{player.score}</div>
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
                <Card key={index} className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-300">
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
                        className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
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

        {/* Challenges Tab */}
        {selectedTab === "challenges" && (
          <div className="space-y-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Transform Your Skills into Winnings</h2>
              <p className="text-gray-400 text-lg">Gaming adventures without constraints - compete and win</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {earnOpportunities.map((opportunity, index) => (
                <Card key={index} className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400" />
                      {opportunity.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {opportunity.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-lg font-bold text-teal-400">{opportunity.reward}</div>
                      <Badge 
                        className={`${
                          opportunity.difficulty === "All Levels" ? "bg-green-600 text-white" :
                          opportunity.difficulty === "Competitive" ? "bg-blue-600 text-white" :
                          "bg-teal-600 text-white"
                        }`}
                      >
                        {opportunity.difficulty}
                      </Badge>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                        Start Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-gradient-to-r from-blue-900/30 to-teal-900/30 border-blue-600/50 backdrop-blur-sm mt-12">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">How Domin8 Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">1. Join</h3>
                    <p className="text-gray-400">Create your account and connect with Africa's gaming community</p>
                  </div>
                  <div>
                    <Gamepad className="h-12 w-12 text-teal-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">2. Play</h3>
                    <p className="text-gray-400">Challenge opponents with fair matchmaking and transparent gameplay</p>
                  </div>
                  <div>
                    <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">3. Earn</h3>
                    <p className="text-gray-400">Transform your skills into real cash winnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-blue-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Infinity className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Domin8
                </span>
              </div>
              <p className="text-gray-400">Africa's premier esports community for competitive gaming and earning rewards.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Player Rankings</li>
                <li>Tournaments</li>
                <li>Challenge System</li>
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
              <h3 className="text-white font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Discord</li>
                <li>WhatsApp</li>
                <li>Instagram</li>
                <li>Twitter</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800/30 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Domin8. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

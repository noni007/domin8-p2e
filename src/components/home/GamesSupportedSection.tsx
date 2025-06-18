
import { Gamepad2 } from "lucide-react";

export const GamesSupportedSection = () => {
  const games = [
    {
      name: "FC24",
      category: "Sports",
      players: "12K+ Players",
      image: "https://images.unsplash.com/photo-1574435493412-e99c977e37e2?w=300&h=200&fit=crop",
      fallback: "/placeholder.svg"
    },
    {
      name: "Mortal Kombat",
      category: "Fighting",
      players: "8K+ Players",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop",
      fallback: "/placeholder.svg"
    },
    {
      name: "Call of Duty",
      category: "FPS",
      players: "15K+ Players",
      image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=300&h=200&fit=crop",
      fallback: "/placeholder.svg"
    },
    {
      name: "Street Fighter 6",
      category: "Fighting",
      players: "6K+ Players",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop",
      fallback: "/placeholder.svg"
    },
    {
      name: "TEKKEN 8",
      category: "Fighting",
      players: "7K+ Players",
      image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=200&fit=crop",
      fallback: "/placeholder.svg"
    },
    {
      name: "eFootball",
      category: "Sports",
      players: "9K+ Players",
      image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=300&h=200&fit=crop",
      fallback: "/placeholder.svg"
    }
  ];

  const upcomingGames = [
    { name: "Valorant", logo: "🎯" },
    { name: "League of Legends", logo: "⚔️" },
    { name: "Rocket League", logo: "🚀" }
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900/50 to-blue-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Supported Games
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Compete in the most popular esports titles across multiple genres, from fighting games to sports simulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <div key={index} className="group relative overflow-hidden rounded-xl bg-black/40 border border-blue-800/30 backdrop-blur-sm transition-all duration-300 hover:border-blue-600/50 hover:bg-black/60 hover-lift">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = game.fallback;
                  }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-white">{game.name}</h3>
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full animate-pulse">{game.category}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  <span className="text-sm">{game.players}</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-white mb-6 animate-fade-in-up">More games coming soon...</h3>
          <div className="flex justify-center flex-wrap gap-6">
            {upcomingGames.map((game, index) => (
              <div 
                key={index} 
                className="group flex flex-col items-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-gray-300 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/50 hover:bg-gradient-to-br hover:from-blue-900/30 hover:to-gray-900/50 transition-all duration-300 hover-lift min-w-[140px]"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {game.logo}
                </div>
                <span className="text-sm font-medium group-hover:text-blue-300 transition-colors duration-300">
                  {game.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

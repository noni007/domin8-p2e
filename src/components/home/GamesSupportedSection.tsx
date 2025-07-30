import { Gamepad2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useMobileInteractions } from "@/hooks/useMobileInteractions";

export const GamesSupportedSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { createTouchHandler } = useMobileInteractions();
  const games = [
    {
      name: "FC24",
      category: "Sports",
      players: "12K+ Players",
      image: "/lovable-uploads/4e0bfce4-e817-4880-ab58-437d5df53413.png",
      fallback: "/placeholder.svg"
    },
    {
      name: "Street Fighter 6",
      category: "Fighting",
      players: "6K+ Players",
      image: "/lovable-uploads/7c6c85c3-2e4c-4099-8ff7-2ca3c889de42.png",
      fallback: "/placeholder.svg"
    },
    {
      name: "Call of Duty Mobile",
      category: "FPS",
      players: "15K+ Players",
      image: "/lovable-uploads/79b0e7fe-e5f6-48d3-8dc5-8105843cba51.png",
      fallback: "/placeholder.svg"
    },
    {
      name: "eFootball 2025",
      category: "Sports",
      players: "9K+ Players",
      image: "/lovable-uploads/e22c32c8-a3a9-4d3f-95bf-d4344c43c081.png",
      fallback: "/placeholder.svg"
    },
    {
      name: "Free Fire",
      category: "Battle Royale",
      players: "7K+ Players",
      image: "/lovable-uploads/18b0c258-aaec-49e6-bf01-b0a75372ad30.png",
      fallback: "/placeholder.svg"
    },
    {
      name: "VALORANT",
      category: "FPS",
      players: "8K+ Players",
      image: "/lovable-uploads/7ccdbd13-269d-4dd2-93e7-9f9de73070e0.png",
      fallback: "/placeholder.svg"
    }
  ];

  const upcomingGames = [
    { name: "Fortnite", logo: "/lovable-uploads/7520d813-a102-42c5-bfca-50ef6a393ee2.png" },
    { name: "NBA 2K25", logo: "/lovable-uploads/be9446b1-debc-4971-b92e-08bf68cc0528.png" },
    { name: "League of Legends", logo: "/lovable-uploads/4d65ff21-faf4-4516-9c64-1c1f48ac2800.png" },
    { name: "Clash of Clans", logo: "/lovable-uploads/36e18c99-2aa2-4048-a3ff-5a845424c135.png" }
  ];

  return (
    <div ref={ref} className="bg-gradient-to-r from-slate-900/50 to-blue-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 animate-fadeInUp' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Supported Games
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Compete in the most popular esports titles across multiple genres, from fighting games to sports simulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <div 
              key={index} 
              className={`group relative overflow-hidden rounded-xl bg-black/40 border border-blue-800/30 backdrop-blur-sm transition-all duration-300 hover:border-blue-600/50 hover:bg-black/60 hover-scale cursor-pointer ${
                isVisible ? 'opacity-100 animate-fadeInUp' : 'opacity-0 translate-y-10'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
              {...createTouchHandler(() => {}, 'light')}
            >
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

        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 animate-fadeInUp' : 'opacity-0 translate-y-10'
        }`}>
          <h3 className="text-2xl font-bold text-white mb-8">More games coming soon...</h3>
          <div className="flex justify-center flex-wrap gap-8">
            {upcomingGames.map((game, index) => (
              <div 
                key={index} 
                className={`group flex flex-col items-center p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-gray-300 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/50 hover:bg-gradient-to-br hover:from-blue-900/30 hover:to-gray-900/50 transition-all duration-300 hover-scale min-w-[180px] cursor-pointer ${
                  isVisible ? 'opacity-100 animate-fadeInUp' : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: `${(index + 6) * 150}ms` }}
                {...createTouchHandler(() => {}, 'light')}
              >
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300 w-24 h-24 flex items-center justify-center">
                  <img 
                    src={game.logo} 
                    alt={game.name} 
                    className="w-full h-full object-contain rounded"
                  />
                </div>
                <span className="text-base font-medium group-hover:text-blue-300 transition-colors duration-300 text-center">
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

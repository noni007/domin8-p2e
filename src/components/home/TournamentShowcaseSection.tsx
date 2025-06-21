
import { Button } from "@/components/ui/button";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";

export const TournamentShowcaseSection = () => {
  const featuredTournaments = [
    {
      title: "African FIFA Championship",
      game: "FIFA 24",
      prizePool: "$5,000",
      participants: "256",
      startDate: "Dec 20, 2024",
      status: "Open",
      image: "/lovable-uploads/4e0bfce4-e817-4880-ab58-437d5df53413.png"
    },
    {
      title: "Street Fighter Continental",
      game: "Street Fighter 6",
      prizePool: "$3,000",
      participants: "128",
      startDate: "Dec 25, 2024",
      status: "Filling Fast",
      image: "/lovable-uploads/7c6c85c3-2e4c-4099-8ff7-2ca3c889de42.png"
    },
    {
      title: "Free Fire Masters",
      game: "Free Fire",
      prizePool: "$4,000",
      participants: "200",
      startDate: "Jan 5, 2025",
      status: "Coming Soon",
      image: "/lovable-uploads/18b0c258-aaec-49e6-bf01-b0a75372ad30.png"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Featured Tournaments
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Join Africa's biggest esports tournaments with massive prize pools and continental recognition.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {featuredTournaments.map((tournament, index) => (
          <div key={index} className="group relative overflow-hidden rounded-xl bg-black/40 border border-blue-800/30 backdrop-blur-sm transition-all duration-300 hover:border-blue-600/50 hover:bg-black/60">
            <div className="aspect-video overflow-hidden">
              <img 
                src={tournament.image} 
                alt={tournament.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tournament.status === 'Open' ? 'bg-green-600 text-white' :
                  tournament.status === 'Filling Fast' ? 'bg-orange-600 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  {tournament.status}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-2">{tournament.title}</h3>
              <p className="text-blue-400 mb-4">{tournament.game}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                  <span className="text-sm">Prize Pool: {tournament.prizePool}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="text-sm">{tournament.participants} participants</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                  <span className="text-sm">Starts {tournament.startDate}</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                onClick={() => window.location.href = '/tournaments'}
              >
                {tournament.status === 'Coming Soon' ? 'Learn More' : 'Register Now'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Button 
          size="lg" 
          variant="outline"
          className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
          onClick={() => window.location.href = '/tournaments'}
        >
          <Clock className="mr-2 h-5 w-5" />
          View All Tournaments
        </Button>
      </div>
    </div>
  );
};

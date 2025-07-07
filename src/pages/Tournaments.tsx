
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TournamentForm } from "@/components/tournaments/TournamentForm";
import { TournamentDiscovery } from "@/components/tournaments/TournamentDiscovery";
import { useAuth } from "@/hooks/useAuth";

const Tournaments = () => {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-blue-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2">
              <img src="https://images.unsplash.com/photo-1616389884404-2ab423ebddae?w=32&h=32&fit=crop&crop=center" alt="Domin8 Logo" className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Domin8
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="outline" 
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black text-xs sm:text-sm px-3 sm:px-4 py-2 touch-manipulation"
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-200 to-teal-200 bg-clip-text text-transparent px-2">
            Tournament Discovery
          </h1>
          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            Discover and join professional esports tournaments across Africa. Advanced search and real-time updates.
          </p>
          
          {user && (
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base touch-manipulation"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {showForm ? 'Cancel' : 'Create Tournament'}
            </Button>
          )}
        </div>

        {/* Tournament Form */}
        {showForm && user && (
          <div className="mb-8 sm:mb-12">
            <TournamentForm />
          </div>
        )}

        {/* Tournament Discovery */}
        <TournamentDiscovery />
      </main>
    </div>
  );
};

export default Tournaments;

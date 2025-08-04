
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TournamentForm } from "@/components/tournaments/TournamentForm";
import { TournamentDiscovery } from "@/components/tournaments/TournamentDiscovery";
import { useAuth } from "@/hooks/useAuth";

export const Tournaments = () => {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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



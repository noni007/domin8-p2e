
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TeamsList } from "@/components/teams/TeamsList";
import { TeamForm } from "@/components/teams/TeamForm";
import { useAuth } from "@/hooks/useAuth";

const Teams = () => {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-blue-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/7754c2e2-2bb1-4a54-92b5-a2a7fc48a8cf.png" alt="Domin8 Logo" className="h-8 w-8" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Domin8
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-teal-200 bg-clip-text text-transparent">
            Team Management
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Create and manage your esports teams. Build clans, organize tournaments, and communicate with your members.
          </p>
          
          {user && (
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold px-6 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              {showForm ? 'Cancel' : 'Create Team'}
            </Button>
          )}
        </div>

        {/* Team Form */}
        {showForm && user && (
          <div className="mb-12">
            <TeamForm onSuccess={() => setShowForm(false)} />
          </div>
        )}

        {/* Teams List */}
        <TeamsList />
      </main>
    </div>
  );
};

export default Teams;

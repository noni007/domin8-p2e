
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

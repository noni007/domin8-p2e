
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Settings } from "lucide-react";
import { TeamsList } from "@/components/teams/TeamsList";
import { TeamForm } from "@/components/teams/TeamForm";
import { TeamManagement } from "@/components/teams/TeamManagement";
import { useAuth } from "@/hooks/useAuth";

export const Teams = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{id: string, name: string} | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const { user } = useAuth();

  const handleTeamSelect = (teamId: string, teamName: string) => {
    setSelectedTeam({ id: teamId, name: teamName });
  };

  if (selectedTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <TeamManagement 
            teamId={selectedTeam.id}
            teamName={selectedTeam.name}
            onBack={() => setSelectedTeam(null)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-200 to-teal-200 bg-clip-text text-transparent px-2">
            Team Management
          </h1>
          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            Create and manage your esports teams. Build clans, organize tournaments, and communicate with your members.
          </p>
        </div>

        {/* Team Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/40 border-blue-800/30 mb-8">
            <TabsTrigger 
              value="browse"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Browse Teams
            </TabsTrigger>
            {user && (
              <TabsTrigger 
                value="create"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="browse">
            <TeamsList onTeamSelect={handleTeamSelect} />
          </TabsContent>

          {user && (
            <TabsContent value="create">
              <TeamForm onSuccess={() => setActiveTab("browse")} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};



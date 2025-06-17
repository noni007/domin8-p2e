
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings, Users, Calendar, Bell, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TournamentStatusManager } from "./lifecycle/TournamentStatusManager";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface TournamentManagementProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  isOrganizer: boolean;
  onUpdate: () => void;
}

export const TournamentManagement = ({ 
  tournament, 
  participants, 
  isOrganizer, 
  onUpdate 
}: TournamentManagementProps) => {
  const [updating, setUpdating] = useState(false);

  if (!isOrganizer) {
    return null;
  }

  const handleNotifyParticipants = async () => {
    // This would integrate with a notification system
    toast({
      title: "Notifications Sent",
      description: `Notified ${participants.length} participants about tournament updates.`,
    });
  };

  const exportParticipants = () => {
    const csv = [
      'Player ID,Registration Date,Status',
      ...participants.map(p => `Player ${participants.indexOf(p) + 1},${new Date(p.registration_date).toLocaleDateString()},${p.status}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournament.title}_participants.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Tournament Status Manager */}
      <TournamentStatusManager
        tournament={tournament}
        participants={participants}
        isOrganizer={isOrganizer}
        onUpdate={onUpdate}
      />

      {/* Tournament Management */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tournament Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={handleNotifyParticipants}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notify Participants
              </Button>
              
              <Button
                onClick={exportParticipants}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Participants
              </Button>
            </div>
          </div>

          {/* Tournament Info */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Tournament Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Registration Deadline</div>
                <div className="text-white">
                  {new Date(tournament.registration_deadline).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Start Date</div>
                <div className="text-white">
                  {new Date(tournament.start_date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Participants</div>
                <div className="text-white">
                  {participants.length}/{tournament.max_participants}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Prize Pool</div>
                <div className="text-white">
                  ${(tournament.prize_pool / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

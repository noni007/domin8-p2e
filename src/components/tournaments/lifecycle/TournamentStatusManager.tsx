
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Play, Trophy, X, Users, Calendar } from 'lucide-react';
import { useTournamentLifecycle } from '@/hooks/useTournamentLifecycle';
import type { Tables } from '@/integrations/supabase/types';

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface TournamentStatusManagerProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  isOrganizer: boolean;
  onUpdate: () => void;
}

export const TournamentStatusManager = ({
  tournament,
  participants,
  isOrganizer,
  onUpdate
}: TournamentStatusManagerProps) => {
  const { startTournament, generateBracket, completeTournament, cancelTournament, loading } = useTournamentLifecycle();
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  if (!isOrganizer) return null;

  const handleAction = async (action: string) => {
    let success = false;
    
    switch (action) {
      case 'start':
        success = await startTournament(tournament.id);
        break;
      case 'generate_bracket':
        success = await generateBracket(tournament.id);
        break;
      case 'cancel':
        success = await cancelTournament(tournament.id);
        break;
    }

    if (success) {
      onUpdate();
    }
    setConfirmAction(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-600';
      case 'registration_open': return 'bg-green-600';
      case 'in_progress': return 'bg-yellow-600';
      case 'completed': return 'bg-purple-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const canStartTournament = tournament.status === 'registration_open' && participants.length >= 2;
  const canGenerateBracket = tournament.status === 'in_progress' && !tournament.bracket_generated;
  const canCancel = !['completed', 'cancelled'].includes(tournament.status);

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Tournament Status Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
          <div>
            <p className="text-gray-400 text-sm">Current Status</p>
            <p className="text-white font-medium">{tournament.status.replace('_', ' ')}</p>
          </div>
          <Badge className={`${getStatusColor(tournament.status)} text-white`}>
            {tournament.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Tournament Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="h-4 w-4" />
            <span>{participants.length}/{tournament.max_participants} participants</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="h-4 w-4" />
            <span>Start: {new Date(tournament.start_date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {canStartTournament && (
            <AlertDialog open={confirmAction === 'start'} onOpenChange={() => setConfirmAction(null)}>
              <AlertDialogTrigger asChild>
                <Button
                  onClick={() => setConfirmAction('start')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Tournament
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black/90 border-green-800/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Start Tournament?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    This will start the tournament and prevent new registrations. Are you sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleAction('start')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Start Tournament
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {canGenerateBracket && (
            <AlertDialog open={confirmAction === 'generate_bracket'} onOpenChange={() => setConfirmAction(null)}>
              <AlertDialogTrigger asChild>
                <Button
                  onClick={() => setConfirmAction('generate_bracket')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Generate Bracket
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black/90 border-blue-800/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Generate Tournament Bracket?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    This will create the tournament bracket with {participants.length} participants. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleAction('generate_bracket')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Generate Bracket
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {canCancel && (
            <AlertDialog open={confirmAction === 'cancel'} onOpenChange={() => setConfirmAction(null)}>
              <AlertDialogTrigger asChild>
                <Button
                  onClick={() => setConfirmAction('cancel')}
                  variant="outline"
                  className="w-full border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Tournament
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black/90 border-red-800/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Cancel Tournament?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    This will cancel the tournament and refund all entry fees. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    Keep Tournament
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleAction('cancel')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Cancel Tournament
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Status Messages */}
        {tournament.status === 'registration_open' && participants.length < 2 && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Need at least 2 participants to start the tournament
            </p>
          </div>
        )}

        {tournament.status === 'completed' && (
          <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
            <p className="text-green-400 text-sm">
              Tournament completed successfully!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

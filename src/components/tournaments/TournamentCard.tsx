
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, DollarSign, Clock } from "lucide-react";
import { TournamentRegistrationButton } from "./TournamentRegistrationButton";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
// Flexible tournament type that works with both direct table queries and RPC results
interface TournamentBase {
  id: string;
  title: string;
  description: string;
  game: string;
  status: string;
  prize_pool: number;
  entry_fee: number | null;
  max_participants: number;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  tournament_type: string;
  bracket_generated: boolean;
  created_at: string;
  // Optional fields that may come from direct queries but not RPC
  organizer_id?: string;
  team_id?: string | null;
  updated_at?: string;
  // Optional field from RPC
  organizer_username?: string | null;
  participant_count?: number;
}

interface TournamentCardProps {
  tournament: TournamentBase;
  participantCount?: number;
  isRegistered?: boolean;
  onRegistrationChange?: () => void;
}

export const TournamentCard = ({ 
  tournament, 
  participantCount = 0, 
  isRegistered = false,
  onRegistrationChange 
}: TournamentCardProps) => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrize = (amount: number) => {
    return `₦${(amount / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
      case 'registration_open':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const canRegister = () => {
    const now = new Date();
    const deadline = new Date(tournament.registration_deadline);
    const isFull = participantCount >= tournament.max_participants;
    const deadlinePassed = now > deadline;
    const registrationOpen = tournament.status === 'registration_open' || tournament.status === 'upcoming';
    
    return registrationOpen && !isFull && !deadlinePassed && !isRegistered;
  };

  const handleRegistrationClick = () => {
    if (!user) {
      setShowAuthModal(true);
    }
  };

  const spotsRemaining = tournament.max_participants - participantCount;

  return (
    <>
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-white text-lg">{tournament.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                  {tournament.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                  {tournament.game}
                </Badge>
              </div>
            </div>
            {tournament.prize_pool > 0 && (
              <div className="text-right">
                <div className="text-yellow-400 font-bold text-lg">
                  {formatPrize(tournament.prize_pool)}
                </div>
                <div className="text-gray-400 text-xs">Prize Pool</div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm line-clamp-2">
            {tournament.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(tournament.start_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="h-4 w-4" />
              <span>{participantCount}/{tournament.max_participants}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="h-4 w-4" />
              <span>Reg. Deadline: {formatDate(tournament.registration_deadline)}</span>
            </div>
            {tournament.entry_fee > 0 && (
              <div className="flex items-center gap-2 text-gray-300">
                <DollarSign className="h-4 w-4" />
                <span>Entry: {formatPrize(tournament.entry_fee)}</span>
              </div>
            )}
          </div>

          {spotsRemaining > 0 && spotsRemaining <= 5 && canRegister() && (
            <div className="bg-orange-600/20 border border-orange-400/30 rounded-lg p-2">
              <p className="text-orange-400 text-sm text-center">
                Only {spotsRemaining} spots remaining!
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
              onClick={() => window.open(`/tournaments/${tournament.id}`, '_self')}
            >
              View Details
            </Button>
            
            {user ? (
              <TournamentRegistrationButton
                tournamentId={tournament.id}
                tournamentTitle={tournament.title}
                entryFee={tournament.entry_fee || 0}
                isRegistered={isRegistered}
                onRegistrationChange={onRegistrationChange || (() => {})}
              />
            ) : (
              <Button 
                onClick={handleRegistrationClick}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Register
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

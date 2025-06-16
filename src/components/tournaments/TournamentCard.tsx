
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Users, 
  Trophy, 
  MapPin, 
  Clock,
  DollarSign,
  Star
} from "lucide-react";
import { TournamentRegistrationButton } from "./TournamentRegistrationButton";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface TournamentCardProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  isRegistered: boolean;
  onRegistrationChange: () => void;
  onViewDetails: (tournament: Tournament) => void;
}

export const TournamentCard = ({
  tournament,
  participants,
  isRegistered,
  onRegistrationChange,
  onViewDetails
}: TournamentCardProps) => {
  const spotsRemaining = tournament.max_participants - participants.length;
  const isFull = spotsRemaining <= 0;
  const isUpcoming = tournament.status === 'upcoming' || tournament.status === 'registration_open';
  
  const formatMoney = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'bg-green-600';
      case 'upcoming':
        return 'bg-blue-600';
      case 'in_progress':
        return 'bg-yellow-600';
      case 'completed':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'Registration Open';
      case 'upcoming':
        return 'Upcoming';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-300 h-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {tournament.game?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Badge className={`${getStatusColor(tournament.status)} text-white text-xs`}>
                {getStatusText(tournament.status)}
              </Badge>
            </div>
          </div>
          {tournament.entry_fee > 0 && (
            <div className="flex items-center gap-1 bg-green-900/30 px-2 py-1 rounded border border-green-700/50">
              <DollarSign className="h-3 w-3 text-green-400" />
              <span className="text-green-400 text-xs font-semibold">
                ${formatMoney(tournament.entry_fee)}
              </span>
            </div>
          )}
        </div>
        
        <CardTitle className="text-white text-lg line-clamp-2">
          {tournament.title}
        </CardTitle>
        
        <div className="flex items-center space-x-4 text-sm text-gray-300">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span className="capitalize">{tournament.game?.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{participants.length}/{tournament.max_participants}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Prize Pool Section */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-700/30">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Prize Pool</span>
          </div>
          <span className="text-white font-bold text-lg">
            ${formatMoney(tournament.prize_pool)}
          </span>
        </div>

        {/* Entry Fee Info */}
        {tournament.entry_fee > 0 ? (
          <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <span className="text-blue-400 font-medium">Entry Fee</span>
            <span className="text-white font-semibold">
              ${formatMoney(tournament.entry_fee)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center p-3 bg-green-900/20 rounded-lg border border-green-700/30">
            <Star className="h-4 w-4 text-green-400 mr-2" />
            <span className="text-green-400 font-medium">Free to Join</span>
          </div>
        )}

        {/* Tournament Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-gray-300">
            <Calendar className="h-4 w-4" />
            <span>
              Starts: {new Date(tournament.start_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock className="h-4 w-4" />
            <span>
              Registration closes: {new Date(tournament.registration_deadline).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Registration Status */}
        {spotsRemaining > 0 && spotsRemaining <= 5 && isUpcoming && (
          <div className="p-2 bg-orange-900/20 rounded border border-orange-700/30">
            <p className="text-orange-400 text-sm text-center">
              Only {spotsRemaining} spots remaining!
            </p>
          </div>
        )}

        {isFull && isUpcoming && (
          <div className="p-2 bg-red-900/20 rounded border border-red-700/30">
            <p className="text-red-400 text-sm text-center">Tournament is full</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => onViewDetails(tournament)}
            className="flex-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
          >
            View Details
          </Button>
          
          {isUpcoming && (
            <TournamentRegistrationButton
              tournamentId={tournament.id}
              tournamentTitle={tournament.title}
              entryFee={tournament.entry_fee}
              isRegistered={isRegistered}
              onRegistrationChange={onRegistrationChange}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};


import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, Trophy, DollarSign, Clock, MapPin } from "lucide-react";
import { TournamentBracket } from "./TournamentBracket";
import { TournamentRegistration } from "./TournamentRegistration";
import { RealTimeUpdates } from "@/components/notifications/RealTimeUpdates";
import { useAuth } from "@/hooks/useAuth";
import { useRealTimeTournament } from "@/hooks/useRealTimeTournament";
import { SocialShareButton } from "@/components/social/SocialShareButton";
import { MediaGenerator } from "@/components/social/MediaGenerator";
import { PlatformEmbeds } from "@/components/social/PlatformEmbeds";

interface TournamentDetailsProps {
  tournamentId: string;
  onBack: () => void;
}

export const TournamentDetails = ({ tournamentId, onBack }: TournamentDetailsProps) => {
  const { user } = useAuth();
  
  // Use real-time tournament hook
  const { tournament, participants, loading } = useRealTimeTournament({
    tournamentId,
    onTournamentUpdate: () => {
      console.log('Tournament updated via real-time');
    }
  });

  const handleBracketUpdate = () => {
    // Real-time hooks will automatically update the data
    console.log('Bracket update triggered');
  };

  const handleRegistrationChange = () => {
    // Real-time hooks will automatically update the data
    console.log('Registration changed');
  };

  if (loading || !tournament) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-600 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-600';
      case 'registration_open': return 'bg-green-600';
      case 'in_progress': return 'bg-yellow-600';
      case 'completed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getTimeUntilStart = () => {
    const now = new Date();
    const startDate = new Date(tournament.start_date);
    const diffMs = startDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Tournament started";
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    return "Starting soon";
  };

  const isRegistered = participants.some(p => p.user_id === user?.id);
  const registrationOpen = tournament.status === 'registration_open' || tournament.status === 'upcoming';
  const spotsAvailable = tournament.max_participants - participants.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack}
          className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournaments
        </Button>
      </div>

      {/* Real-time Updates */}
      <RealTimeUpdates tournamentId={tournamentId} userId={user?.id} />

      {/* Tournament Hero Section */}
      <Card className="bg-gradient-to-r from-blue-900/40 to-teal-900/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-white text-3xl mb-3">{tournament.title}</CardTitle>
              <div className="flex gap-2 flex-wrap mb-4">
                <Badge className={`${getStatusColor(tournament.status)} text-white capitalize`}>
                  {tournament.status.replace('_', ' ')}
                </Badge>
                {isRegistered && (
                  <Badge className="bg-green-600 text-white">
                    ✓ Registered
                  </Badge>
                )}
                <Badge className="bg-purple-600 text-white">
                  🔴 Live Updates
                </Badge>
                {spotsAvailable <= 5 && spotsAvailable > 0 && (
                  <Badge className="bg-orange-600 text-white">
                    ⚠️ Only {spotsAvailable} spots left
                  </Badge>
                )}
                {spotsAvailable === 0 && (
                  <Badge className="bg-red-600 text-white">
                    🚫 Tournament Full
                  </Badge>
                )}
              </div>
              <p className="text-gray-300 leading-relaxed">{tournament.description}</p>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="flex items-center justify-center lg:justify-end gap-1 text-yellow-400 text-2xl font-bold mb-2">
                <DollarSign className="h-6 w-6" />
                {tournament.prize_pool.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm mb-3">Prize Pool</div>
              <div className="flex items-center justify-center lg:justify-end gap-1 text-blue-400 text-lg">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{getTimeUntilStart()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
              <Trophy className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-white font-semibold">{tournament.game}</div>
                <div className="text-gray-400 text-sm">Game</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
              <Users className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-white font-semibold">
                  {participants.length}/{tournament.max_participants}
                </div>
                <div className="text-gray-400 text-sm">Participants</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-white font-semibold text-sm">
                  {formatDate(tournament.start_date)}
                </div>
                <div className="text-gray-400 text-sm">Start Date</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
              <Calendar className="h-5 w-5 text-red-400" />
              <div>
                <div className="text-white font-semibold text-sm">
                  {formatDate(tournament.registration_deadline)}
                </div>
                <div className="text-gray-400 text-sm">Registration Deadline</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media & Sharing */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Share Tournament</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MediaGenerator 
            type="tournament_card" 
            data={{ 
              ...tournament, 
              participantCount: participants.length 
            }}
          />
          <div className="flex justify-center">
            <SocialShareButton
              title={tournament.title}
              description={`${tournament.game} tournament with $${tournament.prize_pool.toLocaleString()} prize pool! ${participants.length}/${tournament.max_participants} participants. ${getTimeUntilStart()}`}
              type="tournament"
              url={window.location.href}
              imageUrl={`${window.location.origin}/tournament-${tournament.id}.png`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Registration Section */}
      <TournamentRegistration
        tournament={tournament}
        participants={participants}
        isRegistered={isRegistered}
        onRegistrationChange={handleRegistrationChange}
      />

      {/* Tournament Rules & Info */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Tournament Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Format</h4>
              <p className="text-gray-300">Single Elimination Bracket</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Platform</h4>
              <p className="text-gray-300">PC / Console</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Entry Fee</h4>
              <p className="text-gray-300">Free</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Contact</h4>
              <p className="text-gray-300">Tournament Organizer</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-2">Rules</h4>
            <ul className="text-gray-300 space-y-1 list-disc list-inside">
              <li>All participants must be registered before the deadline</li>
              <li>Matches must be played at the scheduled time</li>
              <li>Any form of cheating will result in immediate disqualification</li>
              <li>Disputes will be resolved by tournament administrators</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Platform Embeds */}
      <PlatformEmbeds type="tournament" tournamentId={tournamentId} />

      {/* Tournament Bracket */}
      <TournamentBracket
        tournament={tournament}
        participants={participants}
        bracketGenerated={tournament.bracket_generated}
        onBracketGenerated={handleBracketUpdate}
      />
    </div>
  );
};

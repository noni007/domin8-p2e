import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useMatchSpectating } from '@/hooks/useMatchSpectating';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Users, Clock, Play, Pause, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MatchSpectatingProps {
  matchId: string;
}

export const MatchSpectating = ({ matchId }: MatchSpectatingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const {
    spectators,
    spectatorCount,
    isSpectating,
    matchStatus,
    loading,
    joinAsSpectator,
    leaveSpectating,
    refreshSpectators
  } = useMatchSpectating(matchId);

  const handleJoinSpectating = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to spectate matches",
        variant: "destructive"
      });
      return;
    }

    setIsJoining(true);
    try {
      await joinAsSpectator();
      toast({
        title: "Joined Spectating",
        description: "You are now spectating this match",
      });
    } catch (error) {
      toast({
        title: "Failed to Join",
        description: "Could not join as spectator. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveSpectating = async () => {
    setIsLeaving(true);
    try {
      await leaveSpectating();
      toast({
        title: "Left Spectating",
        description: "You are no longer spectating this match",
      });
    } catch (error) {
      toast({
        title: "Failed to Leave",
        description: "Could not leave spectating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLeaving(false);
    }
  };

  const getMatchStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <Trophy className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Match Status and Spectator Count */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Match Spectating
            </CardTitle>
            <Badge 
              variant="secondary" 
              className={`${getMatchStatusColor(matchStatus)} text-white`}
            >
              {getMatchStatusIcon(matchStatus)}
              <span className="ml-1 capitalize">{matchStatus}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {spectatorCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  {spectatorCount === 1 ? 'Spectator' : 'Spectators'}
                </div>
              </div>
              
              {matchStatus === 'live' && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isSpectating ? (
                <Button
                  onClick={handleJoinSpectating}
                  disabled={isJoining || !user}
                  variant="default"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isJoining ? 'Joining...' : 'Join Spectating'}
                </Button>
              ) : (
                <Button
                  onClick={handleLeaveSpectating}
                  disabled={isLeaving}
                  variant="outline"
                  size="sm"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  {isLeaving ? 'Leaving...' : 'Leave Spectating'}
                </Button>
              )}
              
              <Button
                onClick={refreshSpectators}
                variant="ghost"
                size="sm"
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spectator List */}
      {spectators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Spectators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {spectators.map((spectator, index) => (
                <div key={spectator.user_id || index}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={spectator.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {spectator.profiles?.username?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {spectator.profiles?.username || 'Anonymous'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Joined {new Date(spectator.joined_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    {spectator.user_id === user?.id && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  
                  {index < spectators.length - 1 && (
                    <Separator className="mt-3" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Spectators State */}
      {spectators.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Spectators Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to spectate this match and see the action live!
            </p>
            {!isSpectating && user && (
              <Button onClick={handleJoinSpectating} disabled={isJoining}>
                <Eye className="h-4 w-4 mr-2" />
                Start Spectating
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
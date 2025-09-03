import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LazyImage } from './LazyLoadOptimizer';
import { Calendar, Users, Trophy } from 'lucide-react';

interface OptimizedTournamentCardProps {
  id: string;
  title: string;
  game: string;
  participants: number;
  maxParticipants: number;
  prizePool: number;
  startDate: string;
  status: 'upcoming' | 'live' | 'completed';
  image?: string;
  onRegister?: (id: string) => void;
  isRegistered?: boolean;
  loading?: boolean;
}

// Memoized tournament card for better performance
export const OptimizedTournamentCard = React.memo(({
  id,
  title,
  game,
  participants,
  maxParticipants,
  prizePool,
  startDate,
  status,
  image,
  onRegister,
  isRegistered,
  loading
}: OptimizedTournamentCardProps) => {
  // Memoize expensive calculations
  const formattedDate = React.useMemo(() => {
    return new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [startDate]);

  const formattedPrize = React.useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(prizePool);
  }, [prizePool]);

  const participantPercentage = React.useMemo(() => {
    return Math.round((participants / maxParticipants) * 100);
  }, [participants, maxParticipants]);

  const handleRegister = React.useCallback(() => {
    onRegister?.(id);
  }, [id, onRegister]);

  const getStatusVariant = React.useCallback(() => {
    switch (status) {
      case 'live': return 'destructive';
      case 'completed': return 'secondary';
      default: return 'default';
    }
  }, [status]);

  const getStatusColor = React.useCallback(() => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-green-500';
    }
  }, [status]);

  return (
    <Card className="hover-lift transition-all duration-300 group h-full">
      {/* Tournament Image */}
      {image && (
        <div className="relative h-32 overflow-hidden rounded-t-lg">
          <LazyImage
            src={image}
            alt={`${title} tournament`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className={`absolute top-2 left-2 w-3 h-3 rounded-full ${getStatusColor()}`} />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={getStatusVariant()} className="text-xs">
            {status.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {game}
          </Badge>
        </div>
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
          {title}
        </h3>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>{participants}/{maxParticipants}</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-muted-foreground" />
            <span>{formattedPrize}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{formattedDate}</span>
          </div>
        </div>

        {/* Participants Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Participants</span>
            <span>{participantPercentage}% full</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${participantPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleRegister}
          disabled={loading || status === 'completed' || participants >= maxParticipants}
          size="sm"
          className="w-full"
          variant={isRegistered ? "outline" : "default"}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : isRegistered ? (
            'Registered'
          ) : status === 'completed' ? (
            'Completed'
          ) : participants >= maxParticipants ? (
            'Full'
          ) : (
            'Register'
          )}
        </Button>
      </CardContent>
    </Card>
  );
});

OptimizedTournamentCard.displayName = 'OptimizedTournamentCard';
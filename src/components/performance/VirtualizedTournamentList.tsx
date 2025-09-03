import React, { useMemo } from 'react';
import { OptimizedTournamentCard } from './OptimizedTournamentCard';
import { CardSkeleton } from './LazyLoadOptimizer';
import { useIsMobile } from '@/hooks/use-mobile';

interface Tournament {
  id: string;
  title: string;
  game: string;
  participants: number;
  maxParticipants: number;
  prizePool: number;
  startDate: string;
  status: 'upcoming' | 'live' | 'completed';
  image?: string;
  isRegistered?: boolean;
}

interface VirtualizedTournamentListProps {
  tournaments: Tournament[];
  onRegister?: (id: string) => void;
  loading?: boolean;
  itemsPerRow?: number;
}

// Simple grid layout without virtualization for now
// Can be upgraded to use react-window when needed
export const VirtualizedTournamentList = ({
  tournaments,
  onRegister,
  loading = false,
  itemsPerRow
}: VirtualizedTournamentListProps) => {
  const isMobile = useIsMobile();
  
  // Calculate responsive columns
  const columnsPerRow = useMemo(() => {
    if (itemsPerRow) return itemsPerRow;
    return isMobile ? 1 : 3;
  }, [isMobile, itemsPerRow]);

  if (tournaments.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tournaments found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))
        ) : (
          tournaments.map((tournament) => (
            <OptimizedTournamentCard
              key={tournament.id}
              {...tournament}
              onRegister={onRegister}
              loading={loading}
            />
          ))
        )}
      </div>
    </div>
  );
};
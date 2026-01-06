
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, PlayCircle } from 'lucide-react';
import { useTour } from '@/hooks/useTour';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TourTriggerProps {
  tourId?: string;
  variant?: 'button' | 'icon';
  className?: string;
}

export const TourTrigger: React.FC<TourTriggerProps> = ({
  tourId = 'dashboard',
  variant = 'icon',
  className,
}) => {
  const { startTour, isActive } = useTour();

  const handleClick = () => {
    if (!isActive) {
      startTour(tourId);
    }
  };

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isActive}
        className={className}
      >
        <PlayCircle className="h-4 w-4 mr-2" />
        Take a Tour
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          disabled={isActive}
          className={className}
          aria-label="Start guided tour"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Take a guided tour</p>
      </TooltipContent>
    </Tooltip>
  );
};

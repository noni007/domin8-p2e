import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HelpTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const HelpTooltip = ({ content, side = 'top', className = '' }: HelpTooltipProps) => {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center justify-center p-1 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
          aria-label="Help information"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        className="max-w-[250px] text-sm bg-popover border-border shadow-lg"
      >
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default HelpTooltip;

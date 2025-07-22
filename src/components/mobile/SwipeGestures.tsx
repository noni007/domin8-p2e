import React, { useRef, useEffect, useState } from 'react';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface SwipeableCardProps {
  title: string;
  description: string;
  content: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  title,
  description,
  content,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const swipeHandlers = useSwipeGestures({
    onSwipeLeft: () => {
      setSwipeDirection('left');
      setIsAnimating(true);
      onSwipeLeft?.();
      setTimeout(() => {
        setSwipeDirection(null);
        setIsAnimating(false);
      }, 300);
    },
    onSwipeRight: () => {
      setSwipeDirection('right');
      setIsAnimating(true);
      onSwipeRight?.();
      setTimeout(() => {
        setSwipeDirection(null);
        setIsAnimating(false);
      }, 300);
    },
    onSwipeUp: () => {
      setSwipeDirection('up');
      setIsAnimating(true);
      onSwipeUp?.();
      setTimeout(() => {
        setSwipeDirection(null);
        setIsAnimating(false);
      }, 300);
    },
    onSwipeDown: () => {
      setSwipeDirection('down');
      setIsAnimating(true);
      onSwipeDown?.();
      setTimeout(() => {
        setSwipeDirection(null);
        setIsAnimating(false);
      }, 300);
    },
    threshold: 50
  });

  return (
    <Card
      ref={cardRef}
      {...swipeHandlers}
      className={`transition-all duration-300 select-none cursor-grab active:cursor-grabbing ${
        isAnimating ? 'scale-95' : ''
      } ${
        swipeDirection === 'left' ? 'transform -translate-x-4 opacity-75' :
        swipeDirection === 'right' ? 'transform translate-x-4 opacity-75' :
        swipeDirection === 'up' ? 'transform -translate-y-4 opacity-75' :
        swipeDirection === 'down' ? 'transform translate-y-4 opacity-75' : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {swipeDirection && (
            <Badge variant="secondary" className="animate-pulse">
              {swipeDirection === 'left' && <><ChevronLeft className="h-3 w-3 mr-1" /> Left</>}
              {swipeDirection === 'right' && <><ChevronRight className="h-3 w-3 mr-1" /> Right</>}
              {swipeDirection === 'up' && <><RotateCcw className="h-3 w-3 mr-1" /> Up</>}
              {swipeDirection === 'down' && <><RotateCcw className="h-3 w-3 mr-1 rotate-180" /> Down</>}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{content}</p>
        <div className="mt-4 text-xs text-muted-foreground">
          💡 Try swiping in different directions
        </div>
      </CardContent>
    </Card>
  );
};

export const SwipeGestures = () => {
  const [actionLog, setActionLog] = useState<string[]>([]);

  const logAction = (action: string) => {
    setActionLog(prev => [`${new Date().toLocaleTimeString()}: ${action}`, ...prev.slice(0, 4)]);
  };

  const demoCards = [
    {
      title: "Tournament Card",
      description: "Swipe to interact",
      content: "Swipe right to join, left to dismiss, up for details, down to bookmark."
    },
    {
      title: "Match Result",
      description: "Gesture controls",
      content: "Swipe right to confirm, left to dispute, up to share, down to save."
    },
    {
      title: "Notification",
      description: "Quick actions",
      content: "Swipe right to accept, left to decline, up to view details, down to snooze."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Swipe Gestures Demo</h2>
        <p className="text-muted-foreground">
          Experience touch-friendly interactions for mobile gaming
        </p>
      </div>

      {/* Action Log */}
      {actionLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {actionLog.map((action, index) => (
                <div key={index} className="text-xs text-muted-foreground font-mono">
                  {action}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Swipeable Cards */}
      <div className="space-y-4">
        {demoCards.map((card, index) => (
          <SwipeableCard
            key={index}
            title={card.title}
            description={card.description}
            content={card.content}
            onSwipeLeft={() => logAction(`${card.title}: Swiped Left (Dismiss)`)}
            onSwipeRight={() => logAction(`${card.title}: Swiped Right (Accept)`)}
            onSwipeUp={() => logAction(`${card.title}: Swiped Up (Details)`)}
            onSwipeDown={() => logAction(`${card.title}: Swiped Down (Save)`)}
          />
        ))}
      </div>

      {/* Instructions */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-2">Gesture Patterns:</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>← Left: Dismiss/Decline</li>
                <li>→ Right: Accept/Join</li>
                <li>↑ Up: Details/Share</li>
                <li>↓ Down: Save/Bookmark</li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-2">Gaming Actions:</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>Tournament join/leave</li>
                <li>Match confirmation</li>
                <li>Quick navigation</li>
                <li>Content interaction</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
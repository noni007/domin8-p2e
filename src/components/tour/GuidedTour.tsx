import React, { useEffect, useState, useCallback } from 'react';
import { useTour } from '@/hooks/useTour';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
}

export const GuidedTour: React.FC = () => {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour } = useTour();
  const [spotlight, setSpotlight] = useState<SpotlightPosition | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const currentStepData = steps[currentStep];

  const calculatePositions = useCallback(() => {
    if (!currentStepData) return;

    const element = document.querySelector(currentStepData.target);
    if (!element) {
      // If element not found, show tooltip in center
      setSpotlight(null);
      setTooltipPos({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 175,
      });
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = currentStepData.spotlightPadding ?? 8;

    setSpotlight({
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Calculate tooltip position based on step's position preference
    const tooltipWidth = 350;
    const tooltipHeight = 180;
    const gap = 16;

    let newTop = 0;
    let newLeft = 0;

    switch (currentStepData.position) {
      case 'top':
        newTop = rect.top + window.scrollY - tooltipHeight - gap;
        newLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        newTop = rect.bottom + window.scrollY + gap;
        newLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        newTop = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
        newLeft = rect.left - tooltipWidth - gap;
        break;
      case 'right':
        newTop = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
        newLeft = rect.right + gap;
        break;
      default:
        newTop = rect.bottom + window.scrollY + gap;
        newLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    }

    // Keep tooltip in viewport
    newLeft = Math.max(16, Math.min(newLeft, window.innerWidth - tooltipWidth - 16));
    newTop = Math.max(16, newTop);

    setTooltipPos({ top: newTop, left: newLeft });

    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentStepData]);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      calculatePositions();

      const handleResize = () => calculatePositions();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      };
    } else {
      setIsVisible(false);
    }
  }, [isActive, currentStep, calculatePositions]);

  if (!isActive || !isVisible || !currentStepData) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Overlay with spotlight cutout */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {spotlight && (
                <rect
                  x={spotlight.left}
                  y={spotlight.top}
                  width={spotlight.width}
                  height={spotlight.height}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Spotlight highlight ring */}
      {spotlight && (
        <div
          className="absolute border-2 border-primary rounded-lg pointer-events-none animate-pulse"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.4)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={cn(
          "absolute z-[101] w-[350px] bg-card border border-border rounded-xl shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={skipTour}
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            {currentStepData.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30 rounded-b-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={skipTour}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip Tour
          </Button>
          
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={nextStep}
              className="gap-1 bg-primary hover:bg-primary/90"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-3">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentStep ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>

      {/* Click blocker that allows clicking the spotlight area */}
      <div
        className="absolute inset-0"
        onClick={(e) => {
          // Allow clicks on the spotlighted element
          if (spotlight) {
            const clickX = e.clientX;
            const clickY = e.clientY + window.scrollY;
            const inSpotlight =
              clickX >= spotlight.left &&
              clickX <= spotlight.left + spotlight.width &&
              clickY >= spotlight.top &&
              clickY <= spotlight.top + spotlight.height;
            
            if (!inSpotlight) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        }}
      />
    </div>
  );
};

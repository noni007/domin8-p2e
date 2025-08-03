import React from 'react';

interface UseCountAnimationProps {
  end: number;
  duration?: number;
  delay?: number;
  isVisible?: boolean;
}

export const useCountAnimation = ({ 
  end, 
  duration = 2000, 
  delay = 0,
  isVisible = true 
}: UseCountAnimationProps) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(end * easeOutQuart);
        
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [end, duration, delay, isVisible]);

  return count;
};

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'avatar' | 'text' | 'button';
  lines?: number;
}

export const Skeleton = ({ 
  className, 
  variant = 'default',
  lines = 1
}: SkeletonProps) => {
  const baseClasses = "animate-pulse bg-gray-600/30 rounded";
  
  const variants = {
    default: "h-4 w-full",
    card: "h-32 w-full",
    avatar: "h-12 w-12 rounded-full",
    text: "h-4",
    button: "h-10 w-24"
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variants.text,
              i === lines - 1 ? "w-3/4" : "w-full"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={cn(baseClasses, variants[variant], className)}
    />
  );
};

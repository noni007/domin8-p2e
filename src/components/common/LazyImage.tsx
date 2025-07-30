
import * as React from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = ({ 
  src, 
  alt, 
  placeholder = '/placeholder.svg',
  className,
  onLoad,
  onError,
  ...props 
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    let observer: IntersectionObserver;
    
    if (imgRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    setImageSrc(placeholder);
    onError?.();
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300 w-full h-full object-cover",
          isLoading && "opacity-50",
          hasError && "opacity-75"
        )}
        {...props}
      />
      {isLoading && imageSrc !== placeholder && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse loading-shimmer" />
      )}
    </div>
  );
};

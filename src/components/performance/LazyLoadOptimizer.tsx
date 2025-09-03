import React, { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadProps {
  fallback?: React.ReactNode;
  delay?: number;
}

// Higher-order component for lazy loading with optimized fallbacks
export const withLazyLoad = <P extends {}>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: LazyLoadProps = {}
) => {
  const { delay = 200 } = options;
  
  const LazyComponent = lazy(() => 
    Promise.all([
      importFunc(),
      // Minimum delay to prevent flash of loading state
      new Promise(resolve => setTimeout(resolve, delay))
    ]).then(([moduleExports]) => moduleExports)
  );

  return React.forwardRef<any, P>((props, ref) => (
    <Suspense fallback={options.fallback || <ComponentSkeleton />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

// Reusable skeleton components
export const ComponentSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const CardSkeleton = () => (
  <div className="animate-pulse p-6 border border-border rounded-lg bg-card">
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  </div>
);

export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border border-border rounded-lg">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

// Image lazy loading with intersection observer
export const LazyImage = ({ 
  src, 
  alt, 
  className = "", 
  fallback 
}: { 
  src: string; 
  alt: string; 
  className?: string;
  fallback?: React.ReactNode;
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isInView ? (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        fallback || <Skeleton className={`w-full h-full ${className}`} />
      )}
    </div>
  );
};
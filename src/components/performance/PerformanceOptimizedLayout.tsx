import React from 'react';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { LazyImage } from './LazyLoadOptimizer';

interface PerformanceOptimizedLayoutProps {
  children: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  enableLazyLoading?: boolean;
}

// Layout wrapper that applies performance optimizations
export const PerformanceOptimizedLayout = ({
  children,
  priority = 'medium',
  enableLazyLoading = true
}: PerformanceOptimizedLayoutProps) => {
  const { shouldRenderComponent, config } = usePerformanceOptimization({
    enableImageLazyLoading: enableLazyLoading
  });

  // Skip rendering low-priority components on low-performance devices
  if (!shouldRenderComponent(priority)) {
    return null;
  }

  return (
    <div className="performance-optimized-layout">
      {children}
    </div>
  );
};

// Optimized section with lazy loading and intersection observer
export const PerformanceSection = ({ 
  children, 
  className = '',
  threshold = 0.1,
  priority = 'medium'
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  priority?: 'high' | 'medium' | 'low';
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const { shouldRenderComponent } = usePerformanceOptimization();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  if (!shouldRenderComponent(priority)) {
    return <div className={`h-32 ${className}`} />; // Placeholder
  }

  return (
    <div ref={sectionRef} className={className}>
      {isVisible ? children : <div className="h-32 animate-pulse bg-muted/10 rounded" />}
    </div>
  );
};

// Performance-optimized image with automatic optimization
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  ...props
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const { optimizeImageSrc } = usePerformanceOptimization();

  if (priority) {
    // High-priority images load immediately
    return (
      <img
        src={optimizeImageSrc(src, width, height)}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="eager"
        {...props}
      />
    );
  }

  // Regular images use lazy loading
  return (
    <LazyImage
      src={optimizeImageSrc(src, width, height)}
      alt={alt}
      className={className}
      {...props}
    />
  );
};

// Memory-efficient list renderer
export const OptimizedList = <T extends { id: string }>({
  items,
  renderItem,
  maxVisible = 50,
  className = ''
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  maxVisible?: number;
  className?: string;
}) => {
  const [visibleCount, setVisibleCount] = React.useState(Math.min(maxVisible, items.length));
  const { isLowPerformanceDevice } = usePerformanceOptimization();

  const handleLoadMore = React.useCallback(() => {
    setVisibleCount(prev => Math.min(prev + maxVisible, items.length));
  }, [maxVisible, items.length]);

  const visibleItems = React.useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const adjustedMaxVisible = isLowPerformanceDevice ? Math.floor(maxVisible * 0.7) : maxVisible;

  return (
    <div className={className}>
      {visibleItems.map((item, index) => (
        <React.Fragment key={item.id}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
      
      {visibleCount < items.length && (
        <div className="text-center py-4">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-80 transition-opacity"
          >
            Load More ({items.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
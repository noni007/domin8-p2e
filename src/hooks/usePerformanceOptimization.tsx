import { useEffect, useCallback, useState } from 'react';
import { useDebounce } from './useDebounce';

interface PerformanceOptimizationConfig {
  enableImageLazyLoading?: boolean;
  enableVirtualization?: boolean;
  enableMemoization?: boolean;
  debounceDelay?: number;
  intersectionThreshold?: number;
}

export const usePerformanceOptimization = (config: PerformanceOptimizationConfig = {}) => {
  const {
    enableImageLazyLoading = true,
    enableVirtualization = false,
    enableMemoization = true,
    debounceDelay = 300,
    intersectionThreshold = 0.1
  } = config;

  const [isLowPerformanceDevice, setIsLowPerformanceDevice] = useState(false);

  // Detect device capabilities
  useEffect(() => {
    const detectDeviceCapabilities = () => {
      const memory = (navigator as any).deviceMemory;
      const connection = (navigator as any).connection;
      const hardwareConcurrency = navigator.hardwareConcurrency;

      // Consider device low-performance if:
      // - Low memory (< 4GB)
      // - Slow connection
      // - Few CPU cores
      const isLowPerf = 
        (memory && memory < 4) ||
        (connection && connection.effectiveType && ['slow-2g', '2g', '3g'].includes(connection.effectiveType)) ||
        (hardwareConcurrency && hardwareConcurrency < 4);

      setIsLowPerformanceDevice(isLowPerf);
    };

    detectDeviceCapabilities();
  }, []);

  // Optimized intersection observer for lazy loading
  const createIntersectionObserver = useCallback((
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ) => {
    if (!enableImageLazyLoading || !('IntersectionObserver' in window)) {
      return null;
    }

    return new IntersectionObserver(callback, {
      threshold: intersectionThreshold,
      rootMargin: '50px',
      ...options
    });
  }, [enableImageLazyLoading, intersectionThreshold]);

  // Memoization utilities
  const memoize = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    maxCacheSize = 10
  ): T => {
    if (!enableMemoization) return fn;

    const cache = new Map();
    
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = fn(...args);
      
      // LRU cache implementation
      if (cache.size >= maxCacheSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      cache.set(key, result);
      return result;
    }) as T;
  }, [enableMemoization]);

  // Performance-aware debouncing
  const performanceDebounce = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    delay?: number
  ) => {
    const actualDelay = isLowPerformanceDevice ? (delay || debounceDelay) * 1.5 : (delay || debounceDelay);
    return useDebounce(fn, actualDelay);
  }, [isLowPerformanceDevice, debounceDelay]);

  // Image optimization utilities
  const optimizeImageSrc = useCallback((src: string, width?: number, height?: number) => {
    if (!src) return src;

    // In a real app, you might use a service like Cloudinary or similar
    // For now, we'll just return the original src
    // But you could add query parameters for optimization:
    // return `${src}?w=${width}&h=${height}&q=${isLowPerformanceDevice ? 70 : 85}&f=webp`;
    
    return src;
  }, [isLowPerformanceDevice]);

  // Resource prioritization
  const shouldRenderComponent = useCallback((priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!isLowPerformanceDevice) return true;
    
    // On low-performance devices, skip low-priority components
    return priority !== 'low';
  }, [isLowPerformanceDevice]);

  // Bundle splitting utilities
  const loadComponentAsync = useCallback(async <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: T
  ): Promise<T> => {
    try {
      const module = await importFn();
      return module.default;
    } catch (error) {
      console.warn('Failed to load component:', error);
      return fallback as T;
    }
  }, []);

  return {
    isLowPerformanceDevice,
    config: {
      enableImageLazyLoading,
      enableVirtualization,
      enableMemoization,
      debounceDelay: isLowPerformanceDevice ? debounceDelay * 1.5 : debounceDelay,
      intersectionThreshold
    },
    createIntersectionObserver,
    memoize,
    performanceDebounce,
    optimizeImageSrc,
    shouldRenderComponent,
    loadComponentAsync
  };
};

// Hook for component-level performance optimization
export const useComponentPerformance = (componentName: string) => {
  const [renderTime, setRenderTime] = useState(0);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    setRenderCount(prev => prev + 1);

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setRenderTime(duration);

      if (process.env.NODE_ENV === 'development' && duration > 16) {
        console.warn(`${componentName} render took ${duration.toFixed(2)}ms (target: <16ms)`);
      }
    };
  });

  return {
    renderTime,
    renderCount,
    isOptimal: renderTime < 16 // 60fps target
  };
};
import React, { useEffect } from 'react';
import { measureWebVitals, getMemoryUsage } from '@/utils/performanceHelpers';

interface PerformanceData {
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  ttfb: number;
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
}

// Production performance monitoring (non-intrusive)
export const ProductionPerformanceMonitor = () => {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    const collectPerformanceData = async () => {
      try {
        const webVitals = await measureWebVitals();
        const memory = getMemoryUsage();
        
        const performanceData: PerformanceData = {
          ...webVitals,
          memory: memory || undefined,
        };

        // Log performance issues
        const issues = [];
        if (webVitals.fcp > 1800) issues.push(`Slow FCP: ${webVitals.fcp}ms`);
        if (webVitals.lcp > 2500) issues.push(`Slow LCP: ${webVitals.lcp}ms`);
        if (webVitals.cls > 0.1) issues.push(`High CLS: ${webVitals.cls}`);
        if (memory && memory.used > 100) issues.push(`High memory: ${memory.used}MB`);

        if (issues.length > 0) {
          console.warn('Performance issues detected:', issues);
        }

        // In a real app, you'd send this to analytics
        // analytics.track('performance_metrics', performanceData);
        
      } catch (error) {
        console.warn('Performance monitoring failed:', error);
      }
    };

    // Collect performance data after initial load
    setTimeout(collectPerformanceData, 3000);

    // Set up periodic monitoring
    const interval = setInterval(collectPerformanceData, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  // Component doesn't render anything in production
  return null;
};

// Development performance overlay
export const DevPerformanceOverlay = () => {
  const [metrics, setMetrics] = React.useState<PerformanceData | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateMetrics = async () => {
      const webVitals = await measureWebVitals();
      const memory = getMemoryUsage();
      setMetrics({ ...webVitals, memory: memory || undefined });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !metrics) return null;

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:opacity-80 transition-opacity"
        title="Performance Metrics"
      >
        📊
      </button>

      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 bg-card border border-border p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="font-semibold mb-2 text-sm">Performance</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>FCP:</span>
              <span className={metrics.fcp > 1800 ? 'text-destructive' : 'text-green-500'}>
                {metrics.fcp.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>LCP:</span>
              <span className={metrics.lcp > 2500 ? 'text-destructive' : 'text-green-500'}>
                {metrics.lcp.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>CLS:</span>
              <span className={metrics.cls > 0.1 ? 'text-destructive' : 'text-green-500'}>
                {metrics.cls.toFixed(3)}
              </span>
            </div>
            {metrics.memory && (
              <div className="flex justify-between">
                <span>Memory:</span>
                <span className={metrics.memory.used > 100 ? 'text-destructive' : 'text-green-500'}>
                  {metrics.memory.used}MB
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
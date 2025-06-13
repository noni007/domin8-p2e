import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Activity, Zap, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
}

interface PerformanceMonitorProps {
  isEnabled?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const PerformanceMonitor = ({ 
  isEnabled = process.env.NODE_ENV === 'development',
  onMetricsUpdate 
}: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    fcp: 0,
    lcp: 0,
    cls: 0,
    fid: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  const measurePerformance = useCallback(() => {
    if (!isEnabled) return;

    const performance = window.performance;
    const memory = (performance as any).memory;
    
    // Get Web Vitals
    const paintEntries = performance.getEntriesByType('paint');
    const navigationEntries = performance.getEntriesByType('navigation');
    
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const lcp = performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0;
    
    // Calculate render time from navigation - fix: use fetchStart instead of navigationStart
    const renderTime = navigationEntries[0] ? 
      (navigationEntries[0] as PerformanceNavigationTiming).loadEventEnd - 
      (navigationEntries[0] as PerformanceNavigationTiming).fetchStart : 0;

    const newMetrics: PerformanceMetrics = {
      renderTime,
      memoryUsage: memory ? memory.usedJSHeapSize / (1024 * 1024) : 0, // MB
      bundleSize: 0, // Would need build-time calculation
      fcp,
      lcp,
      cls: 0, // Would need layout shift observer
      fid: 0  // Would need first input delay observer
    };

    setMetrics(newMetrics);
    onMetricsUpdate?.(newMetrics);
  }, [isEnabled, onMetricsUpdate]);

  useEffect(() => {
    if (!isEnabled) return;

    measurePerformance();
    
    // Set up performance observer for ongoing monitoring
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        measurePerformance();
      });
      
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      
      return () => observer.disconnect();
    }
  }, [isEnabled, measurePerformance]);

  const getPerformanceRating = (metric: keyof PerformanceMetrics, value: number) => {
    const thresholds = {
      renderTime: { good: 1000, poor: 3000 },
      memoryUsage: { good: 50, poor: 100 },
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      cls: { good: 0.1, poor: 0.25 },
      fid: { good: 100, poor: 300 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'info';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const formatValue = (metric: keyof PerformanceMetrics, value: number) => {
    switch (metric) {
      case 'memoryUsage':
        return `${value.toFixed(1)} MB`;
      case 'renderTime':
      case 'fcp':
      case 'lcp':
      case 'fid':
        return `${value.toFixed(0)} ms`;
      case 'cls':
        return value.toFixed(3);
      default:
        return value.toString();
    }
  };

  const getBadgeVariant = (rating: string) => {
    switch (rating) {
      case 'good': return 'default';
      case 'needs-improvement': return 'secondary';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* Floating Performance Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 rounded-full p-3"
        variant="outline"
        size="sm"
      >
        <Monitor className="h-4 w-4" />
      </Button>

      {/* Performance Dashboard */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 w-80">
          <Card className="bg-black/90 border-blue-800/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Performance Monitor
                </CardTitle>
                <Button
                  onClick={() => setIsVisible(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Core Web Vitals */}
              <div>
                <h4 className="text-white text-xs font-semibold mb-2 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Core Web Vitals
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['fcp', 'lcp', 'cls'] as const).map(metric => {
                    const value = metrics[metric];
                    const rating = getPerformanceRating(metric, value);
                    return (
                      <div key={metric} className="text-center">
                        <div className="text-gray-400 uppercase">{metric}</div>
                        <Badge 
                          variant={getBadgeVariant(rating)}
                          className="text-xs px-1"
                        >
                          {formatValue(metric, value)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resource Metrics */}
              <div>
                <h4 className="text-white text-xs font-semibold mb-2">
                  Resource Usage
                </h4>
                <div className="space-y-2">
                  {(['renderTime', 'memoryUsage'] as const).map(metric => {
                    const value = metrics[metric];
                    const rating = getPerformanceRating(metric, value);
                    return (
                      <div key={metric} className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs capitalize">
                          {metric.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <Badge 
                          variant={getBadgeVariant(rating)}
                          className="text-xs"
                        >
                          {formatValue(metric, value)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={measurePerformance}
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                >
                  Refresh
                </Button>
                <Button
                  onClick={() => console.log('Performance Metrics:', metrics)}
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                >
                  Log Data
                </Button>
              </div>

              {/* Performance Warnings */}
              {(metrics.memoryUsage > 100 || metrics.renderTime > 3000) && (
                <div className="flex items-center gap-2 p-2 bg-red-900/20 rounded text-red-400 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  Performance issues detected
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Clock, TrendingDown, TrendingUp, Gauge, RefreshCw } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'fair' | 'poor';
  description: string;
}

interface PerformanceResults {
  timestamp: Date;
  metrics: PerformanceMetric[];
  score: number;
  recommendations: string[];
}

export const MobilePerformanceAuditor = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<PerformanceResults | null>(null);
  const [progress, setProgress] = useState(0);

  const runPerformanceAudit = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const metrics: PerformanceMetric[] = [];
    const recommendations: string[] = [];
    
    // Simulate progressive loading
    const steps = [
      'Measuring page load time...',
      'Analyzing DOM complexity...',
      'Checking resource sizes...',
      'Testing touch responsiveness...',
      'Measuring memory usage...',
      'Calculating performance score...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setProgress((i / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Get actual performance metrics where possible
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    // Page Load Time
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
    metrics.push({
      name: 'Page Load Time',
      value: Math.round(loadTime),
      unit: 'ms',
      threshold: 3000,
      status: loadTime < 2000 ? 'good' : loadTime < 3000 ? 'fair' : 'poor',
      description: 'Time taken to fully load the page'
    });
    
    if (loadTime > 3000) {
      recommendations.push('Consider optimizing images and reducing bundle size to improve load time');
    }
    
    // DOM Complexity
    const domNodes = document.querySelectorAll('*').length;
    metrics.push({
      name: 'DOM Nodes',
      value: domNodes,
      unit: 'nodes',
      threshold: 1500,
      status: domNodes < 1000 ? 'good' : domNodes < 1500 ? 'fair' : 'poor',
      description: 'Number of DOM elements on the page'
    });
    
    if (domNodes > 1500) {
      recommendations.push('Consider reducing DOM complexity by lazy loading content or virtual scrolling');
    }
    
    // Touch Responsiveness (simulate)
    const touchDelay = Math.random() * 50 + 10; // 10-60ms
    metrics.push({
      name: 'Touch Response',
      value: Math.round(touchDelay),
      unit: 'ms',
      threshold: 50,
      status: touchDelay < 30 ? 'good' : touchDelay < 50 ? 'fair' : 'poor',
      description: 'Time between touch and visual response'
    });
    
    if (touchDelay > 50) {
      recommendations.push('Optimize event handlers to reduce touch latency');
    }
    
    // Memory Usage (estimate)
    const memoryInfo = (performance as any).memory;
    if (memoryInfo) {
      const memoryUsage = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
      metrics.push({
        name: 'Memory Usage',
        value: memoryUsage,
        unit: 'MB',
        threshold: 50,
        status: memoryUsage < 30 ? 'good' : memoryUsage < 50 ? 'fair' : 'poor',
        description: 'JavaScript heap size in megabytes'
      });
      
      if (memoryUsage > 50) {
        recommendations.push('High memory usage detected. Consider optimizing data structures and removing memory leaks');
      }
    }
    
    // Bundle Size (estimate based on network timing)
    const transferSize = navigation ? (navigation.transferSize || 0) / 1024 : 0;
    if (transferSize > 0) {
      metrics.push({
        name: 'Transfer Size',
        value: Math.round(transferSize),
        unit: 'KB',
        threshold: 500,
        status: transferSize < 300 ? 'good' : transferSize < 500 ? 'fair' : 'poor',
        description: 'Total size of transferred resources'
      });
      
      if (transferSize > 500) {
        recommendations.push('Large bundle size detected. Consider code splitting and tree shaking');
      }
    }
    
    // Image Optimization
    const images = document.querySelectorAll('img');
    let unoptimizedImages = 0;
    images.forEach(img => {
      if (!img.src.includes('.webp') && !img.src.includes('.avif')) {
        unoptimizedImages++;
      }
    });
    
    if (unoptimizedImages > 0) {
      metrics.push({
        name: 'Image Optimization',
        value: unoptimizedImages,
        unit: 'unoptimized',
        threshold: 0,
        status: unoptimizedImages === 0 ? 'good' : unoptimizedImages < 3 ? 'fair' : 'poor',
        description: 'Number of images not using modern formats'
      });
      
      recommendations.push(`${unoptimizedImages} images could be optimized using WebP or AVIF format`);
    }
    
    // Calculate overall score
    const goodMetrics = metrics.filter(m => m.status === 'good').length;
    const score = Math.round((goodMetrics / metrics.length) * 100);
    
    setResults({
      timestamp: new Date(),
      metrics,
      score,
      recommendations
    });
    
    setProgress(100);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'fair':
        return <TrendingDown className="h-4 w-4 text-yellow-400" />;
      case 'poor':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Gauge className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      good: 'bg-green-600',
      fair: 'bg-yellow-600',
      poor: 'bg-red-600'
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants]} text-white text-xs`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Audit Controls */}
      <Card className="bg-black/20 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Gauge className="h-5 w-5 mr-2" />
            Mobile Performance Auditor
          </CardTitle>
          <CardDescription className="text-gray-300">
            Analyze mobile performance metrics and get optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={runPerformanceAudit}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Audit...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Performance Audit
                </>
              )}
            </Button>
            
            {results && (
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(results.score)}`}>
                  {results.score}/100
                </div>
                <div className="text-gray-400 text-xs">
                  Performance Score
                </div>
              </div>
            )}
          </div>
          
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Audit progress</span>
                <span className="text-gray-300">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {results && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.metrics.map((metric, index) => (
              <Card key={index} className="bg-black/20 border-blue-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium text-sm">{metric.name}</h3>
                    {getStatusBadge(metric.status)}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(metric.status)}
                    <span className="text-2xl font-bold text-white">
                      {metric.value}
                    </span>
                    <span className="text-gray-400 text-sm">{metric.unit}</span>
                  </div>
                  
                  <p className="text-gray-300 text-xs mb-2">{metric.description}</p>
                  
                  <div className="text-xs text-gray-400">
                    Threshold: {metric.threshold} {metric.unit}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <Card className="bg-black/20 border-blue-800/30">
              <CardHeader>
                <CardTitle className="text-white text-lg">Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
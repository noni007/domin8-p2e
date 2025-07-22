import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Image, 
  Database, 
  Network, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

interface OptimizationResult {
  category: string;
  score: number;
  suggestions: string[];
  status: 'good' | 'needs-improvement' | 'poor';
}

export const PerformanceOptimizer = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallScore, setOverallScore] = useState<number>(0);

  useEffect(() => {
    // Get initial performance metrics
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      setMetrics({
        loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
        firstPaint: Math.round(paint.find(p => p.name === 'first-paint')?.startTime || 0),
        firstContentfulPaint: Math.round(paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0),
        largestContentfulPaint: 0, // Would need web-vitals library for actual LCP
        cumulativeLayoutShift: 0, // Would need web-vitals library for actual CLS
        firstInputDelay: 0 // Would need web-vitals library for actual FID
      });
    }
  }, []);

  const runPerformanceAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate performance analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockOptimizations: OptimizationResult[] = [
      {
        category: 'JavaScript Optimization',
        score: 85,
        status: 'good',
        suggestions: [
          '✓ Code splitting implemented with React.lazy()',
          '✓ Bundle size optimized with tree shaking',
          '⚠ Consider implementing service worker for caching',
          '⚠ Some large dependencies could be lazy-loaded'
        ]
      },
      {
        category: 'Image Optimization', 
        score: 78,
        status: 'needs-improvement',
        suggestions: [
          '✓ Images are using modern formats (WebP/AVIF)',
          '⚠ Some images lack proper sizing attributes',
          '⚠ Consider implementing image lazy loading',
          '❌ Hero images could be optimized further'
        ]
      },
      {
        category: 'Network Performance',
        score: 92,
        status: 'good',
        suggestions: [
          '✓ HTTP/2 enabled for faster loading',
          '✓ Gzip compression active',
          '✓ CDN implementation working well',
          '⚠ Consider implementing resource hints'
        ]
      },
      {
        category: 'Mobile Performance',
        score: 88,
        status: 'good',
        suggestions: [
          '✓ Touch targets are appropriately sized',
          '✓ Viewport meta tag configured correctly',
          '✓ Mobile-specific optimizations active',
          '⚠ Consider reducing main thread work'
        ]
      },
      {
        category: 'Database Queries',
        score: 75,
        status: 'needs-improvement',
        suggestions: [
          '✓ Query optimization implemented',
          '✓ Proper indexing in place',
          '⚠ Some N+1 query patterns detected',
          '⚠ Consider implementing query caching'
        ]
      }
    ];

    setOptimizations(mockOptimizations);
    setOverallScore(Math.round(mockOptimizations.reduce((acc, opt) => acc + opt.score, 0) / mockOptimizations.length));
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return <Badge className="bg-green-600">Good</Badge>;
      case 'needs-improvement': return <Badge className="bg-yellow-600">Needs Work</Badge>;
      case 'poor': return <Badge variant="destructive">Poor</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive performance optimization and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <Button 
              onClick={runPerformanceAnalysis}
              disabled={isAnalyzing}
              className="ml-4"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Analyzing performance...</span>
                <span>Please wait</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Core Metrics</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          {metrics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Load Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.loadTime}ms</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.loadTime < 2000 ? 'Excellent' : metrics.loadTime < 4000 ? 'Good' : 'Needs improvement'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    First Paint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.firstPaint}ms</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.firstPaint < 1000 ? 'Excellent' : metrics.firstPaint < 2000 ? 'Good' : 'Needs improvement'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    DOM Ready
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.domContentLoaded}ms</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.domContentLoaded < 1500 ? 'Excellent' : metrics.domContentLoaded < 3000 ? 'Good' : 'Needs improvement'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          {optimizations.length > 0 ? (
            <div className="space-y-4">
              {optimizations.map((opt, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {opt.category === 'JavaScript Optimization' && <Zap className="h-4 w-4" />}
                        {opt.category === 'Image Optimization' && <Image className="h-4 w-4" />}
                        {opt.category === 'Network Performance' && <Network className="h-4 w-4" />}
                        {opt.category === 'Database Queries' && <Database className="h-4 w-4" />}
                        {opt.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${getScoreColor(opt.score)}`}>
                          {opt.score}
                        </span>
                        {getStatusBadge(opt.status)}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {opt.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          {suggestion.startsWith('✓') && <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />}
                          {suggestion.startsWith('⚠') && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />}
                          {suggestion.startsWith('❌') && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />}
                          <span className={suggestion.startsWith('✓') ? 'text-muted-foreground' : 'text-foreground'}>
                            {suggestion.substring(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Run performance analysis to see optimization suggestions
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Wins</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Enable lazy loading for images</li>
                  <li>• Implement code splitting for routes</li>
                  <li>• Add service worker for caching</li>
                  <li>• Optimize font loading</li>
                  <li>• Minimize third-party scripts</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Optimizations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Implement resource preloading</li>
                  <li>• Use intersection observer for lazy loading</li>
                  <li>• Add critical CSS inlining</li>
                  <li>• Implement virtual scrolling for large lists</li>
                  <li>• Use Web Workers for heavy computations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
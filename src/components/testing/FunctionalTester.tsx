
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
}

export const FunctionalTester = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Database Connection', status: 'pending' },
    { name: 'Authentication Flow', status: 'pending' },
    { name: 'Real-time Subscriptions', status: 'pending' },
    { name: 'Tournament API', status: 'pending' },
    { name: 'Responsive Design', status: 'pending' },
    { name: 'Performance Metrics', status: 'pending' }
  ]);

  const updateTestStatus = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  const runDatabaseTest = async (testIndex: number) => {
    const startTime = performance.now();
    updateTestStatus(testIndex, { status: 'running' });

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id')
        .limit(1);

      if (error) throw error;

      updateTestStatus(testIndex, { 
        status: 'passed', 
        duration: performance.now() - startTime 
      });
    } catch (error) {
      updateTestStatus(testIndex, { 
        status: 'failed', 
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const runAuthTest = async (testIndex: number) => {
    const startTime = performance.now();
    updateTestStatus(testIndex, { status: 'running' });

    try {
      const { data, error } = await supabase.auth.getUser();
      
      // Test passes if we can get user info (even if null)
      if (error && error.message !== 'Auth session missing!') throw error;

      updateTestStatus(testIndex, { 
        status: 'passed', 
        duration: performance.now() - startTime 
      });
    } catch (error) {
      updateTestStatus(testIndex, { 
        status: 'failed', 
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const runRealtimeTest = async (testIndex: number) => {
    const startTime = performance.now();
    updateTestStatus(testIndex, { status: 'running' });

    try {
      const channel = supabase.channel(`test-${Date.now()}`);
      
      const subscribed = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 3000);
        
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            resolve(true);
          }
        });
      });

      supabase.removeChannel(channel);

      if (!subscribed) throw new Error('Real-time subscription timeout');

      updateTestStatus(testIndex, { 
        status: 'passed', 
        duration: performance.now() - startTime 
      });
    } catch (error) {
      updateTestStatus(testIndex, { 
        status: 'failed', 
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const runTournamentAPITest = async (testIndex: number) => {
    const startTime = performance.now();
    updateTestStatus(testIndex, { status: 'running' });

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, title, status')
        .limit(5);

      if (error) throw error;

      updateTestStatus(testIndex, { 
        status: 'passed', 
        duration: performance.now() - startTime 
      });
    } catch (error) {
      updateTestStatus(testIndex, { 
        status: 'failed', 
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const runResponsiveTest = async (testIndex: number) => {
    const startTime = performance.now();
    updateTestStatus(testIndex, { status: 'running' });

    try {
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth < 768;
      const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
      const isDesktop = viewportWidth >= 1024;

      // Check if mobile navigation exists on mobile
      if (isMobile) {
        const mobileMenu = document.querySelector('[data-mobile-menu]');
        if (!mobileMenu) throw new Error('Mobile menu not found');
      }

      // Test responsive grid layouts
      const gridElements = document.querySelectorAll('.grid');
      let hasResponsiveGrid = false;
      
      gridElements.forEach(grid => {
        const styles = window.getComputedStyle(grid);
        if (styles.gridTemplateColumns.includes('repeat') || 
            styles.display === 'grid') {
          hasResponsiveGrid = true;
        }
      });

      if (!hasResponsiveGrid) throw new Error('No responsive grid layouts found');

      updateTestStatus(testIndex, { 
        status: 'passed', 
        duration: performance.now() - startTime 
      });
    } catch (error) {
      updateTestStatus(testIndex, { 
        status: 'failed', 
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const runPerformanceTest = async (testIndex: number) => {
    const startTime = performance.now();
    updateTestStatus(testIndex, { status: 'running' });

    try {
      // Test Core Web Vitals
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;
      
      const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
      
      if (loadTime > 5000) throw new Error(`Load time too slow: ${loadTime}ms`);
      if (fcp > 3000) throw new Error(`FCP too slow: ${fcp}ms`);

      // Check memory usage
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize > 100 * 1024 * 1024) {
        throw new Error(`Memory usage too high: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
      }

      updateTestStatus(testIndex, { 
        status: 'passed', 
        duration: performance.now() - startTime 
      });
    } catch (error) {
      updateTestStatus(testIndex, { 
        status: 'failed', 
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    const testFunctions = [
      runDatabaseTest,
      runAuthTest,
      runRealtimeTest,
      runTournamentAPITest,
      runResponsiveTest,
      runPerformanceTest
    ];

    for (let i = 0; i < testFunctions.length; i++) {
      await testFunctions[i](i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary" className="bg-yellow-600">Running</Badge>;
      case 'passed':
        return <Badge variant="default" className="bg-green-600">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-36 right-4 z-50"
        variant="outline"
        size="sm"
      >
        <Play className="h-4 w-4 mr-2" />
        Functional Tests
      </Button>
    );
  }

  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;

  return (
    <div className="fixed bottom-36 right-4 z-50 w-96 max-h-[70vh] overflow-y-auto">
      <Card className="bg-black/90 border-green-800/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Play className="h-4 w-4" />
              Functional Tests
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
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              size="sm"
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>

          {/* Test Results Summary */}
          {(passedTests > 0 || failedTests > 0) && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-800/30 rounded">
              <div className="text-center">
                <div className="text-white font-semibold">{totalTests}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-semibold">{passedTests}</div>
                <div className="text-xs text-gray-400">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-semibold">{failedTests}</div>
                <div className="text-xs text-gray-400">Failed</div>
              </div>
            </div>
          )}

          {/* Individual Tests */}
          <div className="space-y-2">
            {tests.map((test, index) => (
              <div key={index} className="p-3 bg-gray-800/30 rounded">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <span className="text-white text-sm">{test.name}</span>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
                
                {test.duration && (
                  <div className="text-xs text-gray-400">
                    Duration: {test.duration.toFixed(0)}ms
                  </div>
                )}
                
                {test.error && (
                  <div className="text-xs text-red-400 mt-1">
                    Error: {test.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

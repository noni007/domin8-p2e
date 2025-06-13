
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube2, PlayCircle, PauseCircle, RotateCcw } from 'lucide-react';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ErrorBoundaryTester } from './ErrorBoundaryTester';
import { AccessibilityTester } from './AccessibilityTester';

interface TestSuite {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  tests: number;
  passed: number;
  failed: number;
  duration?: number;
}

export const TestingSuite = () => {
  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV === 'development');
  const [isRunning, setIsRunning] = useState(false);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: 'components',
      name: 'Component Tests',
      status: 'idle',
      tests: 0,
      passed: 0,
      failed: 0
    },
    {
      id: 'integration',
      name: 'Integration Tests',
      status: 'idle',
      tests: 0,
      passed: 0,
      failed: 0
    },
    {
      id: 'e2e',
      name: 'End-to-End Tests',
      status: 'idle',
      tests: 0,
      passed: 0,
      failed: 0
    }
  ]);

  const runAllTests = async () => {
    setIsRunning(true);
    
    for (const suite of testSuites) {
      setTestSuites(prev => prev.map(s => 
        s.id === suite.id 
          ? { ...s, status: 'running' as const }
          : s
      ));

      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = {
        tests: Math.floor(Math.random() * 20) + 5,
        passed: 0,
        failed: 0
      };
      
      mockResults.passed = Math.floor(mockResults.tests * (0.7 + Math.random() * 0.3));
      mockResults.failed = mockResults.tests - mockResults.passed;

      setTestSuites(prev => prev.map(s => 
        s.id === suite.id 
          ? { 
              ...s, 
              status: mockResults.failed === 0 ? 'passed' as const : 'failed' as const,
              ...mockResults,
              duration: Math.floor(Math.random() * 5000) + 1000
            }
          : s
      ));
    }
    
    setIsRunning(false);
  };

  const resetTests = () => {
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      status: 'idle' as const,
      tests: 0,
      passed: 0,
      failed: 0,
      duration: undefined
    })));
  };

  const getStatusBadge = (status: TestSuite['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'passed':
        return <Badge variant="default" className="bg-green-600">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  const getTotalStats = () => {
    return testSuites.reduce((acc, suite) => ({
      tests: acc.tests + suite.tests,
      passed: acc.passed + suite.passed,
      failed: acc.failed + suite.failed
    }), { tests: 0, passed: 0, failed: 0 });
  };

  if (!isVisible) {
    return (
      <>
        {/* Main Testing Panel Toggle */}
        <Button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-52 right-4 z-50"
          variant="outline"
          size="sm"
        >
          <TestTube2 className="h-4 w-4 mr-2" />
          Testing Suite
        </Button>

        {/* Individual Test Components */}
        <PerformanceMonitor />
        <ErrorBoundaryTester />
        <AccessibilityTester />
      </>
    );
  }

  const totalStats = getTotalStats();

  return (
    <>
      <div className="fixed bottom-52 right-4 z-50 w-96">
        <Card className="bg-black/90 border-green-800/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TestTube2 className="h-4 w-4" />
                Testing & Validation Suite
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
            {/* Test Controls */}
            <div className="flex gap-2">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                size="sm"
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <PauseCircle className="h-4 w-4 mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
              <Button
                onClick={resetTests}
                size="sm"
                variant="outline"
                disabled={isRunning}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Overall Stats */}
            {totalStats.tests > 0 && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-gray-800/30 rounded">
                <div className="text-center">
                  <div className="text-white font-semibold">{totalStats.tests}</div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-semibold">{totalStats.passed}</div>
                  <div className="text-xs text-gray-400">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 font-semibold">{totalStats.failed}</div>
                  <div className="text-xs text-gray-400">Failed</div>
                </div>
              </div>
            )}

            {/* Test Suites */}
            <div>
              <h4 className="text-white text-xs font-semibold mb-2">
                Test Suites
              </h4>
              <div className="space-y-2">
                {testSuites.map((suite) => (
                  <div key={suite.id} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm">{suite.name}</span>
                        {getStatusBadge(suite.status)}
                      </div>
                      {suite.tests > 0 && (
                        <div className="text-xs text-gray-400">
                          {suite.passed}/{suite.tests} passed
                          {suite.duration && ` • ${suite.duration}ms`}
                        </div>
                      )}
                    </div>
                    {suite.status === 'running' && (
                      <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-white text-xs font-semibold mb-2">
                Quick Tests
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  Component Test
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  API Test
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Performance
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Accessibility
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Test Components */}
      <PerformanceMonitor />
      <ErrorBoundaryTester />
      <AccessibilityTester />
    </>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Bug, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Component that throws errors for testing
const ErrorThrowingComponent = ({ errorType }: { errorType: string }) => {
  switch (errorType) {
    case 'render':
      throw new Error('Render error: Component failed to render');
    case 'async':
      React.useEffect(() => {
        setTimeout(() => {
          throw new Error('Async error: Promise rejection');
        }, 100);
      }, []);
      return <div>Loading...</div>;
    case 'network':
      throw new Error('Network error: Failed to fetch data');
    case 'memory':
      // Simulate memory leak
      React.useEffect(() => {
        const interval = setInterval(() => {
          // Create memory pressure
          const largeArray = new Array(1000000).fill('test');
        }, 10);
        return () => clearInterval(interval);
      }, []);
      return <div>Memory pressure test running...</div>;
    default:
      return <div>No error - component working normally</div>;
  }
};

interface TestResult {
  type: string;
  status: 'passed' | 'failed' | 'pending';
  message: string;
  timestamp: Date;
}

export const ErrorBoundaryTester = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV === 'development');

  const runErrorTest = (errorType: string) => {
    const testId = `test-${errorType}-${Date.now()}`;
    
    // Add pending test
    setTestResults(prev => [...prev, {
      type: errorType,
      status: 'pending',
      message: `Testing ${errorType} error handling...`,
      timestamp: new Date()
    }]);

    // Simulate test completion
    setTimeout(() => {
      setTestResults(prev => prev.map(test => 
        test.type === errorType && test.status === 'pending'
          ? {
              ...test,
              status: Math.random() > 0.3 ? 'passed' : 'failed',
              message: Math.random() > 0.3 
                ? `${errorType} error properly caught and handled`
                : `${errorType} error handling failed - check error boundary implementation`
            }
          : test
      ));
    }, 1500);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending': return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      passed: 'default' as const,
      failed: 'destructive' as const,
      pending: 'secondary' as const
    };
    return variants[status];
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-50"
        variant="outline"
        size="sm"
      >
        <Bug className="h-4 w-4 mr-2" />
        Error Tests
      </Button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-96">
      <Card className="bg-black/90 border-red-800/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Error Boundary Testing
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
          <div>
            <h4 className="text-white text-xs font-semibold mb-2">
              Error Simulation Tests
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {['render', 'async', 'network', 'memory'].map(errorType => (
                <Button
                  key={errorType}
                  onClick={() => runErrorTest(errorType)}
                  size="sm"
                  variant="outline"
                  className="text-xs capitalize"
                >
                  {errorType} Error
                </Button>
              ))}
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white text-xs font-semibold">
                  Test Results
                </h4>
                <Button
                  onClick={clearResults}
                  size="sm"
                  variant="ghost"
                  className="text-xs text-gray-400"
                >
                  Clear
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {testResults.slice(-5).map((result, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-gray-800/30 rounded text-xs">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white capitalize font-medium">
                          {result.type}
                        </span>
                        <Badge variant={getStatusBadge(result.status)} className="text-xs">
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-gray-400 break-words">
                        {result.message}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {result.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Error Test */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-2">
              Live Error Boundary Test
            </h4>
            <ErrorBoundary fallback={
              <Alert className="bg-green-900/20 border-green-800/30">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400 text-xs">
                  Error boundary working correctly!
                </AlertDescription>
              </Alert>
            }>
              <ErrorThrowingComponent errorType="render" />
            </ErrorBoundary>
          </div>

          {/* Test Statistics */}
          <div className="pt-2 border-t border-gray-700">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">
                Passed: {testResults.filter(r => r.status === 'passed').length}
              </span>
              <span className="text-gray-400">
                Failed: {testResults.filter(r => r.status === 'failed').length}
              </span>
              <span className="text-gray-400">
                Total: {testResults.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

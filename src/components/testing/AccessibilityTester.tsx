
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface A11yIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  rule: string;
}

interface A11yTestResult {
  passed: number;
  warnings: number;
  errors: number;
  issues: A11yIssue[];
  timestamp: Date;
}

export const AccessibilityTester = () => {
  const [testResult, setTestResult] = useState<A11yTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV === 'development');

  const runA11yTest = useCallback(async () => {
    setIsRunning(true);
    
    try {
      // Simulate accessibility testing
      // In a real implementation, you'd use axe-core or similar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock test results
      const mockIssues: A11yIssue[] = [
        {
          type: 'error',
          message: 'Image missing alt text',
          element: 'img',
          rule: 'image-alt'
        },
        {
          type: 'warning',
          message: 'Color contrast may be insufficient',
          element: 'button.text-gray-400',
          rule: 'color-contrast'
        },
        {
          type: 'info',
          message: 'Consider adding skip navigation link',
          element: 'nav',
          rule: 'skip-link'
        }
      ];

      const result: A11yTestResult = {
        passed: Math.floor(Math.random() * 20) + 15,
        warnings: mockIssues.filter(i => i.type === 'warning').length,
        errors: mockIssues.filter(i => i.type === 'error').length,
        issues: mockIssues,
        timestamp: new Date()
      };

      setTestResult(result);
    } catch (error) {
      console.error('Accessibility test failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const getIssueIcon = (type: A11yIssue['type']) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getIssueVariant = (type: A11yIssue['type']) => {
    switch (type) {
      case 'error': return 'destructive' as const;
      case 'warning': return 'secondary' as const;
      case 'info': return 'outline' as const;
    }
  };

  const getOverallScore = () => {
    if (!testResult) return 0;
    const total = testResult.passed + testResult.warnings + testResult.errors;
    return total > 0 ? Math.round((testResult.passed / total) * 100) : 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-36 right-4 z-50"
        variant="outline"
        size="sm"
      >
        <Eye className="h-4 w-4 mr-2" />
        A11y Test
      </Button>
    );
  }

  return (
    <div className="fixed bottom-36 right-4 z-50 w-96">
      <Card className="bg-black/90 border-purple-800/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Accessibility Testing
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
              onClick={runA11yTest}
              disabled={isRunning}
              className="flex-1"
              size="sm"
            >
              {isRunning ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                'Run A11y Audit'
              )}
            </Button>
          </div>

          {/* Test Results Summary */}
          {testResult && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white text-sm font-semibold">
                  Audit Results
                </h4>
                <div className={`text-lg font-bold ${getScoreColor(getOverallScore())}`}>
                  {getOverallScore()}%
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-green-900/20 rounded">
                  <div className="text-green-400 font-semibold">{testResult.passed}</div>
                  <div className="text-xs text-gray-400">Passed</div>
                </div>
                <div className="text-center p-2 bg-yellow-900/20 rounded">
                  <div className="text-yellow-400 font-semibold">{testResult.warnings}</div>
                  <div className="text-xs text-gray-400">Warnings</div>
                </div>
                <div className="text-center p-2 bg-red-900/20 rounded">
                  <div className="text-red-400 font-semibold">{testResult.errors}</div>
                  <div className="text-xs text-gray-400">Errors</div>
                </div>
              </div>

              {/* Issues List */}
              {testResult.issues.length > 0 && (
                <div>
                  <h5 className="text-white text-xs font-semibold mb-2">
                    Issues Found
                  </h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {testResult.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-800/30 rounded">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getIssueVariant(issue.type)} className="text-xs">
                              {issue.type}
                            </Badge>
                            <span className="text-xs text-gray-400 font-mono">
                              {issue.rule}
                            </span>
                          </div>
                          <p className="text-white text-xs break-words">
                            {issue.message}
                          </p>
                          {issue.element && (
                            <p className="text-gray-400 text-xs font-mono">
                              {issue.element}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Perfect Score Message */}
              {testResult.errors === 0 && testResult.warnings === 0 && (
                <Alert className="bg-green-900/20 border-green-800/30">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-400 text-xs">
                    All accessibility checks passed!
                  </AlertDescription>
                </Alert>
              )}

              {/* Test Timestamp */}
              <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
                Last tested: {testResult.timestamp.toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Quick Tips */}
          <div className="pt-2 border-t border-gray-700">
            <h5 className="text-white text-xs font-semibold mb-2">
              Quick A11y Tips
            </h5>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Always provide alt text for images</li>
              <li>• Ensure sufficient color contrast (4.5:1)</li>
              <li>• Use semantic HTML elements</li>
              <li>• Test with keyboard navigation</li>
              <li>• Add ARIA labels for complex components</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

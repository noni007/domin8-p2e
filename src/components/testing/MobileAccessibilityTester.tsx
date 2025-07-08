import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Users, Smartphone, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface AccessibilityTest {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  issues: string[];
  severity: 'low' | 'medium' | 'high';
}

interface AccessibilityResults {
  timestamp: Date;
  tests: AccessibilityTest[];
  score: number;
  totalIssues: number;
}

export const MobileAccessibilityTester = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AccessibilityResults | null>(null);
  const [progress, setProgress] = useState(0);

  const runAccessibilityAudit = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const tests: AccessibilityTest[] = [];
    
    // Progress through different test categories
    const testCategories = [
      'Touch Target Sizes',
      'Color Contrast',
      'ARIA Labels',
      'Keyboard Navigation',
      'Screen Reader Support',
      'Focus Management'
    ];
    
    for (let i = 0; i < testCategories.length; i++) {
      setProgress((i / testCategories.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    // Test 1: Touch Target Sizes
    const touchTargets = document.querySelectorAll('button, a, [role="button"], input, select, textarea');
    const smallTargets: string[] = [];
    
    touchTargets.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent?.slice(0, 20) || 'unknown';
        smallTargets.push(`${tagName} element "${text}" is ${Math.round(rect.width)}x${Math.round(rect.height)}px`);
      }
    });
    
    tests.push({
      id: 'touch-targets',
      name: 'Touch Target Sizes',
      description: 'Ensures interactive elements are at least 44x44px for easy touch interaction',
      passed: smallTargets.length === 0,
      issues: smallTargets,
      severity: 'high'
    });
    
    // Test 2: Color Contrast (simplified check)
    const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button');
    const lowContrastElements: string[] = [];
    
    textElements.forEach((element, index) => {
      const styles = window.getComputedStyle(element);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      
      // Simple heuristic: check for light text on light background or dark on dark
      if ((color.includes('rgb(255') && backgroundColor.includes('rgb(255')) ||
          (color.includes('rgb(0') && backgroundColor.includes('rgb(0'))) {
        const text = element.textContent?.slice(0, 30) || 'unknown';
        lowContrastElements.push(`Text "${text}" may have insufficient contrast`);
      }
    });
    
    tests.push({
      id: 'color-contrast',
      name: 'Color Contrast',
      description: 'Checks for sufficient color contrast between text and background',
      passed: lowContrastElements.length === 0,
      issues: lowContrastElements.slice(0, 5), // Limit to first 5
      severity: 'medium'
    });
    
    // Test 3: ARIA Labels
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
    const missingLabels: string[] = [];
    
    interactiveElements.forEach((element) => {
      const hasAriaLabel = element.hasAttribute('aria-label');
      const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
      const hasText = element.textContent?.trim().length > 0;
      const hasAlt = element.hasAttribute('alt');
      const hasTitle = element.hasAttribute('title');
      
      if (!hasAriaLabel && !hasAriaLabelledBy && !hasText && !hasAlt && !hasTitle) {
        const tagName = element.tagName.toLowerCase();
        const className = element.className ? `.${element.className.split(' ')[0]}` : '';
        missingLabels.push(`${tagName}${className} element has no accessible label`);
      }
    });
    
    tests.push({
      id: 'aria-labels',
      name: 'ARIA Labels',
      description: 'Ensures interactive elements have accessible labels for screen readers',
      passed: missingLabels.length === 0,
      issues: missingLabels.slice(0, 10), // Limit to first 10
      severity: 'high'
    });
    
    // Test 4: Keyboard Navigation
    const focusableElements = document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const keyboardIssues: string[] = [];
    
    focusableElements.forEach((element) => {
      if (element.hasAttribute('tabindex') && parseInt(element.getAttribute('tabindex') || '0') > 0) {
        keyboardIssues.push('Positive tabindex values detected - can disrupt natural tab order');
      }
      
      const styles = window.getComputedStyle(element);
      if (styles.outline === 'none' && !styles.boxShadow.includes('ring')) {
        keyboardIssues.push('Element has no visible focus indicator');
      }
    });
    
    tests.push({
      id: 'keyboard-nav',
      name: 'Keyboard Navigation',
      description: 'Ensures all interactive elements are keyboard accessible',
      passed: keyboardIssues.length === 0,
      issues: [...new Set(keyboardIssues)], // Remove duplicates
      severity: 'medium'
    });
    
    // Test 5: Screen Reader Support
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const screenReaderIssues: string[] = [];
    
    // Check heading hierarchy
    let previousLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1 && previousLevel !== 0) {
        screenReaderIssues.push(`Heading level skipped: ${heading.tagName} after h${previousLevel}`);
      }
      previousLevel = level;
    });
    
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    let imagesWithoutAlt = 0;
    images.forEach((img) => {
      if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
        imagesWithoutAlt++;
      }
    });
    
    if (imagesWithoutAlt > 0) {
      screenReaderIssues.push(`${imagesWithoutAlt} images missing alt text`);
    }
    
    tests.push({
      id: 'screen-reader',
      name: 'Screen Reader Support',
      description: 'Checks for proper heading structure and alt text',
      passed: screenReaderIssues.length === 0,
      issues: screenReaderIssues,
      severity: 'medium'
    });
    
    // Test 6: Focus Management
    const focusIssues: string[] = [];
    
    // Check for focus traps in modals
    const modals = document.querySelectorAll('[role="dialog"], .modal, [aria-modal="true"]');
    if (modals.length > 0) {
      focusIssues.push('Modal/dialog elements detected - ensure proper focus management');
    }
    
    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href="#main"], a[href="#content"]');
    if (skipLinks.length === 0) {
      focusIssues.push('No skip link found for keyboard navigation');
    }
    
    tests.push({
      id: 'focus-management',
      name: 'Focus Management',
      description: 'Ensures proper focus handling and skip links',
      passed: focusIssues.length === 0,
      issues: focusIssues,
      severity: 'low'
    });
    
    // Calculate score and total issues
    const passedTests = tests.filter(test => test.passed).length;
    const score = Math.round((passedTests / tests.length) * 100);
    const totalIssues = tests.reduce((sum, test) => sum + test.issues.length, 0);
    
    setResults({
      timestamp: new Date(),
      tests,
      score,
      totalIssues
    });
    
    setProgress(100);
    setIsRunning(false);
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'bg-blue-600',
      medium: 'bg-yellow-600',
      high: 'bg-red-600'
    };
    
    return (
      <Badge className={`${variants[severity as keyof typeof variants]} text-white text-xs`}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Audit Controls */}
      <Card className="bg-black/20 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Mobile Accessibility Tester
          </CardTitle>
          <CardDescription className="text-gray-300">
            Test mobile accessibility features including touch targets, screen readers, and keyboard navigation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={runAccessibilityAudit}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Run Accessibility Audit
                </>
              )}
            </Button>
            
            {results && (
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(results.score)}`}>
                  {results.score}/100
                </div>
                <div className="text-gray-400 text-xs">
                  Accessibility Score
                </div>
              </div>
            )}
          </div>
          
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Testing progress</span>
                <span className="text-gray-300">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {results && (
        <>
          <div className="grid gap-4">
            {results.tests.map((test) => (
              <Card key={test.id} className="bg-black/20 border-blue-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {test.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                      <h3 className="text-white font-medium">{test.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(test.severity)}
                      <Badge className={test.passed ? 'bg-green-600' : 'bg-red-600'}>
                        {test.passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{test.description}</p>
                  
                  {test.issues.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-red-400 text-sm font-medium">
                        Issues found ({test.issues.length}):
                      </p>
                      {test.issues.slice(0, 5).map((issue, index) => (
                        <p key={index} className="text-red-300 text-xs pl-2">
                          • {issue}
                        </p>
                      ))}
                      {test.issues.length > 5 && (
                        <p className="text-gray-400 text-xs pl-2">
                          ... and {test.issues.length - 5} more issues
                        </p>
                      )}
                    </div>
                  )}
                  
                  {test.passed && (
                    <p className="text-green-400 text-sm">
                      ✓ All accessibility checks passed for this category
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card className="bg-black/20 border-blue-800/30">
            <CardHeader>
              <CardTitle className="text-white">Accessibility Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
                    {results.score}%
                  </div>
                  <div className="text-gray-400 text-sm">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">
                    {results.totalIssues}
                  </div>
                  <div className="text-gray-400 text-sm">Total Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {results.tests.filter(t => t.passed).length}/{results.tests.length}
                  </div>
                  <div className="text-gray-400 text-sm">Tests Passed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
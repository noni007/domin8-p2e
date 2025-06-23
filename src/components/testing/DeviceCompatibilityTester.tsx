
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface DeviceTest {
  name: string;
  status: 'idle' | 'testing' | 'passed' | 'failed';
  details?: string;
}

export const DeviceCompatibilityTester = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [tests, setTests] = useState<DeviceTest[]>([
    { name: 'Touch Navigation', status: 'idle' },
    { name: 'Responsive Grid', status: 'idle' },
    { name: 'Mobile Menu', status: 'idle' },
    { name: 'Font Scaling', status: 'idle' },
    { name: 'Button Accessibility', status: 'idle' },
    { name: 'Orientation Change', status: 'idle' }
  ]);

  const {
    screenSize,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    getGridCols
  } = useResponsiveLayout();

  const runCompatibilityTests = () => {
    setTests(prev => prev.map(test => ({ ...test, status: 'testing' as const })));

    // Touch Navigation Test
    setTimeout(() => {
      const touchNavPassed = isTouchDevice ? 
        document.querySelectorAll('[role="button"], button').length > 0 : true;
      
      setTests(prev => prev.map(test => 
        test.name === 'Touch Navigation' 
          ? { 
              ...test, 
              status: touchNavPassed ? 'passed' : 'failed',
              details: touchNavPassed ? 'Touch targets found' : 'No touch targets detected'
            }
          : test
      ));
    }, 500);

    // Responsive Grid Test
    setTimeout(() => {
      const grids = document.querySelectorAll('.grid');
      const hasResponsiveGrids = Array.from(grids).some(grid => {
        const styles = window.getComputedStyle(grid);
        return styles.gridTemplateColumns.includes('repeat') || 
               styles.display === 'grid';
      });

      setTests(prev => prev.map(test => 
        test.name === 'Responsive Grid' 
          ? { 
              ...test, 
              status: hasResponsiveGrids ? 'passed' : 'failed',
              details: `${grids.length} grid elements found`
            }
          : test
      ));
    }, 1000);

    // Mobile Menu Test
    setTimeout(() => {
      if (isMobile) {
        const mobileMenu = document.querySelector('[data-mobile-menu]') || 
                          document.querySelector('.mobile-menu') ||
                          document.querySelector('[aria-label*="mobile"]');
        
        setTests(prev => prev.map(test => 
          test.name === 'Mobile Menu' 
            ? { 
                ...test, 
                status: mobileMenu ? 'passed' : 'failed',
                details: mobileMenu ? 'Mobile menu found' : 'Mobile menu missing'
              }
            : test
        ));
      } else {
        setTests(prev => prev.map(test => 
          test.name === 'Mobile Menu' 
            ? { 
                ...test, 
                status: 'passed',
                details: 'Not applicable on desktop'
              }
            : test
        ));
      }
    }, 1500);

    // Font Scaling Test
    setTimeout(() => {
      const bodyFontSize = parseFloat(window.getComputedStyle(document.body).fontSize);
      const isAccessibleFontSize = bodyFontSize >= 14; // Minimum 14px for accessibility
      
      setTests(prev => prev.map(test => 
        test.name === 'Font Scaling' 
          ? { 
              ...test, 
              status: isAccessibleFontSize ? 'passed' : 'failed',
              details: `Base font size: ${bodyFontSize}px`
            }
          : test
      ));
    }, 2000);

    // Button Accessibility Test
    setTimeout(() => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      const accessibleButtons = Array.from(buttons).filter(btn => {
        const styles = window.getComputedStyle(btn);
        const height = parseFloat(styles.height);
        const width = parseFloat(styles.width);
        // Check minimum touch target size (44px recommended)
        return height >= 44 && width >= 44;
      });

      const passRate = buttons.length > 0 ? (accessibleButtons.length / buttons.length) : 0;
      
      setTests(prev => prev.map(test => 
        test.name === 'Button Accessibility' 
          ? { 
              ...test, 
              status: passRate >= 0.8 ? 'passed' : 'failed',
              details: `${accessibleButtons.length}/${buttons.length} buttons accessible`
            }
          : test
      ));
    }, 2500);

    // Orientation Change Test
    setTimeout(() => {
      const orientationSupported = 'orientation' in screen || 'orientation' in window;
      
      setTests(prev => prev.map(test => 
        test.name === 'Orientation Change' 
          ? { 
              ...test, 
              status: orientationSupported ? 'passed' : 'failed',
              details: `Current: ${orientation}, API: ${orientationSupported ? 'Available' : 'Not available'}`
            }
          : test
      ));
    }, 3000);
  };

  const resetTests = () => {
    setTests(prev => prev.map(test => ({ ...test, status: 'idle' as const, details: undefined })));
  };

  const getDeviceIcon = () => {
    if (isMobile) return <Smartphone className="h-4 w-4" />;
    if (isTablet) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getStatusBadge = (status: DeviceTest['status']) => {
    switch (status) {
      case 'testing':
        return <Badge variant="secondary" className="bg-yellow-600">Testing</Badge>;
      case 'passed':
        return <Badge variant="default" className="bg-green-600">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-50"
        variant="outline"
        size="sm"
      >
        {getDeviceIcon()}
        <span className="ml-2">Device Tests</span>
      </Button>
    );
  }

  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;

  return (
    <div className="fixed bottom-20 right-4 z-50 w-96 max-h-[70vh] overflow-y-auto">
      <Card className="bg-black/90 border-purple-800/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              {getDeviceIcon()}
              Device Compatibility
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
          {/* Device Info */}
          <div className="p-3 bg-gray-800/30 rounded">
            <div className="text-white text-xs font-semibold mb-2">Current Device</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Type: </span>
                <span className="text-white">
                  {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Size: </span>
                <span className="text-white">{screenSize.width}×{screenSize.height}</span>
              </div>
              <div>
                <span className="text-gray-400">Orientation: </span>
                <span className="text-white">{orientation}</span>
              </div>
              <div>
                <span className="text-gray-400">Touch: </span>
                <span className="text-white">{isTouchDevice ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={runCompatibilityTests}
              size="sm"
              className="flex-1"
              disabled={tests.some(t => t.status === 'testing')}
            >
              Run Device Tests
            </Button>
            <Button
              onClick={resetTests}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Results Summary */}
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

          {/* Test Results */}
          <div className="space-y-2">
            {tests.map((test, index) => (
              <div key={index} className="p-3 bg-gray-800/30 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm">{test.name}</span>
                  {getStatusBadge(test.status)}
                </div>
                {test.details && (
                  <div className="text-xs text-gray-400 mt-1">
                    {test.details}
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

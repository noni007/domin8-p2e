import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Tablet, Monitor, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface DeviceTest {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: typeof Smartphone;
  category: 'mobile' | 'tablet' | 'desktop';
}

interface TestResult {
  deviceId: string;
  passed: boolean;
  issues: string[];
  timestamp: Date;
}

const DEVICE_TESTS: DeviceTest[] = [
  // Mobile devices
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, icon: Smartphone, category: 'mobile' },
  { id: 'iphone-12', name: 'iPhone 12', width: 390, height: 844, icon: Smartphone, category: 'mobile' },
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', width: 393, height: 852, icon: Smartphone, category: 'mobile' },
  { id: 'samsung-s21', name: 'Samsung S21', width: 384, height: 854, icon: Smartphone, category: 'mobile' },
  { id: 'pixel-6', name: 'Google Pixel 6', width: 411, height: 869, icon: Smartphone, category: 'mobile' },
  
  // Tablets
  { id: 'ipad-mini', name: 'iPad Mini', width: 768, height: 1024, icon: Tablet, category: 'tablet' },
  { id: 'ipad-pro', name: 'iPad Pro', width: 1024, height: 1366, icon: Tablet, category: 'tablet' },
  { id: 'surface-pro', name: 'Surface Pro', width: 912, height: 1368, icon: Tablet, category: 'tablet' },
  
  // Desktop
  { id: 'desktop-hd', name: 'Desktop HD', width: 1920, height: 1080, icon: Monitor, category: 'desktop' },
  { id: 'desktop-4k', name: 'Desktop 4K', width: 3840, height: 2160, icon: Monitor, category: 'desktop' },
];

export const CrossDeviceTester = () => {
  const [currentDevice, setCurrentDevice] = useState<DeviceTest>(DEVICE_TESTS[0]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  const runDeviceTest = (device: DeviceTest): TestResult => {
    const issues: string[] = [];
    
    // Test viewport dimensions
    if (window.innerWidth < device.width || window.innerHeight < device.height) {
      issues.push(`Current viewport (${window.innerWidth}x${window.innerHeight}) is smaller than device dimensions`);
    }
    
    // Test touch targets (44px minimum recommended)
    const buttons = document.querySelectorAll('button, a, [role="button"]');
    let smallTouchTargets = 0;
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        smallTouchTargets++;
      }
    });
    
    if (smallTouchTargets > 0) {
      issues.push(`${smallTouchTargets} touch targets are smaller than 44px (recommended minimum)`);
    }
    
    // Test text readability
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    let smallText = 0;
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const fontSize = parseFloat(styles.fontSize);
      if (fontSize < 16) {
        smallText++;
      }
    });
    
    if (smallText > 0 && device.category === 'mobile') {
      issues.push(`${smallText} text elements are smaller than 16px (recommended for mobile)`);
    }
    
    // Test horizontal scrolling
    if (document.body.scrollWidth > window.innerWidth) {
      issues.push('Horizontal scrolling detected - content may overflow on this device');
    }
    
    return {
      deviceId: device.id,
      passed: issues.length === 0,
      issues,
      timestamp: new Date()
    };
  };

  const runAllTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    for (let i = 0; i < DEVICE_TESTS.length; i++) {
      setCurrentTestIndex(i);
      const device = DEVICE_TESTS[i];
      
      // Simulate device dimensions (in a real app, you'd use a device testing service)
      const result = runDeviceTest(device);
      
      setTestResults(prev => [...prev, result]);
      
      // Add delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsTesting(false);
    setCurrentTestIndex(0);
  };

  const getResultBadge = (deviceId: string) => {
    const result = testResults.find(r => r.deviceId === deviceId);
    if (!result) return null;
    
    return result.passed ? (
      <Badge className="bg-green-600 text-white">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Passed
      </Badge>
    ) : (
      <Badge className="bg-red-600 text-white">
        <AlertCircle className="h-3 w-3 mr-1" />
        Issues Found
      </Badge>
    );
  };

  const testProgress = isTesting ? (currentTestIndex / DEVICE_TESTS.length) * 100 : 0;
  const completedTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card className="bg-black/20 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-white">Cross-Device Testing</CardTitle>
          <CardDescription className="text-gray-300">
            Test your app across different device sizes and identify potential issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={runAllTests}
              disabled={isTesting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
            
            {completedTests > 0 && (
              <div className="text-right">
                <div className="text-white text-sm font-medium">
                  {passedTests}/{completedTests} tests passed
                </div>
                <div className="text-gray-400 text-xs">
                  Success rate: {Math.round((passedTests / completedTests) * 100)}%
                </div>
              </div>
            )}
          </div>
          
          {isTesting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Testing progress</span>
                <span className="text-gray-300">{currentTestIndex}/{DEVICE_TESTS.length}</span>
              </div>
              <Progress value={testProgress} className="h-2" />
              <p className="text-sm text-gray-400">
                Currently testing: {DEVICE_TESTS[currentTestIndex]?.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DEVICE_TESTS.map((device) => {
          const Icon = device.icon;
          const result = testResults.find(r => r.deviceId === device.id);
          
          return (
            <Card key={device.id} className="bg-black/20 border-blue-800/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-blue-400" />
                    <div>
                      <h3 className="text-white font-medium">{device.name}</h3>
                      <p className="text-gray-400 text-xs">
                        {device.width}×{device.height}px
                      </p>
                    </div>
                  </div>
                  {getResultBadge(device.id)}
                </div>
                
                {result && result.issues.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-red-400 text-xs font-medium">Issues found:</p>
                    {result.issues.map((issue, index) => (
                      <p key={index} className="text-red-300 text-xs">
                        • {issue}
                      </p>
                    ))}
                  </div>
                )}
                
                {result && result.passed && (
                  <p className="text-green-400 text-xs">
                    ✓ All tests passed for this device
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
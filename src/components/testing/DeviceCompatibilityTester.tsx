
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { DeviceInfoCard } from './device/DeviceInfoCard';
import { DeviceTestItem } from './device/DeviceTestItem';
import { DeviceTestsSummary } from './device/DeviceTestsSummary';
import { useDeviceTestsRunner } from './device/DeviceTestsRunner';

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

  const { isMobile, isTablet } = useResponsiveLayout();
  const { runCompatibilityTests, resetTests } = useDeviceTestsRunner({ tests, setTests });

  const getDeviceIcon = () => {
    if (isMobile) return <Smartphone className="h-4 w-4" />;
    if (isTablet) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
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
          <DeviceInfoCard />

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

          <DeviceTestsSummary 
            totalTests={totalTests}
            passedTests={passedTests}
            failedTests={failedTests}
          />

          <div className="space-y-2">
            {tests.map((test, index) => (
              <DeviceTestItem
                key={index}
                name={test.name}
                status={test.status}
                details={test.details}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

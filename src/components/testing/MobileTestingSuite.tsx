import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CrossDeviceTester } from './CrossDeviceTester';
import { MobilePerformanceAuditor } from './MobilePerformanceAuditor';
import { MobileAccessibilityTester } from './MobileAccessibilityTester';
import { TestTube, Smartphone, Zap, Users, CheckCircle2 } from 'lucide-react';

export const MobileTestingSuite = () => {
  const [completedTests, setCompletedTests] = useState<string[]>([]);

  const testSuites = [
    {
      id: 'devices',
      title: 'Device Testing',
      description: 'Test across different screen sizes and devices',
      icon: Smartphone,
      component: CrossDeviceTester
    },
    {
      id: 'performance',
      title: 'Performance Audit',
      description: 'Analyze loading times and optimization opportunities',
      icon: Zap,
      component: MobilePerformanceAuditor
    },
    {
      id: 'accessibility',
      title: 'Accessibility Testing',
      description: 'Ensure your app is accessible to all users',
      icon: Users,
      component: MobileAccessibilityTester
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="bg-black/20 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TestTube className="h-5 w-5 mr-2" />
            Mobile Testing Suite
          </CardTitle>
          <CardDescription className="text-gray-300">
            Comprehensive testing tools for mobile app validation and optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {testSuites.map((suite) => {
              const Icon = suite.icon;
              const isCompleted = completedTests.includes(suite.id);
              
              return (
                <div key={suite.id} className="p-4 bg-black/20 rounded-lg border border-blue-800/20">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-6 w-6 text-blue-400" />
                    {isCompleted && (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-white font-medium mb-1">{suite.title}</h3>
                  <p className="text-gray-400 text-sm">{suite.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Tabs */}
      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-black/20 border-blue-800/30">
          {testSuites.map((suite) => {
            const Icon = suite.icon;
            return (
              <TabsTrigger 
                key={suite.id}
                value={suite.id}
                className="flex items-center gap-2 data-[state=active]:bg-blue-600"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{suite.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {testSuites.map((suite) => {
          const Component = suite.component;
          return (
            <TabsContent key={suite.id} value={suite.id} className="space-y-4">
              <Component />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Shield,
  Zap,
  Wallet,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  id: string;
  name: string;
  category: 'wallet' | 'transaction' | 'contract' | 'security' | 'performance';
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration: number;
  error?: string;
  details?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  runningTests: number;
}

export const Web3TestingSuite = () => {
  const { toast } = useToast();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'Wallet Integration',
      tests: [
        {
          id: '1',
          name: 'Wallet Connection',
          category: 'wallet',
          status: 'pending',
          duration: 0
        },
        {
          id: '2',
          name: 'Account Detection',
          category: 'wallet',
          status: 'pending',
          duration: 0
        },
        {
          id: '3',
          name: 'Network Switching',
          category: 'wallet',
          status: 'pending',
          duration: 0
        },
        {
          id: '4',
          name: 'Balance Retrieval',
          category: 'wallet',
          status: 'pending',
          duration: 0
        }
      ],
      totalTests: 4,
      passedTests: 0,
      failedTests: 0,
      runningTests: 0
    },
    {
      name: 'Transaction Processing',
      tests: [
        {
          id: '5',
          name: 'Send Transaction',
          category: 'transaction',
          status: 'pending',
          duration: 0
        },
        {
          id: '6',
          name: 'Transaction Confirmation',
          category: 'transaction',
          status: 'pending',
          duration: 0
        },
        {
          id: '7',
          name: 'Gas Estimation',
          category: 'transaction',
          status: 'pending',
          duration: 0
        },
        {
          id: '8',
          name: 'Transaction History',
          category: 'transaction',
          status: 'pending',
          duration: 0
        }
      ],
      totalTests: 4,
      passedTests: 0,
      failedTests: 0,
      runningTests: 0
    },
    {
      name: 'Smart Contract',
      tests: [
        {
          id: '9',
          name: 'Contract Deployment',
          category: 'contract',
          status: 'pending',
          duration: 0
        },
        {
          id: '10',
          name: 'Contract Interaction',
          category: 'contract',
          status: 'pending',
          duration: 0
        },
        {
          id: '11',
          name: 'Event Listening',
          category: 'contract',
          status: 'pending',
          duration: 0
        },
        {
          id: '12',
          name: 'Contract Verification',
          category: 'contract',
          status: 'pending',
          duration: 0
        }
      ],
      totalTests: 4,
      passedTests: 0,
      failedTests: 0,
      runningTests: 0
    },
    {
      name: 'Security Tests',
      tests: [
        {
          id: '13',
          name: 'Signature Verification',
          category: 'security',
          status: 'pending',
          duration: 0
        },
        {
          id: '14',
          name: 'Access Control',
          category: 'security',
          status: 'pending',
          duration: 0
        },
        {
          id: '15',
          name: 'Input Validation',
          category: 'security',
          status: 'pending',
          duration: 0
        },
        {
          id: '16',
          name: 'Reentrancy Protection',
          category: 'security',
          status: 'pending',
          duration: 0
        }
      ],
      totalTests: 4,
      passedTests: 0,
      failedTests: 0,
      runningTests: 0
    },
    {
      name: 'Performance Tests',
      tests: [
        {
          id: '17',
          name: 'Load Testing',
          category: 'performance',
          status: 'pending',
          duration: 0
        },
        {
          id: '18',
          name: 'Stress Testing',
          category: 'performance',
          status: 'pending',
          duration: 0
        },
        {
          id: '19',
          name: 'Memory Usage',
          category: 'performance',
          status: 'pending',
          duration: 0
        },
        {
          id: '20',
          name: 'Response Time',
          category: 'performance',
          status: 'pending',
          duration: 0
        }
      ],
      totalTests: 4,
      passedTests: 0,
      failedTests: 0,
      runningTests: 0
    }
  ]);
  
  const [runningAllTests, setRunningAllTests] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);

  const runTest = async (testId: string) => {
    // Update test status to running
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => 
        test.id === testId 
          ? { ...test, status: 'running' as const }
          : test
      )
    })));

    // Simulate test execution
    const startTime = Date.now();
    const success = Math.random() > 0.2; // 80% success rate
    const duration = Math.random() * 3000 + 1000; // 1-4 seconds
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    const endTime = Date.now();
    const actualDuration = endTime - startTime;
    
    // Update test result
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: success ? 'passed' as const : 'failed' as const,
              duration: actualDuration,
              error: success ? undefined : 'Simulated test failure',
              details: success ? 'Test completed successfully' : 'Error in test execution'
            }
          : test
      ),
      passedTests: suite.tests.filter(t => t.id === testId ? success : t.status === 'passed').length,
      failedTests: suite.tests.filter(t => t.id === testId ? !success : t.status === 'failed').length
    })));

    if (!success) {
      toast({
        title: "Test Failed",
        description: `Test ${testId} failed execution`,
        variant: "destructive"
      });
    }
  };

  const runTestSuite = async (suiteName: string) => {
    const suite = testSuites.find(s => s.name === suiteName);
    if (!suite) return;

    setSelectedSuite(suiteName);
    
    // Run all tests in the suite sequentially
    for (const test of suite.tests) {
      await runTest(test.id);
    }
    
    setSelectedSuite(null);
    
    toast({
      title: "Test Suite Completed",
      description: `${suiteName} test suite has finished`,
      variant: "default"
    });
  };

  const runAllTests = async () => {
    setRunningAllTests(true);
    
    // Run all test suites
    for (const suite of testSuites) {
      await runTestSuite(suite.name);
    }
    
    setRunningAllTests(false);
    
    toast({
      title: "All Tests Completed",
      description: "Web3 testing suite has finished running",
      variant: "default"
    });
  };

  const resetAllTests = () => {
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => ({
        ...test,
        status: 'pending' as const,
        duration: 0,
        error: undefined,
        details: undefined
      })),
      passedTests: 0,
      failedTests: 0,
      runningTests: 0
    })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      case 'running': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wallet': return <Wallet className="h-4 w-4" />;
      case 'transaction': return <Activity className="h-4 w-4" />;
      case 'contract': return <TestTube className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      default: return <TestTube className="h-4 w-4" />;
    }
  };

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
  const totalRunning = testSuites.reduce((sum, suite) => sum + suite.runningTests, 0);

  return (
    <div className="space-y-6">
      {/* Test Overview */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <TestTube className="h-5 w-5 mr-2 text-blue-400" />
            Web3 Testing Suite
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={resetAllTests}
              disabled={runningAllTests}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={runAllTests}
              disabled={runningAllTests}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {runningAllTests ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalTests}</div>
              <div className="text-sm text-gray-400">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{totalPassed}</div>
              <div className="text-sm text-gray-400">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{totalFailed}</div>
              <div className="text-sm text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{totalRunning}</div>
              <div className="text-sm text-gray-400">Running</div>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Overall Progress</span>
              <span className="text-white">
                {totalPassed + totalFailed} / {totalTests} tests
              </span>
            </div>
            <Progress 
              value={((totalPassed + totalFailed) / totalTests) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Suites */}
      <Tabs defaultValue="suites" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Detailed Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="suites" className="space-y-4">
          {testSuites.map((suite) => (
            <Card key={suite.name} className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{suite.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-gray-300">
                    {suite.passedTests}/{suite.totalTests} passed
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runTestSuite(suite.name)}
                    disabled={selectedSuite === suite.name || runningAllTests}
                  >
                    {selectedSuite === suite.name ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suite.tests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(test.category)}
                        <div>
                          <div className="font-medium text-white">{test.name}</div>
                          {test.details && (
                            <div className="text-sm text-gray-400">{test.details}</div>
                          )}
                          {test.error && (
                            <div className="text-sm text-red-400">{test.error}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {test.duration > 0 && (
                          <span className="text-sm text-gray-400">
                            {(test.duration / 1000).toFixed(1)}s
                          </span>
                        )}
                        <Badge className={`${getStatusColor(test.status)} text-white`}>
                          {getStatusIcon(test.status)}
                          <span className="ml-1 capitalize">{test.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Suite Progress */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Suite Progress</span>
                    <span className="text-white">
                      {suite.passedTests + suite.failedTests} / {suite.totalTests}
                    </span>
                  </div>
                  <Progress 
                    value={((suite.passedTests + suite.failedTests) / suite.totalTests) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testSuites.flatMap(suite => suite.tests)
                  .filter(test => test.status !== 'pending')
                  .map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(test.category)}
                        <div>
                          <div className="font-medium text-white">{test.name}</div>
                          <div className="text-sm text-gray-400">
                            Category: {test.category}
                          </div>
                          {test.error && (
                            <div className="text-sm text-red-400">
                              <AlertTriangle className="h-4 w-4 inline mr-1" />
                              {test.error}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {(test.duration / 1000).toFixed(1)}s
                        </span>
                        <Badge className={`${getStatusColor(test.status)} text-white`}>
                          {getStatusIcon(test.status)}
                          <span className="ml-1 capitalize">{test.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                
                {testSuites.flatMap(suite => suite.tests)
                  .filter(test => test.status !== 'pending').length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No test results available. Run tests to see results.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
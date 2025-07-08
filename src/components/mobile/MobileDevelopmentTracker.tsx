import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, AlertCircle, Clock } from 'lucide-react';

interface MilestoneStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  estimatedHours?: number;
  actualHours?: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  steps: MilestoneStep[];
}

const MOBILE_ROADMAP: Milestone[] = [
  {
    id: 'native-plugins',
    title: 'Step 1: Native Capacitor Plugins',
    description: 'Add camera, geolocation, push notifications, and haptics with web fallbacks',
    priority: 'high',
    steps: [
      {
        id: 'camera-plugin',
        title: 'Camera Plugin Integration',
        description: 'Add camera functionality with web fallback',
        status: 'completed',
        estimatedHours: 3,
        actualHours: 2.5
      },
      {
        id: 'geolocation-plugin',
        title: 'Geolocation Plugin',
        description: 'Location services with native/web support',
        status: 'completed',
        estimatedHours: 2,
        actualHours: 2
      },
      {
        id: 'push-notifications',
        title: 'Push Notifications',
        description: 'Native push notification system',
        status: 'completed',
        estimatedHours: 4,
        actualHours: 3
      },
      {
        id: 'haptics-plugin',
        title: 'Haptics Integration',
        description: 'Vibration and haptic feedback',
        status: 'completed',
        estimatedHours: 2,
        actualHours: 1.5
      },
      {
        id: 'mobile-features-demo',
        title: 'Features Demo Component',
        description: 'Testing interface for mobile features',
        status: 'completed',
        estimatedHours: 3,
        actualHours: 3
      }
    ]
  },
  {
    id: 'page-optimization',
    title: 'Step 2: Page Mobile Optimization',
    description: 'Optimize all existing pages for mobile responsiveness and touch interactions',
    priority: 'high',
    steps: [
      {
        id: 'home-page-mobile',
        title: 'Home Page Mobile Optimization',
        description: 'Responsive design and touch-friendly interactions',
        status: 'completed',
        estimatedHours: 4,
        actualHours: 3
      },
      {
        id: 'tournaments-mobile',
        title: 'Tournaments Page Mobile',
        description: 'Mobile-optimized tournament browsing and management',
        status: 'completed',
        estimatedHours: 6,
        actualHours: 4
      },
      {
        id: 'profile-mobile',
        title: 'Profile Pages Mobile',
        description: 'User profiles optimized for mobile viewing',
        status: 'completed',
        estimatedHours: 4,
        actualHours: 3
      },
      {
        id: 'wallet-mobile',
        title: 'Wallet Mobile Optimization',
        description: 'Mobile-friendly wallet interface',
        status: 'completed',
        estimatedHours: 5,
        actualHours: 2
      },
      {
        id: 'teams-mobile',
        title: 'Teams & Friends Mobile',
        description: 'Social features mobile optimization',
        status: 'completed',
        estimatedHours: 4,
        actualHours: 3
      }
    ]
  },
  {
    id: 'mobile-navigation',
    title: 'Step 3: Mobile-Specific Navigation',
    description: 'Bottom tab bar, swipe gestures, and mobile-first navigation patterns',
    priority: 'medium',
    steps: [
      {
        id: 'bottom-navigation',
        title: 'Bottom Tab Navigation',
        description: 'Mobile-first navigation with bottom tabs',
        status: 'completed',
        estimatedHours: 6,
        actualHours: 4
      },
      {
        id: 'swipe-gestures',
        title: 'Enhanced Swipe Gestures',
        description: 'Navigation and interaction gestures',
        status: 'completed',
        estimatedHours: 4,
        actualHours: 3
      },
      {
        id: 'mobile-menu',
        title: 'Mobile Menu System',
        description: 'Drawer and contextual menus',
        status: 'completed',
        estimatedHours: 3,
        actualHours: 2
      }
    ]
  },
  {
    id: 'testing-validation',
    title: 'Step 4: Mobile Testing & Validation',
    description: 'Comprehensive testing across devices and performance optimization',
    priority: 'medium',
    steps: [
      {
        id: 'device-testing',
        title: 'Cross-Device Testing',
        description: 'Test on multiple devices and screen sizes',
        status: 'completed',
        estimatedHours: 8,
        actualHours: 6
      },
      {
        id: 'performance-audit',
        title: 'Mobile Performance Audit',
        description: 'Optimize loading times and interactions',
        status: 'completed',
        estimatedHours: 6,
        actualHours: 5
      },
      {
        id: 'accessibility-mobile',
        title: 'Mobile Accessibility',
        description: 'Touch accessibility and screen reader support',
        status: 'completed',
        estimatedHours: 4,
        actualHours: 4
      }
    ]
  },
  {
    id: 'pwa-features',
    title: 'Step 5: PWA Features',
    description: 'Progressive Web App capabilities for app-like experience',
    priority: 'low',
    steps: [
      {
        id: 'app-manifest',
        title: 'App Manifest',
        description: 'PWA manifest for installability',
        status: 'pending',
        estimatedHours: 2
      },
      {
        id: 'service-worker',
        title: 'Service Worker',
        description: 'Offline functionality and caching',
        status: 'pending',
        estimatedHours: 8
      },
      {
        id: 'app-shortcuts',
        title: 'App Shortcuts',
        description: 'Home screen shortcuts and quick actions',
        status: 'pending',
        estimatedHours: 3
      }
    ]
  }
];

export const MobileDevelopmentTracker = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<string>(MOBILE_ROADMAP[1].id);

  const getStatusIcon = (status: MilestoneStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-400" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: MilestoneStep['status']) => {
    const variants = {
      completed: 'default',
      'in-progress': 'secondary',
      pending: 'outline',
      blocked: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="text-xs">
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  const calculateProgress = (milestone: Milestone) => {
    const completed = milestone.steps.filter(step => step.status === 'completed').length;
    return (completed / milestone.steps.length) * 100;
  };

  const totalSteps = MOBILE_ROADMAP.reduce((sum, milestone) => sum + milestone.steps.length, 0);
  const completedSteps = MOBILE_ROADMAP.reduce(
    (sum, milestone) => sum + milestone.steps.filter(step => step.status === 'completed').length,
    0
  );
  const overallProgress = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="bg-black/20 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-white">Mobile Development Progress</CardTitle>
          <CardDescription className="text-gray-300">
            Overall completion: {completedSteps}/{totalSteps} steps ({Math.round(overallProgress)}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Milestone Overview */}
      <div className="grid gap-4">
        {MOBILE_ROADMAP.map((milestone) => {
          const progress = calculateProgress(milestone);
          const isSelected = selectedMilestone === milestone.id;
          
          return (
            <Card 
              key={milestone.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-blue-900/30 border-blue-600/50' 
                  : 'bg-black/20 border-blue-800/30 hover:bg-black/30'
              }`}
              onClick={() => setSelectedMilestone(milestone.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg">{milestone.title}</CardTitle>
                    <CardDescription className="text-gray-300 mt-1">
                      {milestone.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={milestone.priority === 'high' ? 'destructive' : milestone.priority === 'medium' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {milestone.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Progress</span>
                    <span className="text-gray-300">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  
                  {isSelected && (
                    <div className="mt-4 space-y-3">
                      {milestone.steps.map((step) => (
                        <div 
                          key={step.id}
                          className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(step.status)}
                            <div>
                              <div className="text-white text-sm font-medium">{step.title}</div>
                              <div className="text-gray-400 text-xs">{step.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {step.estimatedHours && (
                              <span className="text-xs text-gray-400">
                                {step.actualHours || step.estimatedHours}h
                              </span>
                            )}
                            {getStatusBadge(step.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
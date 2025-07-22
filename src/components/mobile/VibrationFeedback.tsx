import React, { useState } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vibrate, Smartphone, Zap, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackAction {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => Promise<void>;
  color: string;
}

export const VibrationFeedback = () => {
  const [isSupported, setIsSupported] = useState(Capacitor.isNativePlatform());
  const [lastAction, setLastAction] = useState<string | null>(null);
  const { toast } = useToast();

  const triggerHapticFeedback = async (type: 'impact' | 'notification', style?: ImpactStyle | NotificationType) => {
    if (!isSupported) {
      // Fallback for web - try navigator.vibrate
      if ('vibrate' in navigator) {
        const pattern = type === 'impact' 
          ? style === ImpactStyle.Heavy ? [0, 200] : style === ImpactStyle.Medium ? [0, 100] : [0, 50]
          : style === NotificationType.Success ? [0, 50, 50, 50] : style === NotificationType.Warning ? [0, 100, 50, 100] : [0, 200];
        
        navigator.vibrate(pattern);
        return;
      }
      throw new Error('Haptic feedback not supported');
    }

    try {
      if (type === 'impact') {
        await Haptics.impact({ style: style as ImpactStyle });
      } else {
        await Haptics.notification({ type: style as NotificationType });
      }
    } catch (error) {
      console.error('Haptic feedback error:', error);
      throw error;
    }
  };

  const feedbackActions: FeedbackAction[] = [
    {
      id: 'light-impact',
      name: 'Light Impact',
      description: 'Subtle feedback for button taps',
      icon: Zap,
      color: 'bg-blue-500/10 text-blue-500',
      action: async () => {
        await triggerHapticFeedback('impact', ImpactStyle.Light);
        setLastAction('Light Impact - Perfect for UI interactions');
      }
    },
    {
      id: 'medium-impact',
      name: 'Medium Impact',
      description: 'Standard feedback for selections',
      icon: Vibrate,
      color: 'bg-purple-500/10 text-purple-500',
      action: async () => {
        await triggerHapticFeedback('impact', ImpactStyle.Medium);
        setLastAction('Medium Impact - Great for menu selections');
      }
    },
    {
      id: 'heavy-impact',
      name: 'Heavy Impact',
      description: 'Strong feedback for important actions',
      icon: Smartphone,
      color: 'bg-orange-500/10 text-orange-500',
      action: async () => {
        await triggerHapticFeedback('impact', ImpactStyle.Heavy);
        setLastAction('Heavy Impact - Ideal for critical actions');
      }
    },
    {
      id: 'success',
      name: 'Success',
      description: 'Positive outcome feedback',
      icon: CheckCircle,
      color: 'bg-green-500/10 text-green-500',
      action: async () => {
        await triggerHapticFeedback('notification', NotificationType.Success);
        setLastAction('Success - Tournament joined successfully!');
      }
    },
    {
      id: 'warning',
      name: 'Warning',
      description: 'Caution feedback',
      icon: AlertTriangle,
      color: 'bg-yellow-500/10 text-yellow-500',
      action: async () => {
        await triggerHapticFeedback('notification', NotificationType.Warning);
        setLastAction('Warning - Check your connection');
      }
    },
    {
      id: 'error',
      name: 'Error',
      description: 'Negative outcome feedback',
      icon: XCircle,
      color: 'bg-red-500/10 text-red-500',
      action: async () => {
        await triggerHapticFeedback('notification', NotificationType.Error);
        setLastAction('Error - Tournament registration failed');
      }
    }
  ];

  const handleFeedbackAction = async (action: FeedbackAction) => {
    try {
      await action.action();
      toast({
        title: action.name,
        description: action.description,
      });
    } catch (error) {
      toast({
        title: "Haptic feedback unavailable",
        description: "Your device doesn't support haptic feedback",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Haptic Feedback</h2>
        <p className="text-muted-foreground mb-4">
          Experience responsive tactile feedback for gaming actions
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant={isSupported ? "default" : "secondary"}>
            {isSupported ? 'Native Haptics' : 'Web Vibration'}
          </Badge>
          {!isSupported && 'vibrate' in navigator && (
            <Badge variant="outline">Vibration API</Badge>
          )}
        </div>
      </div>

      {/* Last Action Display */}
      {lastAction && (
        <Card className="bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Vibrate className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">{lastAction}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        {feedbackActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-3"
            onClick={() => handleFeedbackAction(action)}
          >
            <div className={`p-3 rounded-lg ${action.color}`}>
              <action.icon className="h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="font-medium text-sm">{action.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {action.description}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Gaming Context Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gaming Context Usage</CardTitle>
          <CardDescription>
            How haptic feedback enhances the tournament experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Tournament Actions:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Join/Leave feedback</li>
                  <li>• Match start notifications</li>
                  <li>• Victory celebrations</li>
                  <li>• Elimination alerts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">UI Interactions:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Button confirmations</li>
                  <li>• Navigation feedback</li>
                  <li>• Form submissions</li>
                  <li>• Error notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compatibility Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Compatibility:</strong> Native haptics work on iOS and Android devices. 
              Web browsers may support basic vibration patterns.
            </p>
            <p>
              <strong>Best Practices:</strong> Use light feedback for frequent actions, 
              medium for selections, and heavy for critical actions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
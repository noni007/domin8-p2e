import React from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapacitorApp } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Battery, Signal, Smartphone } from 'lucide-react';

interface AppInfo {
  name: string;
  id: string;
  build: string;
  version: string;
}

interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

interface DeviceInfo {
  platform: string;
  isNative: boolean;
  model?: string;
}

export const MobileAppShell = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [appInfo, setAppInfo] = React.useState<AppInfo | null>(null);
  const [networkStatus, setNetworkStatus] = React.useState<NetworkStatus>({ connected: true, connectionType: 'unknown' });
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>({ platform: 'web', isNative: false });
  const [isAppReady, setIsAppReady] = React.useState(false);

  React.useEffect(() => {
    initializeApp();
    setupEventListeners();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Check if running on native platform
      const isNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform();
      
      setDeviceInfo({ 
        platform, 
        isNative,
        model: isNative ? await getDeviceModel() : undefined
      });

      if (isNative) {
        // Configure status bar
        await StatusBar.setStyle({ style: 'Dark' as any });
        await StatusBar.setBackgroundColor({ color: '#1e293b' });
        
        // Hide splash screen
        await SplashScreen.hide();
        
        // Get app info
        const info = await CapacitorApp.getInfo();
        setAppInfo({
          name: info.name,
          id: info.id,
          build: info.build,
          version: info.version
        });
      }

      // Check network status
      const status = await Network.getStatus();
      setNetworkStatus({
        connected: status.connected,
        connectionType: status.connectionType
      });

      setIsAppReady(true);
      
      toast({
        title: "App Initialized",
        description: `Running on ${platform}${isNative ? ' (Native)' : ' (Web)'}`,
      });
    } catch (error) {
      console.error('App initialization error:', error);
      setIsAppReady(true); // Still show app even if some features fail
    }
  };

  const getDeviceModel = async (): Promise<string> => {
    try {
      // This would typically use Device plugin
      return 'Unknown Device';
    } catch {
      return 'Unknown Device';
    }
  };

  const setupEventListeners = () => {
    if (Capacitor.isNativePlatform()) {
      // App state change listener
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
        if (isActive) {
          toast({
            title: "Welcome back!",
            description: "App is now active",
          });
        }
      });

      // Back button listener
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapacitorApp.exitApp();
        } else {
          window.history.back();
        }
      });
    }

    // Network status listener
    Network.addListener('networkStatusChange', (status) => {
      setNetworkStatus({
        connected: status.connected,
        connectionType: status.connectionType
      });
      
      toast({
        title: status.connected ? "Connected" : "Disconnected",
        description: `Network: ${status.connectionType}`,
        variant: status.connected ? "default" : "destructive"
      });
    });
  };

  const cleanup = () => {
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.removeAllListeners();
    }
    Network.removeAllListeners();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Smartphone className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Loading App</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Status Bar */}
      {deviceInfo.isNative && (
        <div className="bg-slate-900 text-white p-2 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {appInfo?.name} v{appInfo?.version}
            </Badge>
            <Badge variant={networkStatus.connected ? "default" : "destructive"} className="text-xs">
              {networkStatus.connected ? (
                <><Wifi className="h-3 w-3 mr-1" /> {networkStatus.connectionType}</>
              ) : (
                <><WifiOff className="h-3 w-3 mr-1" /> Offline</>
              )}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Signal className="h-3 w-3" />
            <Battery className="h-3 w-3" />
          </div>
        </div>
      )}

      {/* Network Status Warning */}
      {!networkStatus.connected && (
        <div className="bg-destructive text-destructive-foreground p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">You're offline. Some features may not work.</span>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Main App Content */}
      <main className="pb-safe">
        {children}
      </main>

      {/* Development Info (only in dev) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 left-0 right-0 bg-muted p-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Platform: {deviceInfo.platform}</span>
            <span>Native: {deviceInfo.isNative ? 'Yes' : 'No'}</span>
            <span>Network: {networkStatus.connectionType}</span>
          </div>
        </div>
      )}
    </div>
  );
};
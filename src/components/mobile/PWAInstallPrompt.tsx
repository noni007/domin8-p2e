import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, X, Smartphone, Zap, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallPromptEvent);
      
      // Show install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      toast({
        title: "App Installed!",
        description: "Gamed tournament app is now installed on your device",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "Installing...",
          description: "The app is being installed on your device",
        });
      } else {
        toast({
          title: "Installation cancelled",
          description: "You can install the app later from your browser menu",
          variant: "destructive"
        });
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Installation error:', error);
      toast({
        title: "Installation failed",
        description: "Please try installing from your browser menu",
        variant: "destructive"
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    
    // Show again after 24 hours
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  const shouldShowPrompt = () => {
    if (isInstalled || !deferredPrompt) return false;
    
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
      return dismissedTime < dayAgo;
    }
    
    return showInstallPrompt;
  };

  if (!shouldShowPrompt()) return null;

  return (
    <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Install Gamed App</DialogTitle>
              <DialogDescription>
                Get the full tournament experience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg mx-auto w-fit">
                    <Zap className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium">Faster</p>
                  <p className="text-xs text-muted-foreground">Lightning fast performance</p>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-green-500/10 rounded-lg mx-auto w-fit">
                    <Wifi className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-sm font-medium">Offline</p>
                  <p className="text-xs text-muted-foreground">Works without internet</p>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg mx-auto w-fit">
                    <Download className="h-5 w-5 text-purple-500" />
                  </div>
                  <p className="text-sm font-medium">Native</p>
                  <p className="text-xs text-muted-foreground">App-like experience</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Maybe Later
            </Button>
            <Button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isInstalling ? 'Installing...' : 'Install App'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
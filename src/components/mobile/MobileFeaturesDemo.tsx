import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';
import { Camera, MapPin, Bell, Vibrate, Smartphone, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const MobileFeaturesDemo = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [locationInfo, setLocationInfo] = useState<string>('');
  const { toast } = useToast();
  
  const {
    isNativePlatform,
    platform,
    camera,
    geolocation,
    pushNotifications,
    haptics,
    checkSupport
  } = useMobileFeatures();

  const support = checkSupport();

  const handleTakePhoto = async () => {
    const result = await camera.takePhoto();
    if (result) {
      setCapturedImage(result.dataUrl);
      await haptics.notification();
      toast({
        title: "Photo captured!",
        description: "Image captured successfully",
      });
    } else if (camera.error) {
      toast({
        title: "Camera Error",
        description: camera.error,
        variant: "destructive",
      });
    }
  };

  const handleGetLocation = async () => {
    const location = await geolocation.getCurrentLocation();
    if (location) {
      const info = `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`;
      setLocationInfo(info);
      await haptics.impact();
      toast({
        title: "Location found!",
        description: info,
      });
    } else if (geolocation.error) {
      toast({
        title: "Location Error",
        description: geolocation.error,
        variant: "destructive",
      });
    }
  };

  const handleRequestNotifications = async () => {
    const granted = await pushNotifications.requestPermission();
    if (granted) {
      await pushNotifications.register();
      await haptics.notification();
      toast({
        title: "Notifications enabled!",
        description: "Push notifications are now active",
      });
    } else {
      toast({
        title: "Permission denied",
        description: "Push notifications were not granted",
        variant: "destructive",
      });
    }
  };

  const handleTestHaptics = async () => {
    await haptics.impact();
    setTimeout(() => haptics.selectionChanged(), 200);
    setTimeout(() => haptics.notification(), 400);
    
    toast({
      title: "Haptics test",
      description: "Feel the vibrations!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Platform Info */}
      <Card className="bg-black/20 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {isNativePlatform ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            Platform: {platform}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {isNativePlatform ? 'Native mobile app' : 'Web browser'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span className="text-sm text-gray-300">Camera</span>
                <Badge variant={support.camera ? "default" : "secondary"} className="text-xs">
                  {support.camera ? 'Supported' : 'Not available'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm text-gray-300">Location</span>
                <Badge variant={support.geolocation ? "default" : "secondary"} className="text-xs">
                  {support.geolocation ? 'Supported' : 'Not available'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm text-gray-300">Push</span>
                <Badge variant={support.pushNotifications ? "default" : "secondary"} className="text-xs">
                  {support.pushNotifications ? 'Supported' : 'Not available'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Vibrate className="h-4 w-4" />
                <span className="text-sm text-gray-300">Haptics</span>
                <Badge variant={support.haptics ? "default" : "secondary"} className="text-xs">
                  {support.haptics ? 'Supported' : 'Not available'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Features */}
      <Card className="bg-black/20 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Features
          </CardTitle>
          <CardDescription className="text-gray-300">
            Test camera functionality with web fallbacks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleTakePhoto}
              disabled={camera.isLoading || !support.camera}
              className="flex-1"
            >
              {camera.isLoading ? 'Taking Photo...' : 'Take Photo'}
            </Button>
            <Button 
              onClick={camera.selectFromGallery}
              disabled={camera.isLoading || !support.camera}
              variant="outline"
              className="flex-1"
            >
              {camera.isLoading ? 'Selecting...' : 'Gallery'}
            </Button>
          </div>
          
          {capturedImage && (
            <div className="mt-4">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full max-w-xs mx-auto rounded-lg border border-gray-600"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geolocation Features */}
      <Card className="bg-black/20 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Features
          </CardTitle>
          <CardDescription className="text-gray-300">
            Get current location with native/web support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleGetLocation}
              disabled={geolocation.isLoading || !support.geolocation}
              className="flex-1"
            >
              {geolocation.isLoading ? 'Getting Location...' : 'Get Location'}
            </Button>
            <Button 
              onClick={geolocation.watchLocation}
              disabled={geolocation.isWatching || !support.geolocation}
              variant="outline"
              className="flex-1"
            >
              {geolocation.isWatching ? 'Watching...' : 'Watch Location'}
            </Button>
          </div>
          
          {locationInfo && (
            <div className="p-3 bg-gray-800/50 rounded text-sm text-gray-300">
              {locationInfo}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="bg-black/20 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription className="text-gray-300">
            Only available on native mobile platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleRequestNotifications}
            disabled={!support.pushNotifications}
            className="w-full"
          >
            {pushNotifications.isRegistered ? 'Notifications Active' : 'Enable Notifications'}
          </Button>
          
          {pushNotifications.token && (
            <div className="p-3 bg-gray-800/50 rounded text-xs text-gray-400 break-all">
              Token: {pushNotifications.token.substring(0, 50)}...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Haptics */}
      <Card className="bg-black/20 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Vibrate className="h-5 w-5" />
            Haptic Feedback
          </CardTitle>
          <CardDescription className="text-gray-300">
            Test vibration patterns (works on web with basic vibration)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleTestHaptics}
            disabled={!support.haptics}
            className="w-full"
          >
            Test Haptics
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

interface UseGeolocationReturn {
  location: LocationCoords | null;
  getCurrentLocation: () => Promise<LocationCoords | null>;
  watchLocation: () => void;
  clearWatch: () => void;
  isNativeGeolocation: boolean;
  isLoading: boolean;
  error: string | null;
  isWatching: boolean;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<string | number | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const isNativeGeolocation = Capacitor.isNativePlatform();

  const getCurrentLocation = async (): Promise<LocationCoords | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let position: Position | GeolocationPosition;

      if (isNativeGeolocation) {
        position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
      } else {
        // Web fallback
        position = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
          }

          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        });
      }

      const coords: LocationCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude ?? undefined,
        altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
        heading: position.coords.heading ?? undefined,
        speed: position.coords.speed ?? undefined,
      };

      setLocation(coords);
      return coords;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Location access failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const watchLocation = async () => {
    if (isWatching) return;

    setError(null);
    setIsWatching(true);

    try {
      if (isNativeGeolocation) {
        const id = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
          },
          (position) => {
            if (position) {
              const coords: LocationCoords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude ?? undefined,
                altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
                heading: position.coords.heading ?? undefined,
                speed: position.coords.speed ?? undefined,
              };
              setLocation(coords);
            }
          }
        );
        setWatchId(id);
      } else {
        // Web fallback
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported');
        }

        const id = navigator.geolocation.watchPosition(
          (position) => {
            const coords: LocationCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude ?? undefined,
              altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
              heading: position.coords.heading ?? undefined,
              speed: position.coords.speed ?? undefined,
            };
            setLocation(coords);
          },
          (err) => {
            setError(err.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
        setWatchId(id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Location watch failed';
      setError(errorMessage);
      setIsWatching(false);
    }
  };

  const clearWatch = async () => {
    if (watchId !== null) {
      try {
        if (isNativeGeolocation) {
          await Geolocation.clearWatch({ id: watchId as string });
        } else {
          navigator.geolocation.clearWatch(watchId as number);
        }
      } catch (err) {
        console.error('Error clearing location watch:', err);
      }
      setWatchId(null);
      setIsWatching(false);
    }
  };

  useEffect(() => {
    return () => {
      clearWatch();
    };
  }, []);

  return {
    location,
    getCurrentLocation,
    watchLocation,
    clearWatch,
    isNativeGeolocation,
    isLoading,
    error,
    isWatching,
  };
};
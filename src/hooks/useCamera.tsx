import * as React from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

interface CameraResult {
  dataUrl: string;
  format: string;
}

interface UseCameraReturn {
  takePhoto: () => Promise<CameraResult | null>;
  selectFromGallery: () => Promise<CameraResult | null>;
  isNativeCamera: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useCamera = (): UseCameraReturn => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isNativeCamera = Capacitor.isNativePlatform();

  const takePhoto = async (): Promise<CameraResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isNativeCamera) {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });

        return {
          dataUrl: image.dataUrl || '',
          format: image.format || 'jpeg',
        };
      } else {
        // Web fallback - use HTML5 camera
        return await captureWebPhoto();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Camera access failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async (): Promise<CameraResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isNativeCamera) {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
        });

        return {
          dataUrl: image.dataUrl || '',
          format: image.format || 'jpeg',
        };
      } else {
        // Web fallback - use file input
        return await selectWebFile();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gallery access failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const captureWebPhoto = (): Promise<CameraResult | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';

      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              dataUrl: reader.result as string,
              format: file.type.split('/')[1] || 'jpeg',
            });
          };
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      };

      input.click();
    });
  };

  const selectWebFile = (): Promise<CameraResult | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              dataUrl: reader.result as string,
              format: file.type.split('/')[1] || 'jpeg',
            });
          };
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      };

      input.click();
    });
  };

  return {
    takePhoto,
    selectFromGallery,
    isNativeCamera,
    isLoading,
    error,
  };
};
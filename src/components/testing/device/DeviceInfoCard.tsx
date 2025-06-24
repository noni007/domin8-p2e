
import React from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

export const DeviceInfoCard = () => {
  const {
    screenSize,
    orientation,
    isMobile,
    isTablet,
    isTouchDevice
  } = useResponsiveLayout();

  const getDeviceIcon = () => {
    if (isMobile) return <Smartphone className="h-4 w-4" />;
    if (isTablet) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="p-3 bg-gray-800/30 rounded">
      <div className="text-white text-xs font-semibold mb-2">Current Device</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-400">Type: </span>
          <span className="text-white">
            {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Size: </span>
          <span className="text-white">{screenSize.width}×{screenSize.height}</span>
        </div>
        <div>
          <span className="text-gray-400">Orientation: </span>
          <span className="text-white">{orientation}</span>
        </div>
        <div>
          <span className="text-gray-400">Touch: </span>
          <span className="text-white">{isTouchDevice ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
};

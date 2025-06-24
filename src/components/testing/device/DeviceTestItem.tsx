
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DeviceTestItemProps {
  name: string;
  status: 'idle' | 'testing' | 'passed' | 'failed';
  details?: string;
}

export const DeviceTestItem = ({ name, status, details }: DeviceTestItemProps) => {
  const getStatusBadge = (status: DeviceTestItemProps['status']) => {
    switch (status) {
      case 'testing':
        return <Badge variant="secondary" className="bg-yellow-600">Testing</Badge>;
      case 'passed':
        return <Badge variant="default" className="bg-green-600">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  return (
    <div className="p-3 bg-gray-800/30 rounded">
      <div className="flex items-center justify-between mb-1">
        <span className="text-white text-sm">{name}</span>
        {getStatusBadge(status)}
      </div>
      {details && (
        <div className="text-xs text-gray-400 mt-1">
          {details}
        </div>
      )}
    </div>
  );
};

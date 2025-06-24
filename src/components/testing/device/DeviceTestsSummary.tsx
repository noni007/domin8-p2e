
import React from 'react';

interface DeviceTestsSummaryProps {
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

export const DeviceTestsSummary = ({ 
  totalTests, 
  passedTests, 
  failedTests 
}: DeviceTestsSummaryProps) => {
  if (passedTests === 0 && failedTests === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-800/30 rounded">
      <div className="text-center">
        <div className="text-white font-semibold">{totalTests}</div>
        <div className="text-xs text-gray-400">Total</div>
      </div>
      <div className="text-center">
        <div className="text-green-400 font-semibold">{passedTests}</div>
        <div className="text-xs text-gray-400">Passed</div>
      </div>
      <div className="text-center">
        <div className="text-red-400 font-semibold">{failedTests}</div>
        <div className="text-xs text-gray-400">Failed</div>
      </div>
    </div>
  );
};

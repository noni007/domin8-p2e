
import React, { Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';

interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const LazyComponentWrapper = ({ 
  children, 
  fallback,
  errorFallback
}: LazyComponentWrapperProps) => {
  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner text="Loading..." />
    </div>
  );

  const defaultErrorFallback = (
    <div className="flex items-center justify-center min-h-[200px] text-center">
      <div>
        <p className="text-red-400 mb-2">Failed to load component</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-400 hover:underline"
        >
          Refresh page
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback || defaultErrorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

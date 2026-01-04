import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FatalErrorScreenProps {
  error?: Error;
  onRetry?: () => void;
}

export const FatalErrorScreen = ({ error, onRetry }: FatalErrorScreenProps) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>
        </div>

        {/* Error details (dev only) */}
        {import.meta.env.DEV && error && (
          <details className="text-left bg-muted/50 rounded-lg p-4 text-sm">
            <summary className="cursor-pointer text-muted-foreground font-medium">
              Technical Details
            </summary>
            <pre className="mt-3 text-xs text-destructive whitespace-pre-wrap break-words overflow-auto max-h-32">
              {error.message}
            </pre>
            {error.stack && (
              <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap break-words overflow-auto max-h-40">
                {error.stack}
              </pre>
            )}
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onRetry || handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>

        {/* Support text */}
        <p className="text-xs text-muted-foreground">
          If this keeps happening, please contact support.
        </p>
      </div>
    </div>
  );
};

export default FatalErrorScreen;

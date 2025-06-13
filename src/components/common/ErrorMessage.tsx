
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorMessage = ({ 
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  onRetry,
  showHomeButton = false,
  variant = 'error'
}: ErrorMessageProps) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getAlertClasses = () => {
    switch (variant) {
      case 'warning':
        return "bg-yellow-900/20 border-yellow-800/30 text-yellow-100";
      case 'info':
        return "bg-blue-900/20 border-blue-800/30 text-blue-100";
      default:
        return "bg-red-900/20 border-red-800/30 text-red-100";
    }
  };

  return (
    <Alert className={getAlertClasses()}>
      {getIcon()}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-4">
        <p>{message}</p>
        <div className="flex gap-2">
          {onRetry && (
            <Button 
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {showHomeButton && (
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-400 hover:bg-gray-600/20"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

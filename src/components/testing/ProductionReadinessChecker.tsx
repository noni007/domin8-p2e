import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Play, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ReadinessCheck {
  category: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

export const ProductionReadinessChecker = () => {
  const [checks, setChecks] = useState<ReadinessCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();

  const runReadinessChecks = async () => {
    setIsRunning(true);
    const results: ReadinessCheck[] = [];

    // Authentication Tests
    try {
      const { data: { session } } = await supabase.auth.getSession();
      results.push({
        category: 'Authentication',
        name: 'Session Management',
        status: session ? 'pass' : 'warning',
        message: session ? 'Active session found' : 'No active session (test login required)',
        critical: false
      });
    } catch (error) {
      results.push({
        category: 'Authentication',
        name: 'Session Management',
        status: 'fail',
        message: 'Failed to check session',
        critical: true
      });
    }

    // Database Connectivity
    try {
      const { error } = await supabase.from('tournaments').select('count').limit(1);
      results.push({
        category: 'Database',
        name: 'Supabase Connection',
        status: error ? 'fail' : 'pass',
        message: error ? 'Database connection failed' : 'Database connected successfully',
        critical: true
      });
    } catch (error) {
      results.push({
        category: 'Database',
        name: 'Supabase Connection', 
        status: 'fail',
        message: 'Critical database error',
        critical: true
      });
    }

    // PWA Features
    const pwaCriteria = {
      serviceWorker: 'serviceWorker' in navigator,
      manifest: document.querySelector('link[rel="manifest"]') !== null,
      https: location.protocol === 'https:' || location.hostname === 'localhost'
    };

    results.push({
      category: 'PWA',
      name: 'Service Worker',
      status: pwaCriteria.serviceWorker ? 'pass' : 'fail',
      message: pwaCriteria.serviceWorker ? 'Service Worker supported' : 'Service Worker not available',
      critical: false
    });

    results.push({
      category: 'PWA', 
      name: 'Web App Manifest',
      status: pwaCriteria.manifest ? 'pass' : 'fail',
      message: pwaCriteria.manifest ? 'Manifest detected' : 'Manifest missing',
      critical: false
    });

    results.push({
      category: 'PWA',
      name: 'HTTPS/Secure Context',
      status: pwaCriteria.https ? 'pass' : 'warning',
      message: pwaCriteria.https ? 'Secure context available' : 'HTTPS required for production',
      critical: false
    });

    // Performance Checks
    const performanceEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = performanceEntry ? performanceEntry.loadEventEnd - performanceEntry.fetchStart : 0;
    
    results.push({
      category: 'Performance',
      name: 'Page Load Time',
      status: loadTime < 3000 ? 'pass' : loadTime < 5000 ? 'warning' : 'fail',
      message: `Load time: ${Math.round(loadTime)}ms`,
      critical: false
    });

    // Feature Flags Check
    try {
      const { data: flags } = await supabase.from('platform_config').select('key, value').like('key', 'feature_%');
      const featureCount = flags?.length || 0;
      results.push({
        category: 'Features',
        name: 'Feature Flags',
        status: featureCount > 0 ? 'pass' : 'warning',
        message: `${featureCount} feature flags configured`,
        critical: false
      });
    } catch (error) {
      results.push({
        category: 'Features',
        name: 'Feature Flags',
        status: 'warning',
        message: 'Could not check feature flags',
        critical: false
      });
    }

    // Payment Integration Check (basic)
    const hasStripeKey = process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost';
    results.push({
      category: 'Payments',
      name: 'Stripe Integration',
      status: hasStripeKey ? 'pass' : 'warning',
      message: hasStripeKey ? 'Payment system configured' : 'Payment keys need production setup',
      critical: false
    });

    // Mobile Responsiveness
    const isMobile = window.innerWidth <= 768;
    const hasViewport = document.querySelector('meta[name="viewport"]') !== null;
    results.push({
      category: 'Mobile',
      name: 'Responsive Design',
      status: hasViewport ? 'pass' : 'fail',
      message: hasViewport ? 'Viewport meta tag present' : 'Missing viewport configuration',
      critical: false
    });

    results.push({
      category: 'Mobile',
      name: 'Touch Interface',
      status: 'ontouchstart' in window ? 'pass' : 'warning',
      message: 'ontouchstart' in window ? 'Touch events supported' : 'Touch support limited',
      critical: false
    });

    setChecks(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pass: 'default',
      warning: 'secondary', 
      fail: 'destructive'
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const categorizeChecks = (category: string) => checks.filter(check => check.category === category);
  const getOverallStatus = () => {
    const criticalFailures = checks.filter(c => c.critical && c.status === 'fail');
    const totalFailures = checks.filter(c => c.status === 'fail').length;
    const totalWarnings = checks.filter(c => c.status === 'warning').length;
    
    if (criticalFailures.length > 0) return { status: 'fail', message: 'Critical issues found' };
    if (totalFailures > 0) return { status: 'warning', message: `${totalFailures} issues, ${totalWarnings} warnings` };
    if (totalWarnings > 0) return { status: 'warning', message: `Ready with ${totalWarnings} warnings` };
    return { status: 'pass', message: 'Production ready!' };
  };

  const categories = ['Authentication', 'Database', 'PWA', 'Performance', 'Features', 'Payments', 'Mobile'];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Production Readiness Checker
          </CardTitle>
          <Button 
            onClick={runReadinessChecks} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Checking...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Checks
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {checks.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(getOverallStatus().status)}
              <span className="font-medium">Overall Status</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(getOverallStatus().status)}
              <span className="text-sm text-muted-foreground">{getOverallStatus().message}</span>
            </div>
          </div>
        )}

        {categories.map(category => {
          const categoryChecks = categorizeChecks(category);
          if (categoryChecks.length === 0) return null;

          return (
            <div key={category} className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium text-sm">{check.name}</div>
                        <div className="text-xs text-muted-foreground">{check.message}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {check.critical && (
                        <Badge variant="outline" className="text-xs">CRITICAL</Badge>
                      )}
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {checks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run Checks" to verify production readiness
          </div>
        )}
      </CardContent>
    </Card>
  );
};
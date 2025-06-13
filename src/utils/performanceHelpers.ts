
// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
}

// Web Vitals measurement
export const measureWebVitals = (): Promise<PerformanceMetrics> => {
  return new Promise((resolve) => {
    const metrics: Partial<PerformanceMetrics> = {};

    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    metrics.fcp = fcpEntry ? fcpEntry.startTime : 0;

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        metrics.lcp = lastEntry ? lastEntry.startTime : 0;
        lcpObserver.disconnect();
        
        // Check if all metrics are collected
        if (Object.keys(metrics).length >= 2) {
          resolve(metrics as PerformanceMetrics);
        }
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // Time to First Byte
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
    }

    // Fallback resolve after timeout
    setTimeout(() => {
      resolve({
        fcp: metrics.fcp || 0,
        lcp: metrics.lcp || 0,
        fid: 0, // Requires user interaction
        cls: 0, // Requires layout shift observer
        ttfb: metrics.ttfb || 0
      });
    }, 3000);
  });
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  const memory = (performance as any).memory;
  if (!memory) return null;

  return {
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
    total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
  };
};

// Performance budget validation
export const validatePerformanceBudget = (metrics: PerformanceMetrics) => {
  const budgets = {
    fcp: 1800, // ms
    lcp: 2500, // ms
    fid: 100,  // ms
    cls: 0.1,  // score
    ttfb: 800  // ms
  };

  const violations = [];
  
  for (const [metric, budget] of Object.entries(budgets)) {
    const value = metrics[metric as keyof PerformanceMetrics];
    if (value > budget) {
      violations.push({
        metric,
        value,
        budget,
        severity: value > budget * 1.5 ? 'high' : 'medium'
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    score: Math.max(0, 100 - violations.length * 20)
  };
};

// Bundle size analysis (mock implementation)
export const analyzeBundleSize = async (): Promise<BundleAnalysis> => {
  // In a real implementation, this would analyze the actual bundle
  // For now, we'll simulate the analysis
  
  const mockChunks = [
    {
      name: 'vendor',
      size: 250000,
      modules: ['react', 'react-dom', '@tanstack/react-query']
    },
    {
      name: 'main',
      size: 150000,
      modules: ['src/App.tsx', 'src/pages/*', 'src/components/*']
    },
    {
      name: 'charts',
      size: 100000,
      modules: ['recharts']
    }
  ];

  const totalSize = mockChunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const gzippedSize = Math.round(totalSize * 0.3); // Approximate gzip ratio

  return {
    totalSize,
    gzippedSize,
    chunks: mockChunks
  };
};

// Render performance measurement
export const measureRenderPerformance = (componentName: string) => {
  return {
    start: () => {
      performance.mark(`${componentName}-render-start`);
    },
    end: () => {
      performance.mark(`${componentName}-render-end`);
      performance.measure(
        `${componentName}-render`,
        `${componentName}-render-start`,
        `${componentName}-render-end`
      );
      
      const measure = performance.getEntriesByName(`${componentName}-render`)[0];
      return measure ? measure.duration : 0;
    }
  };
};

// Long task detection
export const detectLongTasks = () => {
  if (!('PerformanceObserver' in window)) return;

  const longTaskObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.warn(
        `Long task detected: ${entry.duration}ms`,
        {
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration
        }
      );
    }
  });

  longTaskObserver.observe({ entryTypes: ['longtask'] });
  
  return () => longTaskObserver.disconnect();
};

// Resource loading optimization
export const preloadCriticalResources = () => {
  const criticalPaths = [
    '/api/tournaments',
    '/api/user/profile'
  ];

  criticalPaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'fetch';
    link.href = path;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Image optimization helpers
export const optimizeImageLoading = () => {
  // Add intersection observer for lazy loading
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = React.useState(false);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsMonitoring(true);
      
      measureWebVitals().then(setMetrics);
      
      // Start long task detection
      const cleanup = detectLongTasks();
      
      return cleanup;
    }
  }, []);

  return { metrics, isMonitoring };
};

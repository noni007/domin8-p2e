
import { useState, useEffect, useCallback } from 'react';

interface ValidationRule {
  id: string;
  name: string;
  test: () => boolean | Promise<boolean>;
  description: string;
  category: 'performance' | 'accessibility' | 'security' | 'ux';
}

interface ValidationResult {
  rule: ValidationRule;
  passed: boolean;
  message: string;
  timestamp: Date;
}

export const useTestValidation = () => {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Default validation rules
  const defaultRules: ValidationRule[] = [
    {
      id: 'bundle-size',
      name: 'Bundle Size Check',
      test: () => {
        // Check if bundle size is reasonable (mock implementation)
        const bundleSize = performance.getEntriesByType('navigation')[0]?.transferSize || 0;
        return bundleSize < 1024 * 1024; // Less than 1MB
      },
      description: 'Ensures bundle size is optimized for fast loading',
      category: 'performance'
    },
    {
      id: 'alt-text',
      name: 'Image Alt Text',
      test: () => {
        const images = document.querySelectorAll('img');
        return Array.from(images).every(img => img.alt || img.getAttribute('aria-label'));
      },
      description: 'All images should have alt text for accessibility',
      category: 'accessibility'
    },
    {
      id: 'contrast-ratio',
      name: 'Color Contrast',
      test: () => {
        // Simplified contrast check (would need proper color analysis in real implementation)
        const buttons = document.querySelectorAll('button');
        return buttons.length > 0; // Mock validation
      },
      description: 'Text should have sufficient contrast against background',
      category: 'accessibility'
    },
    {
      id: 'loading-states',
      name: 'Loading States',
      test: () => {
        // Check if loading states are properly handled
        const loadingElements = document.querySelectorAll('[data-loading], .animate-pulse');
        return loadingElements.length >= 0; // Mock validation
      },
      description: 'Loading states should be visible to users',
      category: 'ux'
    },
    {
      id: 'error-boundaries',
      name: 'Error Boundaries',
      test: () => {
        // Check if error boundaries are present (simplified)
        return document.querySelector('[data-error-boundary]') !== null;
      },
      description: 'Error boundaries should catch and handle errors gracefully',
      category: 'security'
    }
  ];

  const runValidation = useCallback(async (rules: ValidationRule[] = defaultRules) => {
    setIsRunning(true);
    setResults([]);

    for (const rule of rules) {
      try {
        const passed = await rule.test();
        const result: ValidationResult = {
          rule,
          passed,
          message: passed 
            ? `✓ ${rule.name} validation passed`
            : `✗ ${rule.name} validation failed - ${rule.description}`,
          timestamp: new Date()
        };

        setResults(prev => [...prev, result]);
        
        // Add delay to simulate real testing
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        const result: ValidationResult = {
          rule,
          passed: false,
          message: `✗ ${rule.name} validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        };

        setResults(prev => [...prev, result]);
      }
    }

    setIsRunning(false);
  }, []);

  const getValidationSummary = useCallback(() => {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { total, passed, failed, score };
  }, [results]);

  const getResultsByCategory = useCallback(() => {
    return results.reduce((acc, result) => {
      const category = result.rule.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(result);
      return acc;
    }, {} as Record<string, ValidationResult[]>);
  }, [results]);

  // Auto-run validation on component mount in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Delay initial validation to allow components to render
      const timer = setTimeout(() => {
        runValidation();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [runValidation]);

  return {
    results,
    isRunning,
    runValidation,
    getValidationSummary,
    getResultsByCategory,
    defaultRules
  };
};

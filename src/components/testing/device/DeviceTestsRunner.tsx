
import React from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface DeviceTest {
  name: string;
  status: 'idle' | 'testing' | 'passed' | 'failed';
  details?: string;
}

interface DeviceTestsRunnerProps {
  tests: DeviceTest[];
  setTests: React.Dispatch<React.SetStateAction<DeviceTest[]>>;
}

export const useDeviceTestsRunner = ({ tests, setTests }: DeviceTestsRunnerProps) => {
  const { isMobile, isTablet, orientation, isTouchDevice } = useResponsiveLayout();

  const runCompatibilityTests = () => {
    setTests(prev => prev.map(test => ({ ...test, status: 'testing' as const })));

    // Touch Navigation Test
    setTimeout(() => {
      const touchNavPassed = isTouchDevice ? 
        document.querySelectorAll('[role="button"], button').length > 0 : true;
      
      setTests(prev => prev.map(test => 
        test.name === 'Touch Navigation' 
          ? { 
              ...test, 
              status: touchNavPassed ? 'passed' : 'failed',
              details: touchNavPassed ? 'Touch targets found' : 'No touch targets detected'
            }
          : test
      ));
    }, 500);

    // Responsive Grid Test
    setTimeout(() => {
      const grids = document.querySelectorAll('.grid');
      const hasResponsiveGrids = Array.from(grids).some(grid => {
        const styles = window.getComputedStyle(grid);
        return styles.gridTemplateColumns.includes('repeat') || 
               styles.display === 'grid';
      });

      setTests(prev => prev.map(test => 
        test.name === 'Responsive Grid' 
          ? { 
              ...test, 
              status: hasResponsiveGrids ? 'passed' : 'failed',
              details: `${grids.length} grid elements found`
            }
          : test
      ));
    }, 1000);

    // Mobile Menu Test
    setTimeout(() => {
      if (isMobile) {
        const mobileMenu = document.querySelector('[data-mobile-menu]') || 
                          document.querySelector('.mobile-menu') ||
                          document.querySelector('[aria-label*="mobile"]');
        
        setTests(prev => prev.map(test => 
          test.name === 'Mobile Menu' 
            ? { 
                ...test, 
                status: mobileMenu ? 'passed' : 'failed',
                details: mobileMenu ? 'Mobile menu found' : 'Mobile menu missing'
              }
            : test
        ));
      } else {
        setTests(prev => prev.map(test => 
          test.name === 'Mobile Menu' 
            ? { 
                ...test, 
                status: 'passed',
                details: 'Not applicable on desktop'
              }
            : test
        ));
      }
    }, 1500);

    // Font Scaling Test
    setTimeout(() => {
      const bodyFontSize = parseFloat(window.getComputedStyle(document.body).fontSize);
      const isAccessibleFontSize = bodyFontSize >= 14;
      
      setTests(prev => prev.map(test => 
        test.name === 'Font Scaling' 
          ? { 
              ...test, 
              status: isAccessibleFontSize ? 'passed' : 'failed',
              details: `Base font size: ${bodyFontSize}px`
            }
          : test
      ));
    }, 2000);

    // Button Accessibility Test
    setTimeout(() => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      const accessibleButtons = Array.from(buttons).filter(btn => {
        const styles = window.getComputedStyle(btn);
        const height = parseFloat(styles.height);
        const width = parseFloat(styles.width);
        return height >= 44 && width >= 44;
      });

      const passRate = buttons.length > 0 ? (accessibleButtons.length / buttons.length) : 0;
      
      setTests(prev => prev.map(test => 
        test.name === 'Button Accessibility' 
          ? { 
              ...test, 
              status: passRate >= 0.8 ? 'passed' : 'failed',
              details: `${accessibleButtons.length}/${buttons.length} buttons accessible`
            }
          : test
      ));
    }, 2500);

    // Orientation Change Test
    setTimeout(() => {
      const orientationSupported = 'orientation' in screen || 'orientation' in window;
      
      setTests(prev => prev.map(test => 
        test.name === 'Orientation Change' 
          ? { 
              ...test, 
              status: orientationSupported ? 'passed' : 'failed',
              details: `Current: ${orientation}, API: ${orientationSupported ? 'Available' : 'Not available'}`
            }
          : test
      ));
    }, 3000);
  };

  const resetTests = () => {
    setTests(prev => prev.map(test => ({ ...test, status: 'idle' as const, details: undefined })));
  };

  return { runCompatibilityTests, resetTests };
};

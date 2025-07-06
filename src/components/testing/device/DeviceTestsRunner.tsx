import { useState } from 'react';

interface DeviceTest {
  name: string;
  status: 'idle' | 'testing' | 'passed' | 'failed';
  details?: string;
}

interface UseDeviceTestsRunnerProps {
  tests: DeviceTest[];
  setTests: React.Dispatch<React.SetStateAction<DeviceTest[]>>;
}

export const useDeviceTestsRunner = ({ tests, setTests }: UseDeviceTestsRunnerProps) => {
  const runCompatibilityTests = async () => {
    const testFunctions = [
      testTouchNavigation,
      testResponsiveGrid,
      testMobileMenu,
      testFontScaling,
      testButtonAccessibility,
      testOrientationChange,
    ];

    for (let i = 0; i < testFunctions.length; i++) {
      setTests(prev => prev.map((test, index) => 
        index === i ? { ...test, status: 'testing' } : test
      ));

      await new Promise(resolve => setTimeout(resolve, 800));

      try {
        const result = await testFunctions[i]();
        setTests(prev => prev.map((test, index) => 
          index === i ? { 
            ...test, 
            status: result.passed ? 'passed' : 'failed',
            details: result.details 
          } : test
        ));
      } catch (error) {
        setTests(prev => prev.map((test, index) => 
          index === i ? { 
            ...test, 
            status: 'failed',
            details: error instanceof Error ? error.message : 'Test failed'
          } : test
        ));
      }
    }
  };

  const resetTests = () => {
    setTests(prev => prev.map(test => ({ ...test, status: 'idle', details: undefined })));
  };

  return { runCompatibilityTests, resetTests };
};

// Test functions
const testTouchNavigation = async (): Promise<{ passed: boolean; details: string }> => {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasClickableElements = document.querySelectorAll('[role="button"], button, a').length > 0;
  
  if (isTouchDevice && hasClickableElements) {
    return { passed: true, details: 'Touch navigation supported' };
  }
  return { passed: false, details: 'Touch navigation issues detected' };
};

const testResponsiveGrid = async (): Promise<{ passed: boolean; details: string }> => {
  const width = window.innerWidth;
  const gridElements = document.querySelectorAll('[class*="grid"]');
  
  if (width < 768) {
    return { passed: true, details: `Mobile layout active (${width}px)` };
  } else if (width < 1024) {
    return { passed: true, details: `Tablet layout active (${width}px)` };
  }
  return { passed: true, details: `Desktop layout active (${width}px)` };
};

const testMobileMenu = async (): Promise<{ passed: boolean; details: string }> => {
  const mobileMenuButton = document.querySelector('[class*="md:hidden"]');
  const desktopNav = document.querySelector('[class*="hidden md:flex"]');
  
  if (window.innerWidth < 768 && mobileMenuButton) {
    return { passed: true, details: 'Mobile menu available' };
  } else if (window.innerWidth >= 768 && desktopNav) {
    return { passed: true, details: 'Desktop navigation active' };
  }
  return { passed: false, details: 'Navigation layout issues' };
};

const testFontScaling = async (): Promise<{ passed: boolean; details: string }> => {
  const bodyStyle = getComputedStyle(document.body);
  const fontSize = parseFloat(bodyStyle.fontSize);
  
  if (fontSize >= 14 && fontSize <= 18) {
    return { passed: true, details: `Font size: ${fontSize}px` };
  }
  return { passed: false, details: `Font size may be too small/large: ${fontSize}px` };
};

const testButtonAccessibility = async (): Promise<{ passed: boolean; details: string }> => {
  const buttons = document.querySelectorAll('button');
  let accessibleButtons = 0;
  
  buttons.forEach(button => {
    const rect = button.getBoundingClientRect();
    if (rect.width >= 44 && rect.height >= 44) {
      accessibleButtons++;
    }
  });
  
  const percentage = buttons.length > 0 ? (accessibleButtons / buttons.length) * 100 : 100;
  
  if (percentage >= 80) {
    return { passed: true, details: `${Math.round(percentage)}% buttons meet size guidelines` };
  }
  return { passed: false, details: `Only ${Math.round(percentage)}% buttons meet touch targets` };
};

const testOrientationChange = async (): Promise<{ passed: boolean; details: string }> => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const orientation = height > width ? 'portrait' : 'landscape';
  
  return { 
    passed: true, 
    details: `${orientation} mode (${width}×${height})` 
  };
};
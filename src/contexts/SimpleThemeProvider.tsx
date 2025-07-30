import * as React from 'react';

interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function SimpleThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');

  const toggleTheme = React.useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const value = React.useMemo(() => ({
    theme,
    toggleTheme,
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useSimpleTheme = () => {
  const context = React.useContext(ThemeContext);
  return context;
};
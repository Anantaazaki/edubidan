import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme } from '../constants/colors';
import { ThemeMode } from '../types';

const THEME_KEY = '@edubidan_theme';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  theme: typeof LightTheme | typeof DarkTheme;
  toggleTheme: () => Promise<void>;
  loaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');
  const [loaded, setLoaded] = useState(false);

  // Load persisted preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (stored === 'dark' || stored === 'light') {
          setMode(stored);
        } else {
          // Fall back to system preference
          setMode(systemScheme === 'dark' ? 'dark' : 'light');
        }
      })
      .catch(() => {
        setMode(systemScheme === 'dark' ? 'dark' : 'light');
      })
      .finally(() => setLoaded(true));
  }, [systemScheme]);

  const toggleTheme = useCallback(async () => {
    const next: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch (_) {
      // ignore storage errors
    }
  }, [mode]);

  const isDark = mode === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const value: ThemeContextType = {
    mode,
    isDark,
    theme,
    toggleTheme,
    loaded,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
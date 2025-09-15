import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, lightTheme, darkTheme } from '@/constants/themes';

// Theme context interface
interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  isLoading: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage key for theme persistence
const THEME_STORAGE_KEY = 'theme-storage';

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(true); // Default to dark theme
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get current theme based on isDark state
  const theme = isDark ? darkTheme : lightTheme;

  // Load theme preference from storage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme) {
          const parsed = JSON.parse(storedTheme);
          if (typeof parsed.isDark === 'boolean') {
            setIsDark(parsed.isDark);
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference to storage
  const saveThemePreference = async (isDarkValue: boolean) => {
    try {
      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({ isDark: isDarkValue })
      );
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    saveThemePreference(newIsDark);
  };

  // Set theme function
  const setThemeValue = (isDarkValue: boolean) => {
    setIsDark(isDarkValue);
    saveThemePreference(isDarkValue);
  };

  const contextValue: ThemeContextType = {
    theme,
    isDark,
    isLoading,
    toggleTheme,
    setTheme: setThemeValue,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Individual hooks for backward compatibility
export const useTheme = (): Theme => {
  const { theme } = useThemeContext();
  return theme;
};

export const useIsDark = (): boolean => {
  const { isDark } = useThemeContext();
  return isDark;
};

export const useThemeLoading = (): boolean => {
  const { isLoading } = useThemeContext();
  return isLoading;
};

export const useThemeActions = () => {
  const { toggleTheme, setTheme } = useThemeContext();
  return { toggleTheme, setTheme };
};

// Export theme objects for direct access if needed
export { lightTheme, darkTheme } from '@/constants/themes';
export type { Theme } from '@/constants/themes';

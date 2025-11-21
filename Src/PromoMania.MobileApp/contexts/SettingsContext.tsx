import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
  isDarkMode: boolean;
  isPerformanceMode: boolean;
  isSimpleMode: boolean;
  toggleDarkMode: () => void;
  togglePerformanceMode: () => void;
  toggleSimpleMode: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@app_settings';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const { darkMode, performanceMode, simpleMode } = JSON.parse(savedSettings);
        setIsDarkMode(darkMode ?? false);
        setIsPerformanceMode(performanceMode ?? false);
        setIsSimpleMode(simpleMode ?? false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (darkMode: boolean, performanceMode: boolean, simpleMode: boolean) => {
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ darkMode, performanceMode, simpleMode })
      );
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    saveSettings(newValue, isPerformanceMode, isSimpleMode);
  };

  const togglePerformanceMode = () => {
    const newValue = !isPerformanceMode;
    setIsPerformanceMode(newValue);
    saveSettings(isDarkMode, newValue, isSimpleMode);
  };

  const toggleSimpleMode = () => {
    const newValue = !isSimpleMode;
    setIsSimpleMode(newValue);
    saveSettings(isDarkMode, isPerformanceMode, newValue);
  };

  // Don't render children until settings are loaded
  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <SettingsContext.Provider
      value={{
        isDarkMode,
        isPerformanceMode,
        isSimpleMode,
        toggleDarkMode,
        togglePerformanceMode,
        toggleSimpleMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
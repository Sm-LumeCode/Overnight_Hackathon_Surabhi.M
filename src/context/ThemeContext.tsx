import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: Theme;
}

interface Theme {
  background: string;
  text: string;
  secondaryText: string;
  primary: string;
  buttonText: string;
  headerBackground: string;
  headerText: string;
  inputBackground: string;
  inputFieldBackground: string;
  placeholderText: string;
  sendButton: string;
  sendButtonText: string;
  aiBubble: string;
  aiText: string;
  userBubble: string;
  userText: string;
}

const lightTheme: Theme = {
  background: '#FFFFFF',
  text: '#000000',
  secondaryText: '#666666',
  primary: '#007AFF',
  buttonText: '#FFFFFF',
  headerBackground: '#007AFF',
  headerText: '#FFFFFF',
  inputBackground: '#FFFFFF',
  inputFieldBackground: '#F0F0F0',
  placeholderText: '#999999',
  sendButton: '#007AFF',
  sendButtonText: '#FFFFFF',
  aiBubble: '#E5E5EA',
  aiText: '#000000',
  userBubble: '#007AFF',
  userText: '#FFFFFF',
};

const darkTheme: Theme = {
  background: '#000000',
  text: '#00FF00',
  secondaryText: '#00CC00',
  primary: '#00FF00',
  buttonText: '#000000',
  headerBackground: '#000000',
  headerText: '#00FF00',
  inputBackground: '#000000',
  inputFieldBackground: '#1A1A1A',
  placeholderText: '#00AA00',
  sendButton: '#00FF00',
  sendButtonText: '#000000',
  aiBubble: '#1A1A1A',
  aiText: '#00FF00',
  userBubble: '#00FF00',
  userText: '#000000',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default: Dark Mode

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

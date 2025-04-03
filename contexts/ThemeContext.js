import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definição dos temas
export const lightTheme = {
  name: 'light',
  colors: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#333333',
    secondaryText: '#666666',
    primary: '#1E88E5',
    accent: '#FF4081',
    border: '#E0E0E0',
    error: '#F44336',
    success: '#4CAF50',
    divider: '#EEEEEE',
    headerBackground: '#FFFFFF',
    inputBackground: '#FFFFFF',
    inputBorder: '#DDDDDD',
    tabBar: '#FFFFFF',
    tabBarInactive: '#757575',
  }
};

export const darkTheme = {
  name: 'dark',
  colors: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#F5F5F5',
    secondaryText: '#AAAAAA',
    primary: '#2196F3',
    accent: '#FF4081',
    border: '#333333',
    error: '#F44336',
    success: '#4CAF50',
    divider: '#333333',
    headerBackground: '#1E1E1E',
    inputBackground: '#2A2A2A',
    inputBorder: '#444444',
    tabBar: '#1E1E1E',
    tabBarInactive: '#AAAAAA',
  }
};

// Criar o contexto
const ThemeContext = createContext();

// Hook personalizado para usar o tema
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Detectar o tema do sistema
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState(lightTheme);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [useSystemTheme, setUseSystemTheme] = useState(true);

  // Carregar preferência de tema do AsyncStorage ao iniciar
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@theme_preference');
        const storedUseSystem = await AsyncStorage.getItem('@use_system_theme');
        
        if (storedUseSystem !== null) {
          const useSystem = JSON.parse(storedUseSystem);
          setUseSystemTheme(useSystem);
          
          if (useSystem) {
            // Usar tema do sistema
            setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
          } else if (storedTheme) {
            // Usar tema armazenado
            setTheme(storedTheme === 'dark' ? darkTheme : lightTheme);
          }
        } else if (storedTheme) {
          // Configuração antiga, só o tema
          setTheme(storedTheme === 'dark' ? darkTheme : lightTheme);
          setUseSystemTheme(false);
        }
      } catch (error) {
        console.error('Erro ao carregar preferência de tema:', error);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);

  // Atualizar tema com base na preferência do sistema quando useSystemTheme é true
  useEffect(() => {
    if (useSystemTheme && systemColorScheme) {
      setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
    }
  }, [systemColorScheme, useSystemTheme]);

  // Funções para manipular o tema
  const setDarkTheme = async () => {
    try {
      setTheme(darkTheme);
      setUseSystemTheme(false);
      await AsyncStorage.setItem('@theme_preference', 'dark');
      await AsyncStorage.setItem('@use_system_theme', 'false');
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  };

  const setLightTheme = async () => {
    try {
      setTheme(lightTheme);
      setUseSystemTheme(false);
      await AsyncStorage.setItem('@theme_preference', 'light');
      await AsyncStorage.setItem('@use_system_theme', 'false');
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  };

  const setSystemTheme = async (useSystem) => {
    try {
      setUseSystemTheme(useSystem);
      await AsyncStorage.setItem('@use_system_theme', JSON.stringify(useSystem));
      
      if (useSystem) {
        // Usar o tema do sistema
        const newTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
        setTheme(newTheme);
      }
    } catch (error) {
      console.error('Erro ao salvar preferência de tema do sistema:', error);
    }
  };

  if (!isThemeLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ 
      theme,
      isDark: theme.name === 'dark',
      setDarkTheme,
      setLightTheme,
      useSystemTheme,
      setSystemTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}; 
import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, EncodeSansExpanded_400Regular, EncodeSansExpanded_500Medium } from '@expo-google-fonts/encode-sans-expanded';
import { Ramabhadra_400Regular } from '@expo-google-fonts/ramabhadra';
import { View, Text, ActivityIndicator } from 'react-native';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';

// Importar as telas
import MovieScreen from './screens/MovieScreen';
import ActorScreen from './screens/ActorScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack de navegação para filmes e atores
function MoviesStack() {
  return (
    <Stack.Navigator initialRouteName="Movies" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Movies" component={MovieScreen} />
      <Stack.Screen name="ActorProfile" component={ActorScreen} />
    </Stack.Navigator>
  );
}

// Componente de navegação principal
function MainNavigator() {
  const { theme, isDark } = useTheme();
  
  // Configurar os temas para o React Navigation
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'MoviesTab') {
              iconName = focused ? 'film' : 'film-outline';
            } else if (route.name === 'Favorites') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.tabBarInactive,
          tabBarStyle: { backgroundColor: theme.colors.tabBar },
        })}
      >
        <Tab.Screen 
          name="MoviesTab" 
          component={MoviesStack} 
          options={{ tabBarLabel: 'Filmes' }}
        />
        <Tab.Screen 
          name="Favorites" 
          component={FavoritesScreen} 
          options={{ tabBarLabel: 'Favoritos' }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ tabBarLabel: 'Configurações' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Componente principal
export default function App() {
  const [fontsLoaded] = useFonts({
    EncodeSansExpanded_400Regular,
    EncodeSansExpanded_500Medium,
    Ramabhadra_400Regular
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text>Carregando fontes...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <MainNavigator />
        </FavoritesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
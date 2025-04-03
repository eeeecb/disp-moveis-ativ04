import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

// Criar o contexto
const FavoritesContext = createContext();

// Hook personalizado para usar favoritos
export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Função para gerar a chave de storage específica para o usuário
  const getUserFavoritesKey = (userId) => {
    return `@favorite_movies_${userId}`;
  };

  // Carregar favoritos do AsyncStorage ao iniciar ou quando o usuário mudar
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        
        if (isAuthenticated && user) {
          // Carregar favoritos específicos do usuário logado
          const userFavoritesKey = getUserFavoritesKey(user.id);
          const storedFavorites = await AsyncStorage.getItem(userFavoritesKey);
          
          if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
          } else {
            // Se não houver favoritos, inicializar com array vazio
            setFavorites([]);
          }
        } else {
          // Se não tiver usuário logado, lista de favoritos vazia
          setFavorites([]);
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [user, isAuthenticated]);

  // Verificar se precisa estar autenticado
  const checkAuthentication = () => {
    if (!isAuthenticated || !user) {
      // Mostrar alerta de que é necessário estar logado
      Alert.alert(
        "Ação restrita",
        "Você precisa estar logado para gerenciar favoritos.",
        [
          { text: "OK", style: "default" }
        ]
      );
      return false;
    }
    return true;
  };

  // Verificar se um filme é favorito
  const isFavorite = (movieId) => {
    if (!isAuthenticated) return false;
    return favorites.some(movie => movie.id === movieId);
  };

  // Adicionar um filme aos favoritos
  const addFavorite = async (movie) => {
    try {
      // Verificar autenticação
      if (!checkAuthentication()) {
        return { success: false, error: 'Usuário não autenticado' };
      }
      
      if (!movie || !movie.id) {
        throw new Error('Dados do filme inválidos');
      }
      
      // Verificar se o filme já está nos favoritos
      if (isFavorite(movie.id)) {
        return { success: true, message: 'Filme já está nos favoritos' };
      }

      const newFavorites = [...favorites, movie];
      
      // Salvar na chave específica do usuário
      const userFavoritesKey = getUserFavoritesKey(user.id);
      await AsyncStorage.setItem(userFavoritesKey, JSON.stringify(newFavorites));
      
      setFavorites(newFavorites);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      return { success: false, error: error.message };
    }
  };

  // Remover um filme dos favoritos
  const removeFavorite = async (movieId) => {
    try {
      // Verificar autenticação
      if (!checkAuthentication()) {
        return { success: false, error: 'Usuário não autenticado' };
      }
      
      if (!movieId) {
        throw new Error('ID do filme não fornecido');
      }
      
      // Verificar se o filme está nos favoritos
      if (!isFavorite(movieId)) {
        return { success: false, error: 'Filme não está nos favoritos' };
      }

      const newFavorites = favorites.filter(movie => movie.id !== movieId);
      
      // Salvar na chave específica do usuário
      const userFavoritesKey = getUserFavoritesKey(user.id);
      await AsyncStorage.setItem(userFavoritesKey, JSON.stringify(newFavorites));
      
      setFavorites(newFavorites);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return { success: false, error: error.message };
    }
  };

  // Alternar favorito (adicionar ou remover)
  const toggleFavorite = async (movie) => {
    // Verificar autenticação
    if (!checkAuthentication()) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    if (isFavorite(movie.id)) {
      return removeFavorite(movie.id);
    } else {
      return addFavorite(movie);
    }
  };

  // Limpar todos os favoritos
  const clearAllFavorites = async () => {
    try {
      // Verificar autenticação
      if (!checkAuthentication()) {
        return { success: false, error: 'Usuário não autenticado' };
      }
      
      console.log('Iniciando remoção de favoritos no FavoritesContext');
      
      // Remover da chave específica do usuário
      const userFavoritesKey = getUserFavoritesKey(user.id);
      await AsyncStorage.removeItem(userFavoritesKey);
      
      console.log('AsyncStorage limpo, atualizando estado...');
      setFavorites([]);
      console.log('Estado atualizado com sucesso');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao limpar favoritos:', error);
      return { success: false, error: error.message };
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <FavoritesContext.Provider value={{ 
      favorites,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearAllFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};
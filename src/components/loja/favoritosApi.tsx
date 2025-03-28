
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProdutoFavorito } from '@/types/tipo';
import { carregarFavoritos, adicionarFavorito as adicionarFavoritoApi, removeFavorito } from '@/api/loja/favoritosService';
import { useAuth } from '@/components/auth/useAuth';

interface FavoritosContextType {
  favoritos: ProdutoFavorito[];
  adicionarFavorito: (produto: ProdutoFavorito) => Promise<void>;
  removerFavorito: (id: string) => Promise<void>;
  isFavorito: (id: string) => boolean;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export const FavoritosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoritos, setFavoritos] = useState<ProdutoFavorito[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFavoritos = async () => {
      // Only try to load favorites if user is logged in
      if (user) {
        try {
          const loadedFavoritos = await carregarFavoritos();
          setFavoritos(loadedFavoritos);
        } catch (error) {
          console.error('Erro ao carregar favoritos iniciais:', error);
        }
      } else {
        // Clear favorites if user logs out
        setFavoritos([]);
      }
    };
    
    fetchFavoritos();
  }, [user]); // Reload favorites when user changes

  const adicionarFavorito = async (produto: ProdutoFavorito) => {
    if (!user) {
      throw new Error('Você precisa estar logado para adicionar favoritos');
    }
    
    try {
      await adicionarFavoritoApi(produto.id);
      setFavoritos(prev => {
        if (!prev.some(item => item.id === produto.id)) {
          return [...prev, produto];
        }
        return prev;
      });
    } catch (error) {
      throw error;
    }
  };

  const removerFavorito = async (id: string) => {
    if (!user) {
      throw new Error('Você precisa estar logado para remover favoritos');
    }
    
    try {
      await removeFavorito(id);
      setFavoritos(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      throw error;
    }
  };

  const isFavorito = (id: string) => {
    return favoritos.some(item => item.id === id);
  };

  return (
    <FavoritosContext.Provider value={{
      favoritos,
      adicionarFavorito,
      removerFavorito,
      isFavorito,
    }}>
      {children}
    </FavoritosContext.Provider>
  );
};

export const useFavoritos = () => {
  const context = useContext(FavoritosContext);
  if (context === undefined) {
    throw new Error('useFavoritos deve ser usado dentro de um FavoritosProvider');
  }
  return context;
};

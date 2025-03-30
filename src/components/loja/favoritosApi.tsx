import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProdutoFavorito } from '@/types/tipo';
import { carregarFavoritos, adicionarFavorito as adicionarFavoritoApi, removeFavorito } from '@/api/loja/favoritosService';
import { useAuth } from '@/components/auth/useAuth';

interface FavoritosContextType {
  favoritos: ProdutoFavorito[];
  adicionarFavorito: (produto: ProdutoFavorito) => Promise<void>;
  removerFavorito: (id: string) => Promise<void>;
  isFavorito: (id: string | number) => boolean; // Aceitar number ou string
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export const FavoritosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoritos, setFavoritos] = useState<ProdutoFavorito[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFavoritos = async () => {
      console.log('FavoritosProvider: useEffect disparado. User:', user);
      if (user) {
        try {
          console.log('FavoritosProvider: Carregando favoritos para o usuário:', user.email);
          const loadedFavoritos = await carregarFavoritos();
          console.log('FavoritosProvider: Favoritos carregados do backend:', loadedFavoritos);
          setFavoritos([...loadedFavoritos]);
        } catch (error) {
          console.error('FavoritosProvider: Erro ao carregar favoritos:', error);
          setFavoritos([]);
        }
      } else {
        console.log('FavoritosProvider: Usuário deslogado. Limpando favoritos.');
        setFavoritos([]);
      }
    };
    
    fetchFavoritos();
  }, [user]);

  const adicionarFavorito = async (produto: ProdutoFavorito) => {
    if (!user) {
      throw new Error('Você precisa estar logado para adicionar favoritos');
    }
    
    try {
      console.log('FavoritosProvider: Antes de adicionar favorito:', { produto, atuais: favoritos });
      await adicionarFavoritoApi(produto.id);
      setFavoritos(prev => {
        if (!prev.some(item => item.id === produto.id)) {
          const novosFavoritos = [...prev, produto];
          console.log('FavoritosProvider: Após adicionar favorito:', novosFavoritos);
          return novosFavoritos;
        }
        return prev;
      });
    } catch (error) {
      console.error('FavoritosProvider: Erro ao adicionar favorito:', error);
      throw error;
    }
  };

  const removerFavorito = async (id: string) => {
    if (!user) {
      throw new Error('Você precisa estar logado para remover favoritos');
    }
    
    try {
      console.log('FavoritosProvider: Antes de remover favorito. ID:', id, 'Atuais:', favoritos);
      await removeFavorito(id);
      setFavoritos(prev => {
        const novosFavoritos = prev.filter(item => item.id !== id);
        console.log('FavoritosProvider: Após remover favorito:', novosFavoritos);
        return novosFavoritos;
      });
    } catch (error) {
      console.error('FavoritosProvider: Erro ao remover favorito:', error);
      throw error;
    }
  };

  const isFavorito = (id: string | number) => {
    const idAsString = String(id); // Converte o ID recebido para string
    const favorito = favoritos.some(item => item.id === idAsString);
    console.log('FavoritosProvider: Verificando se é favorito. ID:', id, 'Convertido para:', idAsString, 'Resultado:', favorito, 'Favoritos atuais:', favoritos);
    return favorito;
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
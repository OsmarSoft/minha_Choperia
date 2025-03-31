import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProdutoFavorito } from '@/types/tipo';
import { carregarFavoritos, adicionarFavorito as adicionarFavoritoApi, removeFavorito } from '@/api/loja/favoritosService';
import { useAuth } from '@/components/auth/useAuth';

interface FavoritosContextType {
  favoritos: ProdutoFavorito[];
  adicionarFavorito: (produto: ProdutoFavorito) => Promise<void>;
  removerFavorito: (id: string) => Promise<void>;
  isFavorito: (id: string | number) => boolean;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export const FavoritosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoritos, setFavoritos] = useState<ProdutoFavorito[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    console.log('FavoritosProvider: useEffect disparado. User:', user);
    if (user && user.id) {
      const fetchFavoritos = async () => {
        try {
          const favoritosCarregados = await carregarFavoritos(user.id);
          console.log('FavoritosProvider: Carregando favoritos para o usuário (ID):', user.id);
          setFavoritos(favoritosCarregados);
        } catch (error) {
          console.error('FavoritosProvider: Erro ao carregar favoritos:', error);
          setFavoritos([]);
        }
      };
      fetchFavoritos();
    } else {
      console.log('FavoritosProvider: Usuário deslogado ou inválido. Limpando favoritos.');
      setFavoritos([]);
    }
  }, [user]);

  const adicionarFavorito = async (produto: ProdutoFavorito) => {
    if (!user || !user.id) {
      console.log('FavoritosProvider: Usuário não logado ou inválido, não pode adicionar favorito.');
      throw new Error('Você precisa estar logado para adicionar favoritos');
    }

    try {
      console.log('FavoritosProvider: Antes de adicionar favorito:', { produto, atuais: favoritos });
      await adicionarFavoritoApi(produto.id, user.id); // Pass user.id
      const novosFavoritos = await carregarFavoritos(user.id); // Reload from backend
      setFavoritos(novosFavoritos);
      console.log('FavoritosProvider: Favorito adicionado com sucesso:', novosFavoritos);
    } catch (error) {
      console.error('FavoritosProvider: Erro ao adicionar favorito:', error);
      throw error;
    }
  };

  const removerFavorito = async (id: string) => {
    if (!user || !user.id) {
      console.log('FavoritosProvider: Usuário não logado ou inválido, não pode remover favorito.');
      throw new Error('Você precisa estar logado para remover favoritos');
    }

    try {
      console.log('FavoritosProvider: Antes de remover favorito. ID:', id, 'Atuais:', favoritos);
      await removeFavorito(id, user.id); // Pass user.id
      const novosFavoritos = await carregarFavoritos(user.id); // Reload from backend
      setFavoritos(novosFavoritos);
      console.log('FavoritosProvider: Favorito removido com sucesso:', novosFavoritos);
    } catch (error) {
      console.error('FavoritosProvider: Erro ao remover favorito:', error);
      throw error;
    }
  };

  const isFavorito = (id: string | number) => {
    const idAsString = String(id);
    const favorito = favoritos.some(item => item.id === idAsString);
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
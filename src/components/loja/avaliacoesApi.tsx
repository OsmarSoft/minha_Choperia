
// src/components/loja/avaliacoesApi.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/components/auth/useAuth';
import { 
  carregarAvaliacoes, 
  adicionarAvaliacao as adicionarAvaliacaoApi,
  editarAvaliacao as editarAvaliacaoApi, 
  removerAvaliacao as removerAvaliacaoApi, 
  carregarAvaliacoesProduto,
  getMediaAvaliacoes,
} from '@/api/loja/avaliacaoService';
import { Avaliacao } from '@/types/tipo';

interface AvaliacoesContextType {
  avaliacoes: Avaliacao[];
  adicionarAvaliacao: (produtoId: string, rating: number, comentario: string) => Promise<void>;
  editarAvaliacao: (avaliacaoId: string, rating: number, comentario: string) => Promise<void>;
  removerAvaliacao: (avaliacaoId: string) => Promise<void>;
  getAvaliacoesProduto: (produtoId: string) => Promise<Avaliacao[]>;
  getAvaliacoesUsuario: () => Promise<Avaliacao[]>;
  getMediaAvaliacoes: (produtoId: string) => Promise<number>;
}

const AvaliacoesContext = createContext<AvaliacoesContextType | undefined>(undefined);

export const AvaliacoesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      if (user) {
        try {
          const avaliacoesUsuario = await carregarAvaliacoes();
          setAvaliacoes(avaliacoesUsuario);
        } catch (error) {
          console.error('Erro ao carregar avaliações:', error);
        }
      } else {
        // Clear ratings when user logs out
        setAvaliacoes([]);
      }
    };
    
    fetchAvaliacoes();
  }, [user]);

  const adicionarAvaliacao = async (produtoId: string, rating: number, comentario: string) => {
    if (!user) throw new Error('Usuário não autenticado');
    try {
      await adicionarAvaliacaoApi(produtoId, rating, comentario);
      const updatedAvaliacoes = await carregarAvaliacoes();
      setAvaliacoes(updatedAvaliacoes);
    } catch (error) {
      throw error;
    }
  };

  const editarAvaliacao = async (avaliacaoId: string, rating: number, comentario: string) => {
    try {
      const avaliacao = avaliacoes.find(a => a.id === avaliacaoId);
      if (!avaliacao) throw new Error('Avaliação não encontrada');
      await editarAvaliacaoApi(avaliacao.slug, rating, comentario);
      const updatedAvaliacoes = await carregarAvaliacoes();
      setAvaliacoes(updatedAvaliacoes);
    } catch (error) {
      throw error;
    }
  };

  const removerAvaliacao = async (avaliacaoId: string) => {
    try {
      const avaliacao = avaliacoes.find(a => a.id === avaliacaoId);
      if (!avaliacao) throw new Error('Avaliação não encontrada');
      await removerAvaliacaoApi(avaliacao.slug);
      const updatedAvaliacoes = await carregarAvaliacoes();
      setAvaliacoes(updatedAvaliacoes);
    } catch (error) {
      throw error;
    }
  };

  const getAvaliacoesProduto = async (produtoId: string): Promise<Avaliacao[]> => {
    try {
      return await carregarAvaliacoesProduto(produtoId);
    } catch (error) {
      console.error('Erro ao carregar avaliações do produto:', error);
      return [];
    }
  };

  const getAvaliacoesUsuario = async (): Promise<Avaliacao[]> => {
    if (!user) return [];
    try {
      return await carregarAvaliacoes();
    } catch (error) {
      console.error('Erro ao carregar avaliações do usuário:', error);
      return [];
    }
  };

  const getMediaAvaliacoesProduto = async (produtoId: string): Promise<number> => {
    try {
      return await getMediaAvaliacoes(produtoId);
    } catch (error) {
      console.error('Erro ao calcular média de avaliações:', error);
      return 0;
    }
  };

  return (
    <AvaliacoesContext.Provider value={{
      avaliacoes,
      adicionarAvaliacao,
      editarAvaliacao,
      removerAvaliacao,
      getAvaliacoesProduto,
      getAvaliacoesUsuario,
      getMediaAvaliacoes: getMediaAvaliacoesProduto,
    }}>
      {children}
    </AvaliacoesContext.Provider>
  );
};

export const useAvaliacoes = () => {
  const context = useContext(AvaliacoesContext);
  if (context === undefined) {
    throw new Error('useAvaliacoes deve ser usado dentro de um AvaliacoesProvider');
  }
  return context;
};

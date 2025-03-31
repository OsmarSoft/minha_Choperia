
// src/components/loja/avaliacoesApi.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  adicionarAvaliacao: (email: string, password: string, produtoId: string, rating: number, comentario: string) => Promise<void>;
  editarAvaliacao: (email: string, password: string, avaliacaoId: string, rating: number, comentario: string) => Promise<void>;
  removerAvaliacao: (email: string, password: string, avaliacaoId: string) => Promise<void>;
  getAvaliacoesProduto: (produtoId: string) => Promise<Avaliacao[]>;
  getAvaliacoesUsuario: (email: string, password: string) => Promise<Avaliacao[]>;
  getMediaAvaliacoes: (produtoId: string) => Promise<number>;
}

const AvaliacoesContext = createContext<AvaliacoesContextType | undefined>(undefined);

export const AvaliacoesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);

  const getAvaliacoesUsuario = async (email: string, password: string): Promise<Avaliacao[]> => {
    try {
      const avaliacoesUsuario = await carregarAvaliacoes(email, password);
      setAvaliacoes(avaliacoesUsuario);
      return avaliacoesUsuario;
    } catch (error) {
      console.error('Erro ao carregar avaliações do usuário:', error);
      return [];
    }
  };

  const adicionarAvaliacao = async (email: string, password: string, produtoId: string, rating: number, comentario: string) => {
    try {
      await adicionarAvaliacaoApi(email, password, produtoId, rating, comentario);
      const updatedAvaliacoes = await carregarAvaliacoes(email, password);
      setAvaliacoes(updatedAvaliacoes);
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
      throw error;
    }
  };

  const editarAvaliacao = async (email: string, password: string, avaliacaoId: string, rating: number, comentario: string) => {
    try {
      await editarAvaliacaoApi(email, password, avaliacaoId, rating, comentario);
      const updatedAvaliacoes = await carregarAvaliacoes(email, password);
      setAvaliacoes(updatedAvaliacoes);
    } catch (error) {
      console.error('Erro ao editar avaliação:', error);
      throw error;
    }
  };

  const removerAvaliacao = async (email: string, password: string, avaliacaoId: string) => {
    try {
      await removerAvaliacaoApi(email, password, avaliacaoId);
      const updatedAvaliacoes = await carregarAvaliacoes(email, password);
      setAvaliacoes(updatedAvaliacoes);
    } catch (error) {
      console.error('Erro ao remover avaliação:', error);
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



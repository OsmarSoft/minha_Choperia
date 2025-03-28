// src/data/loja/avaliacoes_storage.ts
import { Avaliacao } from '@/types/tipo';

export const carregarAvaliacoes = (): Avaliacao[] => {
  const savedAvaliacoes = localStorage.getItem('avaliacoes');
  if (savedAvaliacoes) {
    try {
      return JSON.parse(savedAvaliacoes);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      return [];
    }
  }
  return [];
};

export const salvarAvaliacoes = (avaliacoes: Avaliacao[]) => {
  localStorage.setItem('avaliacoes', JSON.stringify(avaliacoes));
};
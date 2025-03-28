
// src/api/loja/avaliacaoService.ts
import axios from 'axios';
import { API_URL } from '@/config/api';
import { Avaliacao } from '@/types/tipo';
import { getToken } from '@/api/usuarios/usuarioService';

// Interface para tipar a resposta da API
interface AvaliacaoResponse {
  id: number;
  produto: number;
  usuario: number;
  usuario_nome: string;
  rating: number;
  comentario: string;
  data: string;
  slug: string;
}

interface MediaResponse {
  media: number;
}

const api = axios.create({
  baseURL: API_URL, // 'http://127.0.0.1:8004/api'
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Carregar avaliações do usuário autenticado
export const carregarAvaliacoes = async (): Promise<Avaliacao[]> => {
  try {
    // Check if the user is authenticated
    const token = getToken();
    if (!token) {
      console.log('Usuário não autenticado, retornando lista vazia de avaliações');
      return [];
    }
    
    const response = await api.get<AvaliacaoResponse[]>('/avaliacoes/usuario/');
    return response.data.map((item) => ({
      id: item.id.toString(),
      produtoId: item.produto.toString(),
      userId: item.usuario.toString(),
      userName: item.usuario_nome,
      rating: item.rating,
      comentario: item.comentario,
      data: item.data,
      slug: item.slug,
    }));
  } catch (error: any) {
    console.error('Erro ao carregar avaliações:', error);
    
    // Return empty array for unauthorized access
    if (error.response?.status === 403) {
      return [];
    }
    
    throw error;
  }
};

// Editar uma avaliação existente
export const editarAvaliacao = async (slug: string, rating: number, comentario: string): Promise<void> => {
  try {
    await api.put(`/avaliacoes/editar/${slug}/`, {
      rating,
      comentario,
    });
  } catch (error) {
    console.error('Erro ao editar avaliação:', error);
    throw error;
  }
};

// Remover uma avaliação
export const removerAvaliacao = async (slug: string): Promise<void> => {
  try {
    await api.delete(`/avaliacoes/remover/${slug}/`);
  } catch (error) {
    console.error('Erro ao remover avaliação:', error);
    throw error;
  }
};

// Adicionar uma nova avaliação
export const adicionarAvaliacao = async (produtoId: string, rating: number, comentario: string): Promise<void> => {
  try {
    await api.post('/avaliacoes/criar/', {
      produto_id: produtoId,
      rating,
      comentario,
    });
  } catch (error) {
    console.error('Erro ao adicionar avaliação:', error);
    throw error;
  }
};

// Carregar avaliações de um produto específico
export const carregarAvaliacoesProduto = async (produtoId: string): Promise<Avaliacao[]> => {
  try {
    const response = await api.get<AvaliacaoResponse[]>(`/avaliacoes/produto/${produtoId}/`);
    return response.data.map((item) => ({
      id: item.id.toString(),
      produtoId: item.produto.toString(),
      userId: item.usuario.toString(),
      userName: item.usuario_nome,
      rating: item.rating,
      comentario: item.comentario,
      data: item.data,
      slug: item.slug,
    }));
  } catch (error) {
    console.error('Erro ao carregar avaliações do produto:', error);
    return [];
  }
};

// Calcular média de avaliações de um produto
export const getMediaAvaliacoes = async (produtoId: string): Promise<number> => {
  try {
    const response = await api.get<MediaResponse>(`/avaliacoes/media/${produtoId}/`);
    return response.data.media;
  } catch (error) {
    console.error('Erro ao carregar média de avaliações:', error);
    return 0;
  }
};



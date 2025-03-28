
import axios from 'axios';
import { API_URL } from '@/config/api';
import { ProdutoFavorito } from '@/types/tipo';
import { getToken } from '@/api/usuarios/usuarioService';

interface FavoritoResponse {
  produto: number;
  produto_nome: string;
  produto_preco: string;
  imagem?: string;
  descricao?: string;
}

const api = axios.create({
  baseURL: API_URL,
});

// Add token to request headers
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const carregarFavoritos = async (): Promise<ProdutoFavorito[]> => {
  try {    
    const response = await api.get<FavoritoResponse[]>('/favoritos/');
    return response.data.map((item) => ({
      id: item.produto.toString(),
      nome: item.produto_nome,
      preco: parseFloat(item.produto_preco),
      imagem: item.imagem || undefined,
      descricao: item.descricao || undefined,
    }));
  } catch (error: any) {
    console.error('Erro ao carregar favoritos:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // Return empty array instead of throwing if user is not authenticated
    if (error.response?.status === 403) {
      console.log('Acesso não autorizado aos favoritos, retornando lista vazia');
      return [];
    }
    
    throw error;
  }
};

export const adicionarFavorito = async (produtoId: string): Promise<void> => {
  try {    
    await api.post('/favoritos/adicionar/', { produto_id: produtoId });
  } catch (error: any) {
    console.error('Erro ao adicionar favorito:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const removeFavorito = async (produtoId: string): Promise<void> => {
  try {      
    await api.delete(`/favoritos/remover/${produtoId}/`);
  } catch (error: any) {
    console.error('Erro ao remover favorito:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};



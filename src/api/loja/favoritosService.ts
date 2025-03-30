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
  withCredentials: true,
});

// Usar o mesmo interceptor já configurado em usuarioService.ts
// Ou adicionar um específico, mas evitar duplicação
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    console.log(`Adicionando token ao header para favoritos ${config.url}: Bearer ${token}`);
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log(`Nenhum token disponível para favoritos ${config.url}`);
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
    console.error('Erro ao carregar favoritos:', error.response?.data);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return [];
    }
    throw error;
  }
};

export const adicionarFavorito = async (produtoId: string): Promise<void> => {
  try {
    await api.post('/favoritos/adicionar/', { produto_id: produtoId });
    console.log(`Favorito ${produtoId} adicionado com sucesso`);
  } catch (error: any) {
    console.error('Erro ao adicionar favorito:', error.response?.data);
    throw error;
  }
};

export const removeFavorito = async (produtoId: string): Promise<void> => {
  try {
    await api.delete(`/favoritos/remover/${produtoId}/`);
  } catch (error: any) {
    console.error('Erro ao remover favorito:', error.response?.data);
    throw error;
  }
};

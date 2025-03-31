import axios from 'axios';
import { API_URL } from '@/config/api';
import { ProdutoFavorito } from '@/types/tipo';

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

export const carregarFavoritos = async (userId: string): Promise<ProdutoFavorito[]> => {
  try {
    console.log('favoritosService: Carregando favoritos para userId:', userId);
    const response = await api.get<FavoritoResponse[]>(`/favoritos/?user_id=${userId}`);
    return response.data.map((item) => ({
      id: item.produto.toString(),
      nome: item.produto_nome,
      preco: parseFloat(item.produto_preco),
      imagem: item.imagem || undefined,
      descricao: item.descricao || undefined,
    }));
  } catch (error: any) {
    console.error('favoritosService: Erro ao carregar favoritos:', error.response?.data || error.message);
    throw error;
  }
};

export const adicionarFavorito = async (produtoId: string, userId: string): Promise<void> => {
  try {
    console.log('favoritosService: Adicionando favorito:', { produtoId, userId });
    await api.post('/favoritos/adicionar/', { 
      produto_id: produtoId, 
      user_id: userId 
    });
    console.log(`favoritosService: Favorito ${produtoId} adicionado com sucesso para o usuário ${userId}`);
  } catch (error: any) {
    console.error('favoritosService: Erro ao adicionar favorito:', error.response?.data || error.message);
    throw error;
  }
};

export const removeFavorito = async (produtoId: string, userId: string): Promise<void> => {
  try {
    console.log('favoritosService: Removendo favorito:', { produtoId, userId });
    await api.delete(`/favoritos/remover/${produtoId}/`, {
      params: { user_id: userId }
    });
    console.log(`favoritosService: Favorito ${produtoId} removido com sucesso para o usuário ${userId}`);
  } catch (error: any) {
    console.error('favoritosService: Erro ao remover favorito:', error.response?.data || error.message);
    throw error;
  }
};
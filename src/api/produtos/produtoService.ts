// src\api\produtos\produtoService.ts
import axios from 'axios';
import { API_URL } from '../../config/api';
import { ProdutoTipos } from '../../types/tipo';

export const getAllProdutos = async (): Promise<ProdutoTipos[]> => {
  try {
    const response = await axios.get<ProdutoTipos[]>(`${API_URL}/produtos/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

export const getProdutoPorId = async (id: string): Promise<ProdutoTipos> => {
  try {
    const response = await axios.get<ProdutoTipos>(`${API_URL}/produtos/id/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar produto ${id} da API:`, error);
    throw error;
  }
};

export const getProdutoPorSlug = async (slug: string): Promise<ProdutoTipos> => {
  try {
    const response = await axios.get<ProdutoTipos>(`${API_URL}/produtos/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar produto ${slug} da API:`, error);
  }
};

export const getProdutosPorCategoria = async (categoriaNome: string): Promise<ProdutoTipos[]> => {
  const produtos = await getAllProdutos();
  return produtos.filter(produto => (produto.categoria || 'Sem Categoria') === categoriaNome);
};

export const getProdutosPorCategoriaCount = async (categoriaNome: string): Promise<number> => {
  const produtos = await getProdutosPorCategoria(categoriaNome);
  return produtos.length;
};

export const salvarProduto = async (data: ProdutoTipos): Promise<ProdutoTipos> => {
  try {
    const response = await axios.post<ProdutoTipos>(`${API_URL}/produtos/`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao salvar produto na API:', error);
    return data;
  }
};

export const atualizarProduto = async (data: ProdutoTipos, slug: string): Promise<ProdutoTipos> => {
  try {
    const response = await axios.put<ProdutoTipos>(`${API_URL}/produtos/${slug}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar produto ${slug} na API:`, error);
    return data;
  }
};

export const removerProduto = async (slug: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/produtos/${slug}/`);
  } catch (error) {
    console.error(`Erro ao deletar produto ${slug} na API:`, error);
  }
};

export const buscarProdutos = async (termo: string): Promise<ProdutoTipos[]> => {
  const termoBusca = termo.toLowerCase();
  try {
    const produtos = await getAllProdutos();
    return produtos.filter(produto => 
      produto.nome.toLowerCase().includes(termoBusca) || 
      produto.descricao.toLowerCase().includes(termoBusca) ||
      produto.categoria.toLowerCase().includes(termoBusca)
    );
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
}

export const decrementarEstoque = async (slug: string, quantidade: number): Promise<void> => {
  try {
    await axios.post(`${API_URL}/produtos/${slug}/decrementar-estoque/`, { quantidade });
    console.log(`Estoque do produto ${slug} decrementado em ${quantidade} unidades`);
  } catch (error) {
    console.error(`Erro ao decrementar estoque do produto ${slug}:`, error);
  }
};

export const incrementarEstoque = async (slug: string, quantidade: number): Promise<void> => {
  try {
    await axios.post(`${API_URL}/produtos/${slug}/incrementar-estoque/`, { quantidade });
  } catch (error) {
    console.error(`Erro ao incrementar estoque do produto ${slug}:`, error);
  }
};


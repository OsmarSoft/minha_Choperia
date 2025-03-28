// src/api/loja/carrinhoService.ts
import axios from 'axios';
import { API_URL } from '@/config/api';
import { ProdutoCarrinho } from '@/types/tipo';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Adiciona um item ao carrinho
export const adicionarItem = async (produto: Omit<ProdutoCarrinho, 'quantidade'>): Promise<void> => {
  console.log('Adicionando item ao carrinho:', produto);
  try {
    const carrinhos = await api.get<ProdutoCarrinho[]>('/carrinhos/');
    if (!carrinhos.data.length) {
      console.log('Nenhum carrinho existente, criando um novo...');
      // Criar um novo carrinho (necessário ajustar backend para suportar isso)
      const novoCarrinho = await api.post<ProdutoCarrinho>('/carrinhos/', { slug: `carrinho-${Date.now()}` });
      console.log('Novo carrinho criado:', novoCarrinho.data);
      const slug = novoCarrinho.data.slug;
      await api.post(`/carrinhos/${slug}/adicionar-item/`, {
        produto_id: produto.id,
        slug: produto.slug, // Enviar o slug do produto
        quantidade: 1,
        empresa_id: produto.empresaId,
      });
    } else {
      const carrinho = carrinhos.data[0];
      await api.post(`/carrinhos/${carrinho.slug}/adicionar-item/`, {
        produto_id: produto.id,
        slug: produto.slug, // Enviar o slug do produto
        quantidade: 1,
        empresa_id: produto.empresaId,
      });
    }
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    throw error;
  }
};

// Remove um item do carrinho
export const removerItem = async (itemSlug: string): Promise<void> => {
  try {
    const carrinhos = await api.get('/carrinhos/');
    const carrinho = carrinhos.data[0];
    if (!carrinho) throw new Error('Nenhum carrinho encontrado');
    await api.post(`/carrinhos/${carrinho.slug}/remover-item/`, {
      item_slug: itemSlug, // Usa o produto_slug conforme ajustado anteriormente
    });
    console.log(`Item ${itemSlug} removido com sucesso do carrinho ${carrinho.slug}`);
  } catch (error) {
    console.error('Erro ao remover item do carrinho:', error);
    throw error;
  }
};

// Carrega o carrinho do usuário/sessão
export const carregarCarrinho = async (): Promise<ProdutoCarrinho[]> => {
  try {
    const response = await api.get('/carrinhos/');
    const carrinhos = response.data;
    const carrinho = carrinhos[0];
    if (!carrinho) return [];
    return carrinho.itens.map((item: any) => ({
      id: item.produto.toString(),
      nome: item.produto_nome,
      preco: parseFloat(item.preco_unitario),
      venda: parseFloat(item.preco_unitario),
      quantidade: item.quantidade,
      slug: item.produto_slug, // Usa produto_slug
      empresaId: item.empresa_id || undefined,
    }));
  } catch (error) {
    console.error('Erro ao carregar carrinho:', error);
    throw error;
  }
};

// Atualiza a quantidade de um item 
export const atualizarQuantidade = async (itemSlug: string, quantidade: number): Promise<void> => {
  try {
    const carrinhos = await api.get('/carrinhos/');
    const carrinho = carrinhos.data[0];
    if (!carrinho) throw new Error('Nenhum carrinho encontrado');
    await api.put(`/carrinhos/${carrinho.slug}/atualizar-item/`, {
      item_slug: itemSlug,
      quantidade,
    }); // TODO: Implementar esse endpoint no backend
  } catch (error) {
    console.error('Erro ao atualizar quantidade:', error);
    throw error;
  }
};

// Limpa o carrinho
export const limparCarrinho = async (): Promise<void> => {
  try {
    const carrinhos = await api.get('/carrinhos/');
    const carrinho = carrinhos.data[0];
    if (!carrinho) return;
    await api.post(`/carrinhos/${carrinho.slug}/cancelar-pedido/`);
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error);
    throw error;
  }
};

export const deletarCarrinho = async (slug: string): Promise<any> => {
  try {
    const response = await axios.delete(`${API_URL}/carrinhos/${slug}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar carrinho:', error);
    throw error;
  }
};

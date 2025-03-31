
// src/api/loja/carrinhoService.ts
import axios from 'axios';
import { API_URL } from '@/config/api';
import { ProdutoCarrinho } from '@/types/tipo';

const api = axios.create({
  baseURL: API_URL,
});

// Adiciona um item ao carrinho
export const adicionarItem = async (produto: Omit<ProdutoCarrinho, 'quantidade'>): Promise<void> => {
  console.log('Adicionando item ao carrinho:', produto);
  try {
    const carrinhos = await api.get<ProdutoCarrinho[]>('/carrinhos/');
    const carrinhoData = carrinhos.data;

    if (!carrinhoData || !Array.isArray(carrinhoData) || carrinhoData.length === 0) {
      console.log('Nenhum carrinho existente, criando um novo...');
      // Criar um novo carrinho
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
      const carrinho = carrinhoData[0];
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
    const carrinhoResponse = await api.get('/carrinhos/');
    const carrinhoData = carrinhoResponse.data;

    if (!carrinhoData || !Array.isArray(carrinhoData) || carrinhoData.length === 0) {
      console.log('Nenhum carrinho encontrado para remover item');
      return;
    }

    const carrinho = carrinhoData[0];
    if (!carrinho) {
      console.log('Não foi possível encontrar o carrinho');
      return;
    }

    await api.post(`/carrinhos/${carrinho.slug}/remover-item/`, {
      item_slug: itemSlug,
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

    if (!carrinhos || !Array.isArray(carrinhos) || carrinhos.length === 0) {
      return [];
    }

    const carrinho = carrinhos[0];
    if (!carrinho || !carrinho.itens || !Array.isArray(carrinho.itens)) {
      return [];
    }

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
    // Retornar array vazio em caso de erro para evitar quebras na UI
    return [];
  }
};

// Atualiza a quantidade de um item 
export const atualizarQuantidade = async (itemSlug: string, quantidade: number): Promise<void> => {
  try {
    const carrinhoResponse = await api.get('/carrinhos/');
    const carrinhoData = carrinhoResponse.data;

    if (!carrinhoData || !Array.isArray(carrinhoData) || carrinhoData.length === 0) {
      console.log('Nenhum carrinho encontrado para atualizar quantidade');
      return;
    }

    const carrinho = carrinhoData[0];
    if (!carrinho) {
      console.log('Não foi possível encontrar o carrinho');
      return;
    }

    await api.put(`/carrinhos/${carrinho.slug}/atualizar-item/`, {
      item_slug: itemSlug,
      quantidade,
    });
  } catch (error) {
    console.error('Erro ao atualizar quantidade:', error);
    throw error;
  }
};

// Limpa o carrinho
export const limparCarrinho = async (): Promise<void> => {
  try {
    const carrinhoResponse = await api.get('/carrinhos/');
    const carrinhoData = carrinhoResponse.data;

    if (!carrinhoData || !Array.isArray(carrinhoData) || carrinhoData.length === 0) {
      console.log('Nenhum carrinho encontrado para limpar');
      return;
    }

    const carrinho = carrinhoData[0];
    if (!carrinho) {
      console.log('Não foi possível encontrar o carrinho');
      return;
    }

    await api.post(`/carrinhos/${carrinho.slug}/cancelar-pedido/`);
    console.log(`Carrinho ${carrinho.slug} limpo com sucesso`);
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error);
    throw error;
  }
};

export const deletarCarrinho = async (slug: string): Promise<any> => {
  try {
    const response = await api.delete(`/carrinhos/${slug}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar carrinho:', error);
    throw error;
  }
};

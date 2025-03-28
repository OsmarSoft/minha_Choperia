//src\api\mesas\itemService.ts
import axios from 'axios';
import { API_URL } from '../../config/api';
import { PedidoItem } from '../../types/tipo';
import { incrementarEstoque, decrementarEstoque } from '@/api/produtos/produtoService';
import { registrarMovimentacaoSaida } from '@/api/estoque/estoqueService';

export const adicionarItemMesa = async (slug: string, item: PedidoItem) => {
  console.log('🚀 Enviando para API:', `${API_URL}/mesas/${slug}/adicionar-item/`);
  const payload = { 
    produto_id: item.produtoId || item.id,  // Priorizar produtoId
    quantidade: item.quantidade,
    produto_slug: item.slug 
  };
  console.log('📌 Payload enviado:', payload);
  try {
    const response = await axios.post(`${API_URL}/mesas/${slug}/adicionar-item/`, payload);
    console.log('✅ Resposta da API:', response.data);
    // await decrementarEstoque(item.slug, item.quantidade);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erro ao adicionar item:", error.response?.data || error);
    throw error;
  }
};

export const removerItemMesa = async (slug: string, produtoId: string | number): Promise<any> => {
  console.log("🚀 Removendo item da mesa:", slug, produtoId);

  const url = `${API_URL}/mesas/${slug}/remover-item/`;
  const payload = { produto_id: Number(produtoId) }; // 🔥 Garante que o ID é um número

  console.log("🔍 URL:", url);
  console.log("🔍 Payload:", payload);

  try {
    const response = await axios.post(url, payload);
    console.log("✅ Item removido com sucesso:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao remover item:", error.response?.data || error);
    throw error;
  }
};

export const cancelarItensMesa = async (slug: string, itensMesa: PedidoItem[]): Promise<any> => {
  console.log('🚀 Cancelando todos os itens da:', slug);
  const url = `${API_URL}/mesas/${slug}/cancelar-pedido/`;
  try {
    const response = await axios.post(url);
    itensMesa.map((item) => incrementarEstoque(item.slug, item.quantidade));
    console.log('✅ Itens da mesa cancelados:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao cancelar itens da mesa:', error.response?.data || error);
    throw error;
  }
};




// src\api\mesas\mesaService.ts
import axios from 'axios';
import { API_URL } from '../../config/api';
import {  
  atualizarMesa as atualizarMesaStorage,
} from '../../data/mesa_storage';
import { Mesa, PedidoItem } from '../../types/tipo';
import { registrarMovimentacaoSaida } from '@/api/estoque/estoqueService';

export const getAllMesas = async (): Promise<Mesa[]> => {
  try {
    const response = await axios.get<Mesa[]>(`${API_URL}/mesas/`);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar mesas:', error);
    throw error;
  }
};

export const getMesaBySlug = async (slug: string): Promise<Mesa | undefined> => {
  // Primeiro, tentamos buscar da API
  try {
    const response = await axios.get<Mesa>(`${API_URL}/mesas/${slug}/`);
    console.log('✅ Mesa encontrada na API:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao buscar mesa pelo slug ${slug}, utilizando localStorage:`, error);
  }
};

export const salvarMesa = async (data: Omit<Mesa, 'id'>): Promise<Mesa> => {
  try {
    const response = await axios.post(`${API_URL}/mesas/`, data);
    return response.data as Mesa;
  } catch (error) {
    console.error('Erro ao salvar mesa:', error);
  }
};

export const atualizarMesa = async (slug: string, mesaData: Partial<Mesa>): Promise<void> => {
  try {
    return atualizarMesaStorage(slug, mesaData);
  } catch (error) {
    console.error('Erro ao atualizar mesa:', error);
    throw error;
  }
};

export const deletarMesa = async (slug: string): Promise<any> => {
  try {
    const response = await axios.delete(`${API_URL}/mesas/${slug}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar mesa:', error);
    throw error;
  }
};

// Função para limpar todos os itens do pedido da mesa pelo slug da mesa
export const limparMesa = async (slug: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/mesas/${slug}/cancelar-pedido/`);
    console.log('✅ Mesa limpa:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erro ao limpar mesa:", error.response?.data || error);
    throw error;
  }
};

// Função para confirmar o pagamento da mesa
export const confirmarPagamento = async (
  itemSlug: string,
  itensPedido: PedidoItem[],
  not_numerico: boolean = false
): Promise<any> => {
  try {
    console.log('🚀 Confirmando pagamento do pedido:', itemSlug);
    console.log('🔍 Itens do pedido:', itensPedido);
    console.log('📌 É pedido de balcão?', not_numerico);

    if (itensPedido.length === 0) {
      throw new Error('Nenhum item para registrar movimentação');
    }

    // Registrar movimentação de saída no estoque
    await registrarMovimentacaoSaida(itensPedido);

    // If it's a counter order, delete the table; otherwise, just clear it
    const response = not_numerico
      ? await deletarMesa(itemSlug) // New function to delete the table
      : await limparMesa(itemSlug); // Existing function to clear the table

    console.log('✅ Pagamento confirmado:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Erro ao confirmar pagamento:', error.response?.data || error.message);
    throw new Error(`Erro ao confirmar pagamento: ${error.message}`);
  }
};


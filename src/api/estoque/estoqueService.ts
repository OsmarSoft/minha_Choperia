// src/api/estoque/estoqueService.ts
import axios from 'axios';
import { API_URL } from '../../config/api';
import { MovimentacaoEstoque, PedidoItem } from '../../types/tipo';

export const getMovimentacoesEstoque = async (): Promise<MovimentacaoEstoque[]> => {
  try {
    const response = await axios.get<MovimentacaoEstoque[]>(`${API_URL}/estoques/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estoques:', error);
    throw error;
  }
};

export const registrarMovimentacaoEntrada = (produtoId: number, quantidade: number): void => {
  // Foi implementado direto no modelo Produto no caso de um produto ser adicionado
};

export const registrarMovimentacaoSaida = async (itens: PedidoItem[]): Promise<void> => {
  try {
    console.log('🚀 Registrando movimentação de saída para itens:', itens);
    const payload = itens.map(item => ({
      empresa: item.empresaId,
      produto: item.produtoId, // Ajustar para o campo esperado pelo backend
      quantidade: item.quantidade,
      tipo: 'saída',
    }));
    console.log('📌 Payload enviado:', payload);
    await axios.post(`${API_URL}/estoques/`, payload);
    console.log('✅ Movimentação de saída registrada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao registrar movimentação de saída:', error);
    throw error;
  }
};


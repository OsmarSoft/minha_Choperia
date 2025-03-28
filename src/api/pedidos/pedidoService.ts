
// src/api/pedidos/pedidoService.ts

import axios from 'axios';
import { API_URL } from '../../config/api';
import { Pedido, PedidoItem, PedidoResponse } from '@/types/tipo';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all orders for the current user
/*
export const carregarPedidosUsuario = async (): Promise<Pedido[]> => {
  try {
    console.log('🔍 Carregando pedidos do usuário...');
    const response = await api.get<Pedido[]>('/pedidos/historico/');
    console.log('✅ Pedidos carregados:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao carregar pedidos do usuário:', error);
    // Return an empty array on error to prevent app crashes
    return [];
  }
};
*/

export const carregarPedidosUsuario = async (): Promise<Pedido[]> => {
  try {
    const response = await axios.get<Pedido[]>(`${API_URL}/pedidos/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
};

// Get all orders (admin)
export const getAllPedidos = async (): Promise<Pedido[]> => {
  try {
    const response = await api.get<Pedido[]>('/pedidos/');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar todos os pedidos:', error);
    return [];
  }
};

// Get orders for a specific mesa
export const carregarPedidosMesa = async (mesaSlug: string): Promise<Pedido[]> => {
  try {
    const response = await api.get<Pedido[]>(`/pedidos-search/`, {
      params: {
        mesa_slug: mesaSlug
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar pedidos da mesa:', error);
    return [];
  }
};

// Get all physical orders
export const carregarPedidosFisicos = async (): Promise<Pedido[]> => {
  try {
    const response = await api.get<Pedido[]>(`/pedidos-search/`, {
      params: {
        origem: 'fisica'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar pedidos físicos:', error);
    return [];
  }
};

// Get all online orders
export const carregarTodosPedidosOnline = async (): Promise<Pedido[]> => {
  try {
    const response = await api.get<Pedido[]>(`/pedidos-search/`, {
      params: {
        origem: 'online'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar pedidos online:', error);
    return [];
  }
};

// Create an order for a mesa
export const criarPedidoMesa = async (mesaSlug: string, empresaId: string, metodoPagamento: string): Promise<Pedido> => {
  try {
    const response = await api.post<Pedido>(`/pedidos/mesa/${mesaSlug}/criar/`, {
      empresa_id: empresaId,
      metodo_pagamento: metodoPagamento
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar pedido da mesa:', error);
    throw error;
  }
};

// Interface for the online order creation payload
interface PedidoOnlineData {
  carrinhoSlug: string;
  empresaId: string;
  metodoPagamento: string;
  itens: PedidoItem[];
  total: number;
  descontoAplicado?: number;
}

// Create an online order from a cart
export const criarPedidoOnline = async (data: PedidoOnlineData): Promise<Pedido> => {
  try {
    console.log('🚀 Iniciando criação de pedido online com os dados:', data);

    // Convert frontend data format to backend format
    const payload = {
      carrinho_slug: data.carrinhoSlug,
      empresa_id: data.empresaId,
      metodo_pagamento: data.metodoPagamento,
      itens: data.itens,
      total: data.total,
      desconto_aplicado: data.descontoAplicado
    };

    console.log('📤 Payload preparado para envio:', payload);
    console.log('🔗 URL da requisição:', `${API_URL}/pedidos/carrinho/${data.carrinhoSlug}/criar/`);

    console.log('🌐 Enviando requisição POST para o backend...');
    const response = await api.post<Pedido>(`/pedidos/carrinho/${data.carrinhoSlug}/criar/`, payload);
    console.log('✅ Pedido criado com sucesso:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Erro ao criar pedido online:', error);
    throw error;
  }
};

// Update order status
export const atualizarStatusPedidoOnline = async (pedidoSlug: string, novoStatus: string): Promise<boolean> => {
  try {
    await api.put(`/pedidos/${pedidoSlug}/atualizar-status/`, {
      status: novoStatus
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return false;
  }
};

// Confirm order receipt
export const confirmarRecebimentoPedido = async (pedidoSlug: string): Promise<boolean> => {
  try {
    await api.post(`/pedidos/${pedidoSlug}/confirmar-recebimento/`);
    return true;
  } catch (error) {
    console.error('Erro ao confirmar recebimento do pedido:', error);
    return false;
  }
};

// Cancel order
export const cancelarPedido = async (pedidoSlug: string): Promise<boolean> => {
  try {
    await api.put(`/pedidos/${pedidoSlug}/atualizar-status/`, {
      status: 'cancelado'
    });
    return true;
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    return false;
  }
};

// Export all functions
export {
  api as pedidoApi
};

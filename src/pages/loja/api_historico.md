Ajustar o pedidoService.ts para criar pedidos via API
Atualizar o Checkout.tsx para criar pedidos na API
Atualizar o Historico.tsx para carregar pedidos da API
Atualizar o PedidosOnline.tsx para carregar e gerenciar pedidos da API
Remover dependências do localStorage
Vamos por partes:

1. Ajustar o pedidoService.ts
O pedidoService.ts já tem funções como carregarPedidosUsuario, atualizarStatusPedidoOnline e confirmarRecebimentoPedido que interagem com a API. Precisamos adicionar uma função para criar pedidos (criarPedidoOnline) e garantir que ela seja usada no Checkout.tsx.

// Função para criar um pedido online
export const criarPedidoOnline = async (pedidoData: {
  empresaId: string;
  metodoPagamento: string;
  itens: PedidoItem[];
  total: number;
  cupomCodigo?: string;
  descontoAplicado?: number;
}): Promise<Pedido> => {
  try {
    const response = await api.post<PedidoResponse>('/pedidos/criar/', {
      empresa_id: pedidoData.empresaId,
      metodo_pagamento: pedidoData.metodoPagamento,
      itens: pedidoData.itens.map(item => ({
        produto_id: item.id,
        quantidade: item.quantidade,
        preco_unitario: item.precoUnitario,
      })),
      total: pedidoData.total,
      cupom_codigo: pedidoData.cupomCodigo,
      desconto_aplicado: pedidoData.descontoAplicado || 0,
    });

    return {
      id: response.data.slug,
      data: response.data.created,
      status: response.data.status,
      items: response.data.itens.map(item => ({
        id: item.id.toString(),
        nome: item.produto_nome,
        quantidade: item.quantidade,
        precoUnitario: parseFloat(item.preco_unitario),
        total: parseFloat(item.total),
      })),
      total: parseFloat(response.data.total),
      metodoPagamento: response.data.metodo_pagamento,
    };
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
};


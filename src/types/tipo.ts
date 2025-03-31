//src/types/tipo.ts

export interface Empresa {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  cnpj: string;
  email: string;
  responsavel: string;
  notasFiscais?: NotaFiscal[];
  slug: string; // Adicionando slug
}

export interface NotaFiscal {
  id: string;
  empresaId: string;
  numero: string;
  valor: number;
  dataEmissao: string;
  itens: Array<{
    descricao: string;
    quantidade: number;
    valorUnitario: number;
  }>;
  slug: string; // Adicionando slug
}

export interface Mesa {
  id ?: number;
  nome: string;
  numero?: string;
  slug: string;
  ocupada: boolean;
  empresa: string;
  pedido: number;
  items: PedidoItem[];
  pedidos: PedidoItem[];
  status?: 'Ocupada' | 'Livre' | 'Reservada';
  valor_pago: number;
  pessoas_pagaram: number;
  numero_pessoas?: number;
  is_available?: boolean;
  dataAbertura?: string;
  horaAbertura?: string;
  not_numerico?: boolean;
  valor_total?: number;
  em_preparo?: boolean;
}

export interface PedidoItem {
  id?: string | number;  // ID do ItemMesa (opcional, gerado pelo backend)
  produtoId?: string | number;  // ID do Produto (usado ao adicionar)
  nome: string;
  quantidade: number;
  precoUnitario: number;
  preco_unitario?: string;
  total: number;
  slug: string;
  empresaId?: string;
  venda?: number;
  preco?: number;
  produto_nome?: string;
}


export interface Pedido {
  id: string;
  data: string;
  status: string;
  items: PedidoItem[];
  total: number;
  metodoPagamento?: string;
  cliente?: {
    nome: string;
    telefone: string;
    endereco: string;
  };
  slug?: string; // Adicionando slug
}

export interface ProdutoTipos {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  custo: number;
  venda: number;
  codigo: string;
  estoque: number;
  empresa: string;
  is_available: boolean;
  imagem?: string;
  slug: string;
  produto?: ProdutoTipos;
  precoUnitario?: number;
  total?: number;
  created?: string;
  updated?: string;
}

// Tipo para a resposta do backend
export interface PedidoResponse {
  id: number; // ID numérico retornado pelo backend
  criado_em: string; // Data de criação
  total: string; // Total como string (será convertido para number no frontend)
  metodo_pagamento: string; // Método de pagamento
  itens: {
    produto: number; // ID do produto
    produto_nome: string; // Nome do produto
    quantidade: number;
    preco_unitario: string; // Preço como string (será convertido)
    slug: string;
  }[];
  slug?: string; // Slug do pedido (usado em algumas rotas)
  empresa_id?: number; // ID da empresa (opcional)
  created?: string; // Para histórico, se o campo for diferente de criado_em
  status?: string; // Status do pedido (se retornado)
  usuario?: {
    username: string;
    phone?: string;
    address?: string;
  }; // Dados do usuário, se retornado
}

export interface EstoqueItem {
  id: string;
  nome: string;
  quantidade: number;
  estoque: number;
  slug: string; // Adicionando slug
}

export interface Categoria {
  id: string;
  nome: string;
  slug: string; // Adicionando slug
}

export interface MovimentacaoEstoque {
  id: number;
  produto: string;  // Alterado de number para string para corresponder ao id do produto
  quantidade: number;
  tipo: 'entrada' | 'saída' | 'saida'; // Adicionado 'saida' sem acento
  data: string;
  slug?: string;
  empresa?: string; // Adicionado campo empresa para registrar a empresa do produto
  created?: string; // Adicionado campo created para registrar a data de criação. // Deve ser string, pois vem do backend como ISO (ex.: "2025-03-22T18:08:00.000-03:00")
}

export interface Avaliacao {
  id: string;
  produtoId: string;
  userId: string;
  userName: string;
  rating: number;
  comentario: string;
  data: string;
  slug: string;
  produtoNome?: string; // Opcional, usado em Avaliacoes.tsx
}

export interface ProdutoCarrinho {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
  venda?: number;
  slug: string;
  empresaId?: string; // Adicionando o ID da empresa
}

export interface ProdutoFavorito {
  id: string;
  nome: string;
  preco: number;
  imagem?: string;
  descricao?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'online' | 'physical';
  slug: string;
}

export type UserType = 'physical' | 'online';

export type Item = {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
  total: number;
  slug: string;
};
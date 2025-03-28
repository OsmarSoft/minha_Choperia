
// src/data/estoque_storage.ts
import { MovimentacaoEstoque, ProdutoTipos } from '@/types/tipo';

// Dados iniciais mockados para movimentações de estoque
const initialMovimentacoes: MovimentacaoEstoque[] = [
  { id: 1, produto: '1', tipo: 'entrada', quantidade: 10, data: '2023-10-01', slug: 'cerveja' },
  { id: 2, produto: '2', tipo: 'saída', quantidade: 5, data: '2023-10-02', slug: 'hamburguer' },
  { id: 3, produto: '3', tipo: 'entrada', quantidade: 8, data: '2023-10-03', slug: 'sorvete' },
];

// Dados iniciais mockados para produtos
const initialProdutos: { [key: string]: ProdutoTipos } = {
  '1': { id: '1', nome: 'Cerveja', slug: 'cerveja', venda: 5.00, categoria: 'Bebidas', estoque: 10, custo: 2.50, descricao: 'Cerveja gelada', imagem: 'cerveja.jpg', codigo: '0001', 
    empresa: 'Cervejaria', precoUnitario: 5.00, total: 50.00, is_available: true, created: '2023-10-01', updated: '2023-10-01', produto: { id: '1', nome: 'Cerveja', slug: 'cerveja', venda: 5.00, categoria: 'Bebidas', estoque: 10, custo: 2.50, descricao: 'Cerveja gelada', imagem: 'cerveja.jpg', codigo: '0001',
    empresa: 'Cervejaria', precoUnitario: 5.00, total: 50.00, is_available: true, created: '2023-10-01', updated: '2023-10-01' } },
  '2': { id: '2', nome: 'Hambúrguer', slug: 'hamburguer', venda: 15.00, categoria: 'Lanches', estoque: 5, custo: 7.50, descricao: 'Hambúrguer artesanal', imagem: 'hamburguer.jpg', codigo: '0002',
    empresa: 'Lanchonete', precoUnitario: 15.00, total: 75.00, is_available: true, created: '2023-10-02', updated: '2023-10-02', produto: { id: '2', nome: 'Hambúrguer', slug: 'hamburguer', venda: 15.00, categoria: 'Lanches', estoque: 5, custo: 7.50, descricao: 'Hambúrguer artesanal', imagem: 'hamburguer.jpg', codigo: '0002',
    empresa: 'Lanchonete', precoUnitario: 15.00, total: 75.00, is_available: true, created: '2023-10-02', updated: '2023-10-02' } },
  '3': { id: '3', nome: 'Sorvete', slug: 'sorvete', venda: 8.00, categoria: 'Sobremesas', estoque: 8, custo: 4.00, descricao: 'Sorvete de chocolate', imagem: 'sorvete.jpg', codigo: '0003',
    empresa: 'Sorveteria', precoUnitario: 8.00, total: 64.00, is_available: true, created: '2023-10-03', updated: '2023-10-03', produto: { id: '3', nome: 'Sorvete', slug: 'sorvete', venda: 8.00, categoria: 'Sobremesas', estoque: 8, custo: 4.00, descricao: 'Sorvete de chocolate', imagem: 'sorvete.jpg', codigo: '0003',
    empresa: 'Sorveteria', precoUnitario: 8.00, total: 64.00, is_available: true, created: '2023-10-03', updated: '2023-10-03' } },
};

// Função para obter movimentações do cache ou valores iniciais
export const getCachedMovimentacoes = (): MovimentacaoEstoque[] => {
  const cached = localStorage.getItem('movimentacoesEstoque');
  return cached ? JSON.parse(cached) : initialMovimentacoes;
};

// Função para obter produtos do cache ou valores iniciais
export const getCachedProdutos = (): { [key: string]: ProdutoTipos } => {
  const cached = localStorage.getItem('produtosEstoque');
  return cached ? JSON.parse(cached) : initialProdutos;
};

// Função para salvar movimentações e produtos no localStorage
export const saveToLocalStorage = (
  movimentacoes: MovimentacaoEstoque[],
  produtos: { [key: string]: ProdutoTipos }
) => {
  localStorage.setItem('movimentacoesEstoque', JSON.stringify(movimentacoes));
  localStorage.setItem('produtosEstoque', JSON.stringify(produtos));
};

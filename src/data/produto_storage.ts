
import { ProdutoTipos } from '@/types/tipo';

// Função para salvar produtos no localStorage
export const salvarProdutos = (produtos: ProdutoTipos[]): void => {
  localStorage.setItem('produtos', JSON.stringify(produtos));
};

// Função para obter produtos do localStorage
export const obterProdutos = (): ProdutoTipos[] => {
  const produtosString = localStorage.getItem('produtos');
  return produtosString ? JSON.parse(produtosString) : [];
};

// Função para adicionar um produto ao localStorage
export const adicionarProduto = (produto: ProdutoTipos): void => {
  const produtos = obterProdutos();
  produtos.push(produto);
  salvarProdutos(produtos);
};

// Função para atualizar um produto no localStorage
export const atualizarProduto = (produto: ProdutoTipos): void => {
  const produtos = obterProdutos();
  const index = produtos.findIndex((p) => p.id === produto.id);
  if (index !== -1) {
    produtos[index] = produto;
    salvarProdutos(produtos);
  }
};

// Função para remover um produto do localStorage
export const removerProduto = (produtoId: string | number): void => {
  const id = String(produtoId);
  const produtos = obterProdutos();
  const novosProdutos = produtos.filter((p) => String(p.id) !== id);
  salvarProdutos(novosProdutos);
};

// Função para obter um produto específico do localStorage
export const obterProdutoPorId = (produtoId: string | number): ProdutoTipos | undefined => {
  const id = String(produtoId);
  const produtos = obterProdutos();
  return produtos.find((p) => String(p.id) === id);
};

// Funções para controle de estoque
export const decrementarEstoque = (produtoId: string | number, quantidade: number = 1): boolean => {
  const produto = obterProdutoPorId(produtoId);
  if (produto && produto.estoque && produto.estoque >= quantidade) {
    produto.estoque -= quantidade;
    atualizarProduto(produto);
    return true;
  }
  return false;
};

export const incrementarEstoque = (produtoId: string | number, quantidade: number = 1): void => {
  const produto = obterProdutoPorId(produtoId);
  if (produto) {
    produto.estoque = (produto.estoque || 0) + quantidade;
    atualizarProduto(produto);
  }
};

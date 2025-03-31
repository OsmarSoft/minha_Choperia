

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProdutoCarrinho } from '@/types/tipo';
import { carregarCarrinho, adicionarItem as adicionarItemApi, removerItem as removerItemApi, atualizarQuantidade as atualizarQuantidadeApi, limparCarrinho as limparCarrinhoApi } from '@/api/loja/carrinhoService';
import { toast } from 'sonner';

interface CarrinhoContextType {
  carrinho: ProdutoCarrinho[];
  adicionarItem: (produto: Omit<ProdutoCarrinho, 'quantidade'>) => Promise<void>;
  removerItem: (slug: string) => Promise<void>;
  atualizarQuantidade: (slug: string, quantidade: number) => Promise<void>;
  limparCarrinho: () => Promise<void>;
  totalCarrinho: number;
  subtotalCarrinho: number;
  quantidadeItens: number;
  carrinhoSlug: string | null;
  carregando: boolean;
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);
const API_URL = 'http://127.0.0.1:8004/api';

export const CarrinhoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [carrinho, setCarrinho] = useState<ProdutoCarrinho[]>([]);
  const [carrinhoSlug, setCarrinhoSlug] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const fetchCarrinho = async () => {
    try {
      setCarregando(true);
      const carrinhoData = await carregarCarrinho();
      setCarrinho(carrinhoData);

      // Tentar obter o slug do carrinho
      const response = await fetch(`${API_URL}/carrinhos/`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setCarrinhoSlug(data[0]?.slug || null);
      }
    } catch (error) {
      console.error('Erro ao inicializar carrinho:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    fetchCarrinho();
  }, []);

  const adicionarItem = async (produto: Omit<ProdutoCarrinho, 'quantidade'>) => {
    try {
      setCarregando(true);

      // Atualiza a UI para feedback imediato
      const novoItem: ProdutoCarrinho = {
        ...produto,
        quantidade: 1,
      };

      setCarrinho((carrinhoAtual) => {
        const itemExistente = carrinhoAtual.find((item) => item.id === produto.id);
        if (itemExistente) {
          return carrinhoAtual.map((item) =>
            item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
          );
        } else {
          return [...carrinhoAtual, novoItem];
        }
      });

      // Chama a API
      await adicionarItemApi(produto);

      // Atualiza o carrinho para garantir sincronização
      await fetchCarrinho();

      toast.success(`${produto.nome} adicionado ao carrinho`);
    } catch (error) {
      console.error('Erro ao adicionar item ao carrinho:', error);
      await fetchCarrinho();
      toast.error('Não foi possível adicionar o item ao carrinho');
    } finally {
      setCarregando(false);
    }
  };

  const removerItem = async (slug: string) => {
    try {
      const itemRemovido = carrinho.find((item) => item.slug === slug);
      setCarrinho((carrinhoAtual) => carrinhoAtual.filter((item) => item.slug !== slug));

      await removerItemApi(slug);

      await fetchCarrinho();

      if (itemRemovido) {
        toast.success(`${itemRemovido.nome} removido do carrinho`);
      }
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
      await fetchCarrinho();
      throw error;
    }
  };

  const atualizarQuantidade = async (slug: string, quantidade: number) => {
    try {
      if (quantidade <= 0) {
        setCarrinho((carrinhoAtual) => carrinhoAtual.filter((item) => item.slug !== slug));
      } else {
        setCarrinho((carrinhoAtual) =>
          carrinhoAtual.map((item) => (item.slug === slug ? { ...item, quantidade } : item))
        );
      }

      if (quantidade <= 0) {
        await removerItemApi(slug);
      } else {
        await atualizarQuantidadeApi(slug, quantidade);
      }

      await fetchCarrinho();
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      await fetchCarrinho();
      throw error;
    }
  };

  const limparCarrinho = async () => {
    try {
      setCarrinho([]);
      await limparCarrinhoApi();
      await fetchCarrinho();
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      await fetchCarrinho();
      throw error;
    }
  };

  const subtotalCarrinho = carrinho.reduce((acc, item) => acc + (item.venda || item.preco) * item.quantidade, 0);
  const totalCarrinho = subtotalCarrinho;
  const quantidadeItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <CarrinhoContext.Provider
      value={{
        carrinho,
        adicionarItem,
        removerItem,
        atualizarQuantidade,
        limparCarrinho,
        totalCarrinho,
        subtotalCarrinho,
        quantidadeItens,
        carrinhoSlug,
        carregando,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => {
  const context = useContext(CarrinhoContext);
  if (!context) throw new Error('useCarrinho deve ser usado dentro de um CarrinhoProvider');
  return context;
};

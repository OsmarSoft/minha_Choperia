import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProdutoCarrinho } from '@/types/tipo';
import { carregarCarrinho, adicionarItem as adicionarItemApi, removerItem as removerItemApi, atualizarQuantidade as atualizarQuantidadeApi, limparCarrinho as limparCarrinhoApi } from '@/api/loja/carrinhoService';
import axios from 'axios';
import { API_URL } from '@/config/api';

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
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);

export const CarrinhoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [carrinho, setCarrinho] = useState<ProdutoCarrinho[]>([]);
  const [carrinhoSlug, setCarrinhoSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarrinho = async () => {
      try {
        const carrinhoData = await carregarCarrinho();
        setCarrinho(carrinhoData);
        const response = await axios.get(`${API_URL}/carrinhos/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        });
        setCarrinhoSlug(response.data[0]?.slug || null);
      } catch (error) {
        console.error('Erro ao inicializar carrinho:', error);
      }
    };
    fetchCarrinho();
  }, []);

  const adicionarItem = async (produto: Omit<ProdutoCarrinho, 'quantidade'>) => {
    await adicionarItemApi(produto);
    const updatedCarrinho = await carregarCarrinho();
    setCarrinho(updatedCarrinho);
    if (!carrinhoSlug) {
      const response = await axios.get(`${API_URL}/carrinhos/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      setCarrinhoSlug(response.data[0]?.slug || null);
    }
  };

  const removerItem = async (slug: string) => {
    await removerItemApi(slug);
    const updatedCarrinho = await carregarCarrinho();
    setCarrinho(updatedCarrinho);
  };

  const atualizarQuantidade = async (slug: string, quantidade: number) => {
    if (quantidade <= 0) {
      await removerItem(slug);
    } else {
      await atualizarQuantidadeApi(slug, quantidade);
      const updatedCarrinho = await carregarCarrinho();
      setCarrinho(updatedCarrinho);
    }
  };

  const limparCarrinho = async () => {
    await limparCarrinhoApi();
    setCarrinho([]);
    setCarrinhoSlug(null);
  };

  const subtotalCarrinho = carrinho.reduce((acc, item) => acc + (item.venda || item.preco) * item.quantidade, 0);
  const totalCarrinho = subtotalCarrinho;
  const quantidadeItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <CarrinhoContext.Provider value={{
      carrinho,
      adicionarItem,
      removerItem,
      atualizarQuantidade,
      limparCarrinho,
      totalCarrinho,
      subtotalCarrinho,
      quantidadeItens,
      carrinhoSlug,
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => {
  const context = useContext(CarrinhoContext);
  if (!context) throw new Error('useCarrinho deve ser usado dentro de um CarrinhoProvider');
  return context;
};
// src/pages/loja/Produtos.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeartIcon, ShoppingCart, Search } from "lucide-react";
import { useFavoritos } from '@/components/loja/favoritosApi';
import { useCarrinho } from '@/components/loja/carrinhoApi';
import { useToast } from '@/components/ui/use-toast';
import { getAllProdutos, buscarProdutos } from '@/api/produtos/produtoService';
import { ProdutoTipos } from '@/types/tipo';
import CarrinhoDrawer from '@/components/loja/CarrinhoDrawer';

const Produtos = () => {
  const [produtos, setProdutos] = useState<ProdutoTipos[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const { favoritos, adicionarFavorito, removerFavorito, isFavorito } = useFavoritos();
  const { adicionarItem } = useCarrinho();
  const { toast } = useToast();

  useEffect(() => {
    const carregarProdutos = async () => {
      const todosProdutos = await getAllProdutos();
      setProdutos(todosProdutos);
    };
    
    carregarProdutos();
  }, []);

  const handleFavoritar = (produto: ProdutoTipos) => {
    if (isFavorito(produto.id)) {
      removerFavorito(produto.id);
      toast({
        title: "Produto removido dos favoritos",
        description: `${produto.nome} foi removido da sua lista de favoritos.`,
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
          // Adicionando um progress indicator através de HTML
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
    } else {
      adicionarFavorito({
        id: produto.id,
        nome: produto.nome,
        preco: produto.venda,
        imagem: produto.imagem,
        descricao: produto.descricao
      });
      toast({
        title: "Produto adicionado aos favoritos",
        description: `${produto.nome} foi adicionado à sua lista de favoritos.`,
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
          // Adicionando um progress indicator através de HTML
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
    }
  };

  const handleAdicionarAoCarrinho = (produto: ProdutoTipos) => {
    const itemCarrinho = {
      id: produto.id,
      nome: produto.nome,
      preco: produto.venda,
      venda: produto.venda,
      imagem: produto.imagem,
      slug: produto.slug,
      empresaId: produto.empresa // Adicionando o ID da empresa ao adicionar ao carrinho
    };
    console.log('Adicionando ao carrinho:', itemCarrinho);
    adicionarItem(itemCarrinho);
    
    toast({
      title: "Produto adicionado ao carrinho",
      description: `${produto.nome} foi adicionado ao seu carrinho.`,
      duration: 2000, // Reduzindo para 2 segundos (2000ms)
      // Adicionando um progress indicator através de HTML
      action: (
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
          <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
        </div>
      ),
    });
  };

  const handleBuscar = async () => {
    if (!termoBusca.trim()) {
      const todosProdutos = await getAllProdutos(); // Usa await aqui
        setProdutos(todosProdutos);
      return;
    }    
    const resultados = await buscarProdutos(termoBusca); // Usa await aqui
    setProdutos(resultados);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brewery-dark-brown">
          Nossos Produtos
        </h1>
        <CarrinhoDrawer />
      </div>
      
      <div className="flex items-center mb-8">
        <Input
          type="text"
          placeholder="Buscar produtos..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="max-w-md mr-2"
        />
        <Button variant="outline" onClick={handleBuscar}>
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>
      
      {produtos.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600">Nenhum produto encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {produtos.map((produto) => (
            <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {produto.imagem && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{produto.nome}</CardTitle>
                <CardDescription>{produto.categoria}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {produto.descricao}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-brewery-amber">
                    {produto.venda.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {produto.estoque > 0 
                      ? <span className="font-medium">{produto.estoque} em estoque</span> 
                      : <span className="text-red-500">Esgotado</span>}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleFavoritar(produto)}
                  className={isFavorito(produto.id) ? "text-red-500" : ""}
                >
                  <HeartIcon
                    className={`h-5 w-5 ${isFavorito(produto.id) ? "fill-red-500" : ""}`}
                  />
                </Button>
                <Button
                  onClick={() => handleAdicionarAoCarrinho(produto)}
                  disabled={produto.estoque <= 0}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Adicionar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Produtos;


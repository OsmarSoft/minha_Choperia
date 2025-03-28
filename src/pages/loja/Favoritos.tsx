// src/pages/loja/Favoritos.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart } from "lucide-react";
import { useFavoritos } from '@/components/loja/favoritosApi';
import { useCarrinho } from '@/components/loja/carrinhoApi';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { ProdutoFavorito } from '@/types/tipo';

const Favoritos = () => {
  const { favoritos, removerFavorito } = useFavoritos();
  const { adicionarItem } = useCarrinho();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false); // Carregamento já é feito no provider
  }, [favoritos]);

  const handleRemoverFavorito = async (id: string, nome: string) => {
    try {
      await removerFavorito(id);
      toast({
        title: "Item removido",
        description: `${nome} foi removido dos seus favoritos.`,
        duration: 2000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover favorito",
        description: error.response?.data?.error || "Não foi possível remover o item dos favoritos.",
        duration: 2000,
      });
    }
  };

  const handleAdicionarAoCarrinho = async (produto: ProdutoFavorito) => {
    try {
      await adicionarItem({
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        imagem: produto.imagem,
        slug: produto.id, // Ajuste se houver slug disponível
      });
      toast({
        title: "Produto adicionado ao carrinho",
        description: `${produto.nome} foi adicionado ao seu carrinho.`,
        duration: 2000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar ao carrinho",
        description: error.response?.data?.error || "Não foi possível adicionar o produto ao carrinho.",
        duration: 2000,
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-brewery-dark-brown mb-6">
        Produtos Favoritos
      </h1>
      
      {isLoading ? (
        <p>Carregando favoritos...</p>
      ) : favoritos.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600 mb-4">Você ainda não tem produtos favoritos.</p>
          <Button asChild>
            <a href="/produtos">Ver Produtos</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoritos.map((produto, index) => (
            <motion.div
              key={produto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
                </CardHeader>
                <CardContent>
                  {produto.descricao && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {produto.descricao}
                    </p>
                  )}
                  <p className="text-lg font-bold text-brewery-amber">
                    {produto.preco.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoverFavorito(produto.id, produto.nome)}
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                  <Button onClick={() => handleAdicionarAoCarrinho(produto)}>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Adicionar
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favoritos;
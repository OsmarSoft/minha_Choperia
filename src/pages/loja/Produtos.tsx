// src/pages/loja/Produtos.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeartIcon, ShoppingCart, Search, Star } from "lucide-react";
import { useFavoritos } from '@/components/loja/favoritosApi';
import { useCarrinho } from '@/components/loja/carrinhoApi';
import { useAvaliacoes } from '@/components/loja/avaliacoesApi'; // Importar o hook de avaliações
import { useToast } from '@/components/ui/use-toast';
import { getAllProdutos, buscarProdutos } from '@/api/produtos/produtoService';
import { ProdutoTipos } from '@/types/tipo';
import CarrinhoDrawer from '@/components/loja/CarrinhoDrawer';
import { Link } from 'react-router-dom';

const Produtos = () => {
  const [produtos, setProdutos] = useState<ProdutoTipos[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const { favoritos, adicionarFavorito, removerFavorito, isFavorito } = useFavoritos();
  const { adicionarItem } = useCarrinho();
  const { getMediaAvaliacoes } = useAvaliacoes(); // Adicionar o hook de avaliações
  const { toast } = useToast();
  const [mediasAvaliacoes, setMediasAvaliacoes] = useState<{ [key: string]: number }>({}); // Armazenar médias

  useEffect(() => {
    const carregarProdutos = async () => {
      const todosProdutos = await getAllProdutos();
      setProdutos(todosProdutos);
      console.log('Produtos.tsx: Produtos carregados:', todosProdutos);

      // Carregar médias de avaliações para cada produto
      const medias = await Promise.all(
        todosProdutos.map(async (produto) => {
          const media = await getMediaAvaliacoes(produto.id.toString());
          return { id: produto.id.toString(), media };
        })
      );
      const mediasMap = medias.reduce((acc, { id, media }) => {
        acc[id] = media;
        return acc;
      }, {} as { [key: string]: number });
      setMediasAvaliacoes(mediasMap);
    };
    
    carregarProdutos();
  }, [getMediaAvaliacoes]);

  useEffect(() => {
    console.log('Produtos.tsx: Favoritos atualizados:', favoritos);
    produtos.forEach(produto => {
      console.log('Produtos.tsx: Verificando favorito no useEffect. ID:', produto.id, 'É favorito?', isFavorito(produto.id));
    });
  }, [favoritos, produtos]);

  const handleFavoritar = (produto: ProdutoTipos) => {
    if (isFavorito(produto.id)) {
      removerFavorito(produto.id);
      toast({
        title: "Produto removido dos favoritos",
        description: `${produto.nome} foi removido da sua lista de favoritos.`,
        duration: 2000,
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
        duration: 2000,
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
      empresaId: produto.empresa
    };
    console.log('Adicionando ao carrinho:', itemCarrinho);
    adicionarItem(itemCarrinho);
    
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
  };

  const handleBuscar = async () => {
    if (!termoBusca.trim()) {
      const todosProdutos = await getAllProdutos();
      setProdutos(todosProdutos);
      return;
    }    
    const resultados = await buscarProdutos(termoBusca);
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
          {produtos.map((produto) => {
            const favorito = isFavorito(produto.id);
            const media = mediasAvaliacoes[produto.id] || 0;
            console.log('Produtos.tsx: Renderizando card. ID:', produto.id, 'É favorito?', favorito, 'Média:', media);
            return (
              <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {produto.imagem && (
                  <div className="h-48 overflow-hidden">
                    <Link to={`/produto/${produto.slug}`} className="block h-48 overflow-hidden">
                      <img
                        src={produto.imagem}
                        alt={produto.nome}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </Link>
                  </div>
                )}
                <CardHeader>
                  <Link to={`/produto/${produto.slug}`} className="hover:text-brewery-amber transition-colors">
                    <CardTitle>{produto.nome}</CardTitle>
                  </Link>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {produto.descricao}
                  </p>
                  <div className="flex justify-between items-center mb-2">
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
                  {/* Adicionar média de avaliações */}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">
                      {media > 0 ? media.toFixed(1) : 'Sem avaliações'}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleFavoritar(produto)}
                    className={favorito ? "text-red-500 border-red-200" : ""}
                  >
                    <HeartIcon
                      className={`h-5 w-5 ${favorito ? "fill-red-500" : ""}`}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Produtos;


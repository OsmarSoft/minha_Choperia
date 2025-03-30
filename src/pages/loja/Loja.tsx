// src\pages\loja\Loja.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/useAuth';
import { ShoppingCart, Heart, ArrowRight, Clock } from 'lucide-react';
import { getProdutoPorId } from '@/api/produtos/produtoService';
import { carregarPedidosUsuario } from '@/api/pedidos/pedidoService';
import { Pedido, ProdutoTipos } from '@/types/tipo';
import { Link, useNavigate } from 'react-router-dom';
import { useFavoritos } from '@/components/loja/favoritosApi';
import { useCarrinho } from '@/components/loja/carrinhoApi';
import { useToast } from '@/components/ui/use-toast';
import { formatarData } from '@/lib/utils';

const Loja = () => {
  const { user } = useAuth();
  const [produtosDestaque, setProdutosDestaque] = useState<ProdutoTipos[]>([]);
  const [pedidosRecentes, setPedidosRecentes] = useState<Pedido[]>([]);
  const navigate = useNavigate();
  const { adicionarItem } = useCarrinho();
  const { favoritos } = useFavoritos();
  const { toast } = useToast();

  const idsDestaque = ['2', '6', '8'];

  useEffect(() => {
    const carregarProdutosDestaque = async () => {
      try {
        /*// Deletar carrinho de teste
        try {
          await deletarCarrinho('carrinho-5bb624b3');
          toast({ title: "Carrinho deletado", description: "Carrinho removido com sucesso." });
        } catch (error: any) {
          if (error.response?.status === 404) {
            console.log('Carrinho não encontrado, continuando sem deletar.');
          } else {
            throw error;
          }
        }
        */
  
        const promessasProdutos = idsDestaque.map(id => getProdutoPorId(id));
        const produtos = await Promise.all(promessasProdutos);
        setProdutosDestaque(produtos.filter(Boolean) as ProdutoTipos[]);
      } catch (error) {
        console.error('Erro ao carregar produtos em destaque:', error);
      }
    };
  
    carregarProdutosDestaque();
  }, []);

  useEffect(() => {
    const carregarPedidosRecentes = async () => {
      if (!user) return;
      try {
        const pedidos = await carregarPedidosUsuario();
        const pedidosOrdenados = pedidos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        setPedidosRecentes(pedidosOrdenados.slice(0, 3));
      } catch (error) {
        console.error('Erro ao carregar pedidos recentes:', error);
      }
    };

    carregarPedidosRecentes();
  }, [user]);

  const handleAdicionarAoCarrinho = async (produto: ProdutoTipos) => {
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
      
    try {
      await adicionarItem(itemCarrinho);
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
      console.log('Erro detalhado:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar ao carrinho",
        description: error.response?.data?.error || "Não foi possível adicionar o produto ao carrinho.",
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    console.log('Loja.tsx: Favoritos atuais:', favoritos);
  }, [favoritos]);

  const irParaHistorico = () => navigate('/historico');

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-brewery-dark-brown mb-2 sm:mb-4">
            Bem-vindo à Loja Online, {user?.name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Confira nossos produtos e faça seus pedidos com facilidade.
          </p>
        </div>
        <Card className="mb-6 sm:mb-8 overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Ofertas Especiais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {produtosDestaque.map((produto) => (
                <div key={produto.id} className="bg-brewery-cream rounded-lg p-3 sm:p-4 text-center flex flex-col">
                  <div className="h-24 sm:h-32 bg-brewery-amber/20 rounded-md mb-3 sm:mb-4 flex items-center justify-center relative overflow-hidden">
                    {produto.imagem ? (
                      <img
                        src={produto.imagem}
                        alt={produto.nome}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <ShoppingCart className="h-8 w-8 text-brewery-amber/70" />
                    )}
                  </div>
                  <h3 className="font-medium mb-1">{produto.nome}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 flex-grow line-clamp-2">
                    {produto.descricao}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="w-full text-xs sm:text-sm"
                      onClick={() => handleAdicionarAoCarrinho(produto)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs sm:text-sm"
                      onClick={() => navigate(`/produto/${produto.slug}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Últimos Pedidos</h2>
                <ArrowRight
                  className="h-4 w-4 text-brewery-amber cursor-pointer"
                  onClick={irParaHistorico}
                />
              </div>
              {pedidosRecentes.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm sm:text-base">
                  Você ainda não fez nenhum pedido.
                </p>
              ) : (
                <div className="space-y-3">
                  {pedidosRecentes.map((pedido) => (
                    <div
                      key={pedido.id}
                      className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={irParaHistorico}
                    >
                      <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">
                        Pedido #{pedido.id ? pedido.id.toString().substring(0, 8) : 'ID inválido'}
                      </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          pedido.status === 'entregue' ? 'bg-green-100 text-green-800' :
                          pedido.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          pedido.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {pedido.status}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatarData(pedido.data)}
                      </div>
                      <div className="flex justify-between text-sm">
                      <span>
                        {Array.isArray(pedido.items) ? pedido.items.length : 0} {Array.isArray(pedido.items) && pedido.items.length === 1 ? 'item' : 'itens'}
                      </span>
                        <span className="font-medium">
                          {pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full text-xs sm:text-sm mt-4"
                onClick={irParaHistorico}
              >
                Ver Todos os Pedidos
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Favoritos</h2>
                <Heart className="h-4 w-4 text-red-500" />
              </div>
              {favoritos.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm sm:text-base">
                  Você ainda não adicionou produtos aos favoritos.
                </p>
              ) : (
                <div className="space-y-3 mb-4">
                  {favoritos.slice(0, 3).map((produto) => (
                    <div
                      key={produto.id}
                      className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/produto/${produto.id}`)}
                    >
                      <div className="h-12 w-12 bg-brewery-cream rounded-md flex items-center justify-center overflow-hidden">
                        {produto.imagem ? (
                          <img
                            src={produto.imagem}
                            alt={produto.nome}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ShoppingCart className="h-5 w-5 text-brewery-amber/70" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{produto.nome}</h3>
                        <p className="text-xs text-brewery-amber font-medium">
                          {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <Heart className="h-4 w-4 text-red-500 fill-red-500 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full text-xs sm:text-sm"
                onClick={() => navigate('/favoritos')}
              >
                Ver Favoritos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Loja;



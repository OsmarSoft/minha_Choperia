import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProdutoPorSlug } from '@/api/produtos/produtoService';
import { ProdutoTipos } from '@/types/tipo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFavoritos } from '@/components/loja/favoritosApi';
import { useCarrinho } from '@/components/loja/carrinhoApi';
import { useToast } from '@/components/ui/use-toast';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ProdutoDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const [produto, setProduto] = useState<ProdutoTipos | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(1);
  const navigate = useNavigate();
  const { adicionarItem } = useCarrinho();
  const { adicionarFavorito, removerFavorito, isFavorito } = useFavoritos();
  const { toast } = useToast();

  useEffect(() => {
    const buscarProduto = async () => {
      if (!slug) return;
      
      setLoading(true);
      const produtoEncontrado = await getProdutoPorSlug(slug);
      
      if (produtoEncontrado) {
        setProduto(produtoEncontrado);
      } else {
        toast({
          title: "Produto não encontrado",
          description: "O produto que você está procurando não existe.",
          variant: "destructive",
          duration: 2000, // Reduzindo para 2 segundos (2000ms)
            // Adicionando um progress indicator através de HTML
            action: (
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
                <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
              </div>
            ),
          });
        
        navigate('/produtos');
      }
      
      setLoading(false);
    };
    
    buscarProduto();
  }, [slug, navigate, toast]);

  const handleAdicionarAoCarrinho = () => {
    if (!produto) return;
    
    const produtoCarrinho = {
      id: produto.id,
      nome: produto.nome,
      preco: produto.venda,
      venda: produto.venda,
      imagem: produto.imagem,
      quantidade: quantidade,
      slug: produto.slug,
      empresaId: produto.empresa
    };
    
    adicionarItem(produtoCarrinho);
    
    toast({
      title: "Produto adicionado ao carrinho",
      description: `${quantidade}x ${produto.nome} foi adicionado ao seu carrinho.`,
      duration: 2000, // Reduzindo para 2 segundos (2000ms)
        // Adicionando um progress indicator através de HTML
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
  };

  const handleFavoritar = () => {
    if (!produto) return;
    
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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Carregando detalhes do produto...</p>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Produto não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              className="bg-brewery-cream p-4 flex items-center justify-center overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {produto?.imagem ? (
                <img 
                  src={produto.imagem} 
                  alt={produto.nome} 
                  className="max-h-96 object-contain"
                />
              ) : (
                <div className="h-64 w-64 bg-brewery-amber/20 rounded-md flex items-center justify-center">
                  <ShoppingCart className="h-16 w-16 text-brewery-amber/70" />
                </div>
              )}
            </motion.div>
            
            <div className="p-6">
              <div className="mb-4">
                <Badge className="mb-2">{produto.categoria}</Badge>
                <h1 className="text-2xl font-bold text-brewery-dark-brown mb-2">{produto.nome}</h1>
                <div className="text-2xl font-bold text-brewery-amber mb-4">
                  {produto.venda.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{produto.descricao}</p>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Disponibilidade:</p>
                {produto.estoque > 0 ? (
                  <p className="font-medium">{produto.estoque} em estoque</p>
                ) : (
                  <p className="text-red-500">Produto esgotado</p>
                )}
              </div>
              
              {produto.estoque > 0 && (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <label htmlFor="quantidade" className="text-sm text-gray-500">
                      Quantidade:
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        className="px-3 py-1 border-r border-gray-300"
                        onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                      >
                        -
                      </button>
                      <input
                        id="quantidade"
                        type="number"
                        className="w-12 text-center border-none focus:outline-none"
                        value={quantidade}
                        min="1"
                        max={produto.estoque}
                        onChange={(e) => setQuantidade(Math.min(produto.estoque, Math.max(1, parseInt(e.target.value) || 1)))}
                      />
                      <button
                        className="px-3 py-1 border-l border-gray-300"
                        onClick={() => setQuantidade(Math.min(produto.estoque, quantidade + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleAdicionarAoCarrinho}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleFavoritar}
                      className={isFavorito(produto.id) ? "text-red-500 border-red-200" : ""}
                    >
                      <Heart
                        className={`h-5 w-5 ${isFavorito(produto.id) ? "fill-red-500" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              )}
              
              {produto.estoque <= 0 && (
                <Button
                  variant="outline"
                  disabled
                  className="w-full"
                >
                  Produto Indisponível
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProdutoDetalhe;

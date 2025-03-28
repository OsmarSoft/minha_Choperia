// src/pages/loja_fisica/mesas/MesaDetalhes.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getAllProdutos } from '@/api/produtos/produtoService';
import { cancelarItensMesa, removerItemMesa, adicionarItemMesa} from '@/api/mesas/itemService';
import { getMesaBySlug } from '@/api/mesas/mesaService';
import { confirmarPagamento } from '@/api/mesas/mesaService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/useAuth';
import { Link } from 'react-router-dom';
import { MesaInfoCard } from '@/components/loja_fisica/mesa/MesaInfoCard';
import { ComandaCard } from '@/components/loja_fisica/mesa/ComandaCard';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PedidoItem } from '@/types/tipo';
import { PagamentoModal } from '@/components/loja_fisica/mesa/PagamentoModal';
import { ArrowLeft, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const MesaDetalhes = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddProdutoOpen, setIsAddProdutoOpen] = useState(false);
  const [isPagamentoOpen, setIsPagamentoOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [produtoQuantidade, setProdutoQuantidade] = useState<Record<string, number>>({});
  

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: getAllProdutos,
  });

  const { data: mesa, refetch: refetchMesa, isLoading: isMesaLoading } = useQuery({
    queryKey: ['mesa', slug],
    queryFn: () => getMesaBySlug(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (produtos.length > 0) {
      const initialQuantities: Record<string, number> = {};
      produtos.forEach(produto => initialQuantities[produto.slug] = 1);
      setProdutoQuantidade(initialQuantities);
    }
  }, [produtos]);

  const handleQuantityChange = (produtoSlug: string, quantidade: number) => {
    setProdutoQuantidade(prev => ({ ...prev, [produtoSlug]: quantidade }));
  };

  const handleAddProduto = async (produtoSlug: string) => {
    const produto = produtos.find(p => p.slug === produtoSlug);
    if (!produto) {
      console.error('❌ Produto não encontrado para slug:', produtoSlug);
      toast({
        title: "Erro",
        description: "Produto não encontrado.",
        variant: "destructive",
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
        // Adicionando um progress indicator através de HTML
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
      return;
    }
    if (!mesa) {
      console.error('❌ Mesa não encontrada');
      toast({
        title: "Erro",
        description: "Mesa não encontrada.",
        variant: "destructive",
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
        // Adicionando um progress indicator através de HTML
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
      return;
    }
  
    console.log('📌 Produto encontrado:', produto);
    console.log('📌 Mesa:', mesa);
    const quantidade = produtoQuantidade[produtoSlug] || 1;
    const novoItem: PedidoItem = {
      produtoId: produto.id,  // Usar produtoId explicitamente
      nome: produto.nome,
      quantidade,
      precoUnitario: produto.venda,
      total: produto.venda * quantidade,
      slug: produto.slug,
      empresaId: produto.empresa || '1',
    };
  
    console.log('📌 Novo item a ser enviado:', novoItem);
  
    try {
      await adicionarItemMesa(mesa.slug, novoItem);
      await queryClient.invalidateQueries({ queryKey: ['mesa', slug] });
      await refetchMesa();
      toast({
        title: "Produto adicionado",
        description: `${quantidade}x ${produto.nome} adicionado à mesa.`,
        variant: "default",
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
        // Adicionando um progress indicator através de HTML
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
      handleQuantityChange(produtoSlug, 1);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o item.",
        variant: "destructive",
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

  const handleDeleteItem = async (itemSlug: string) => {
    if (!mesa || !slug) return;
  
    try {
      const item = itensMesa.find((i: PedidoItem) => i.slug === itemSlug);
      console.log('📌 Item encontrado:', item);
      if (!item) {
        throw new Error("Item não encontrado na lista de pedidos");
      }
  
      const itemId = item.id;  // ID do ItemMesa
      console.log('📌 itemId:', itemId);
  
      // Remover o item da mesa
      const response = await removerItemMesa(mesa.slug, itemId);
      console.log('✅ Resposta da remoção:', response);
  
      // Atualizar a UI apenas se a remoção for bem-sucedida
      await queryClient.invalidateQueries({ queryKey: ['mesa', slug] });
      await refetchMesa();
  
      toast({
        title: "Item removido",
        description: `O item ${item.nome} foi removido da mesa com sucesso.`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Erro ao remover item:', error.response?.data || error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o item. Verifique o console para mais detalhes.",
        variant: "destructive",
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
  
  const itensMesa: PedidoItem[] = mesa?.items?.map((item: any) => {
    const precoUnitario = parseFloat(item.preco_unitario || '0');
    return {
      id: item.id,  // ID do ItemMesa para uso em remoção
      produtoId: item.produto_id,  // ID do Produto
      nome: item.produto_nome || 'Produto Desconhecido',
      quantidade: item.quantidade || 0,
      precoUnitario: precoUnitario,
      total: (item.quantidade || 0) * parseFloat(item.preco_unitario || '0'),
      slug: item.produto_slug || 'produto-desconhecido',
      empresaId: mesa.empresa || '1',
    };
  }) || [];
  
  const handleCancelPedido = async () => {
    if (!mesa || !slug) return;
  
    try {
      const response = await cancelarItensMesa(mesa.slug, itensMesa);
      console.log('✅ Resposta do cancelamento:', response);
      await queryClient.invalidateQueries({ queryKey: ['mesa', slug] });
      await refetchMesa();
      toast({
        title: "Itens cancelados",
        description: "Todos os itens foram removidos da mesa.",
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
        // Adicionando um progress indicator através de HTML
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
    } catch (error: any) {
      console.error('Erro ao cancelar itens:', error.response?.data || error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar os itens. Verifique o console para mais detalhes.",
        variant: "destructive",
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

  const handleConfirmarPagamento = async (metodoPagamento: string, valor: number) => {
    if (!mesa || !slug || itensMesa.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum item na mesa para pagamento.",
        variant: "destructive",
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
        // Adicionando um progress indicator através de HTML
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
      return;
    }
  
    try {
      // Adicionado o parâmetro isCounterOrder(éContraOrdens) para decidir se deseja excluir ou limpar a tabela.
      const not_numerico = isNaN(parseInt(mesa.numero || '')); // Assuma que numero não numérico significa ordem contrária
      await confirmarPagamento(slug, itensMesa, not_numerico);
      await queryClient.invalidateQueries({ queryKey: ['mesa', slug] });
      await refetchMesa();
  
      toast({
        title: "Pagamento confirmado",
        description: `Pagamento de R$ ${valor.toFixed(2)} realizado com sucesso via ${metodoPagamento}.`,
        variant: "default",
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
        // Adicionando um progress indicator através de HTML
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
  
      navigate('/loja-fisica/mesas');
    } catch (error: any) {
      console.error('Erro ao confirmar pagamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível confirmar o pagamento. Verifique o console para mais detalhes.",
        variant: "destructive",
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

  if (isMesaLoading) {
    return <div>Carregando...</div>;
  }
  
  const totalGeral = itensMesa.reduce((acc, item) => acc + item.total, 0) || 0;
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link to="/loja-fisica/mesas">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft size={16} />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-brewery-dark-brown ml-2">
          Mesa: {mesa?.nome.slice(-2)}
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MesaInfoCard mesa={mesa} currentTime={currentTime} user={user} itensMesa={itensMesa} />
        <ComandaCard
          mesaPedido={mesa?.pedido}
          itensMesa={itensMesa}
          onAddProduto={() => setIsAddProdutoOpen(true)}
          onDeleteItem={handleDeleteItem}
          onCancelPedido={handleCancelPedido}
          totalGeral={totalGeral}
          onPagar={() => setIsPagamentoOpen(true)}
        />
      </div>
      <Dialog open={isAddProdutoOpen} onOpenChange={setIsAddProdutoOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Adicionar Produto à Mesa: {mesa?.nome}</DialogTitle>
            <div id="dialog-description" className="text-sm text-gray-500">
              Selecione um produto e a quantidade para adicionar à mesa.
            </div>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md">
            <Tabs defaultValue="table" className="w-full">
              <TabsList>
                <TabsTrigger value="table">Tabela</TabsTrigger>
                <TabsTrigger value="grid">Grade</TabsTrigger>
              </TabsList>
              <TabsContent value="table">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Categoria</th>
                      <th>Preço</th>
                      <th>Quantidade</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((produto) => (
                      <tr key={produto.id}>
                        <td>{produto.nome}</td>
                        <td>{produto.categoria}</td>
                        <td>R$ {produto.venda.toFixed(2)}</td>
                        <td>
                          <Input
                            type="number"
                            min="1"
                            value={produtoQuantidade[produto.slug] || 1}
                            className="w-20"
                            onChange={(e) => {
                              const quantidade = parseInt(e.target.value);
                              if (quantidade > 0) handleQuantityChange(produto.slug, quantidade);
                            }}
                          />
                        </td>
                        <td>
                          <Button
                            onClick={() => handleAddProduto(produto.slug)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TabsContent>
              <TabsContent value="grid">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {produtos.map((produto) => (
                    <Card key={produto.id}>
                      {produto.imagem && (
                        <img src={produto.imagem} alt={produto.nome} className="w-full h-48 object-cover" />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold">{produto.nome}</h3>
                        <p>{produto.categoria}</p>
                        <p className="font-bold">R$ {produto.venda.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            type="number"
                            min="1"
                            value={produtoQuantidade[produto.slug] || 1}
                            className="w-20"
                            onChange={(e) => {
                              const quantidade = parseInt(e.target.value);
                              if (quantidade > 0) handleQuantityChange(produto.slug, quantidade);
                            }}
                          />
                          <Button
                            onClick={() => handleAddProduto(produto.slug)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <PagamentoModal
        isOpen={isPagamentoOpen}
        onClose={() => setIsPagamentoOpen(false)}
        valorTotal={totalGeral}
        itensMesa={itensMesa}
        onConfirmarPagamento={handleConfirmarPagamento}
      />
    </div>
  );
};

export default MesaDetalhes;




// src\pages\loja\Historico.tsx
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/useAuth';
import { atualizarStatusPedidoOnline, confirmarRecebimentoPedido, carregarPedidosUsuario, getAllPedidos } from '@/api/pedidos/pedidoService';
import { Clock, History, Package, CheckCheck, ShoppingBag, PackageCheck } from 'lucide-react';
import { formatarData } from '@/lib/utils';
import { Pedido } from '@/types/tipo';

const Historico = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      setIsLoading(true);
      try {
        const pedidosUsuario = await carregarPedidosUsuario();
        console.log('📦 Pedidos:', pedidosUsuario);
        setPedidos(pedidosUsuario.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        toast({
          title: "Erro ao carregar pedidos",
          description: "Não foi possível carregar o histórico de pedidos.",
          variant: "destructive",
          duration: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchPedidos();
      const intervalo = setInterval(fetchPedidos, 30000);
      return () => clearInterval(intervalo);
    } else {
      setPedidos([]);
      setIsLoading(false);
    }
  }, [user, toast]);

  const handleStatusChange = async (slug: string, novoStatus: string) => {
    const sucesso = await atualizarStatusPedidoOnline(slug, novoStatus);
    if (sucesso) {
      setPedidos(prev => prev.map(p => p.id === slug ? { ...p, status: novoStatus } : p));
      toast({
        title: "Status atualizado",
        description: `O pedido #${slug.substring(0, 8)} foi marcado como ${novoStatus}.`,
        duration: 2000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
    } else {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do pedido.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleConfirmarRecebimento = async (slug: string) => {
    const sucesso = await confirmarRecebimentoPedido(slug);
    if (sucesso) {
      setPedidos(prev => prev.map(p => p.id === slug ? { ...p, status: 'entregue' } : p));
      toast({
        title: "Pedido recebido",
        description: `O pedido #${slug.substring(0, 8)} foi marcado como entregue.`,
        duration: 2000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
    } else {
      toast({
        title: "Erro ao confirmar",
        description: "Não foi possível confirmar o recebimento do pedido.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'entregue': return <Badge className="bg-green-600">{status}</Badge>;
      case 'pendente': return <Badge className="bg-yellow-600">{status}</Badge>;
      case 'cancelado': return <Badge className="bg-red-600">{status}</Badge>;
      case 'em-andamento': return <Badge className="bg-blue-600">em andamento</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getMetodoPagamento = (metodo?: string) => {
    if (!metodo) return "Não especificado";
    const metodos: Record<string, string> = {
      dinheiro: "Dinheiro",
      cartao_credito: "Cartão de Crédito",
      cartao_debito: "Cartão de Débito",
      pix: "PIX",
      vale_refeicao: "Vale Refeição",
      vale_alimentacao: "Vale Alimentação",
    };
    return metodos[metodo] || metodo;
  };

  const pedidosFiltrados = activeTab === 'todos' ? pedidos : pedidos.filter(p => p.status === activeTab);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <History className="h-6 w-6 text-brewery-dark-brown" />
        <h1 className="text-2xl font-bold text-brewery-dark-brown">Histórico de Pedidos</h1>
      </div>
      {!user ? (
        <p>Por favor, faça login para ver seu histórico de pedidos.</p>
      ) : isLoading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : pedidos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-gray-100 rounded-lg"
        >
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Você ainda não realizou nenhum pedido.</p>
          <Button onClick={() => window.location.href = '/produtos'}>Ver produtos</Button>
        </motion.div>
      ) : (
        <Tabs defaultValue="todos" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="todos">Todos os pedidos</TabsTrigger>
            <TabsTrigger value="entregue">Entregues</TabsTrigger>
            <TabsTrigger value="em-andamento">Em andamento</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="space-y-6">
              {pedidosFiltrados.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Nenhum pedido {activeTab === 'todos' ? '' : activeTab} encontrado.</p>
                  </CardContent>
                </Card>
              ) : (
                pedidosFiltrados.map((pedido, index) => (
                  <motion.div
                    key={pedido.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Pedido #{String(pedido.id).substring(0, 8)}</CardTitle>
                          {getStatusBadge(pedido.status)}
                        </div>
                        <p className="text-sm text-gray-500">{formatarData(pedido.data)}</p>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Produto</TableHead>
                              <TableHead className="text-right">Qtd</TableHead>
                              <TableHead className="text-right">Preço</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pedido.items && pedido.items.map((item, idx) => (
                              <TableRow key={`${item.id}-${idx}`}>
                                <TableCell>{item.nome}</TableCell>
                                <TableCell className="text-right">{item.quantidade}</TableCell>
                                <TableCell className="text-right">
                                  {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={3} className="text-right font-bold">
                                Total {pedido.metodoPagamento && (
                                  <span className="font-normal text-sm text-gray-500">
                                    (pagamento: {getMetodoPagamento(pedido.metodoPagamento)})
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        {pedido.status === 'pendente' && (
                          <div className="flex justify-end mt-4 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConfirmarRecebimento(pedido.id)}
                              className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                            >
                              <PackageCheck className="h-4 w-4 mr-1" />
                              Confirmar Recebimento
                            </Button>
                          </div>
                        )}
                        {pedido.status === 'entregue' && (
                          <div className="flex justify-end mt-4">
                            <div className="flex items-center text-green-600">
                              <CheckCheck className="h-4 w-4 mr-1" />
                              <span className="text-sm">Entregue em {formatarData(pedido.data)}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Historico;

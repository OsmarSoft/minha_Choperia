// src\pages\loja_fisica\pedidos\PedidosOnline.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
// import { useToast } from '@/hooks/use-toast';
import { formatarData, formatarDinheiro } from "@/lib/utils";
import { atualizarStatusPedidoOnline, carregarTodosPedidosOnline } from '@/api/pedidos/pedidoService';
import { Clock, Package, CheckCheck, Phone, AlertCircle, MapPin } from 'lucide-react';
import { Pedido, PedidoItem } from '@/types/tipo';


const PedidosOnline = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('pendente');
  const { toast } = useToast();

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const todosPedidos = await carregarTodosPedidosOnline();
        setPedidos(todosPedidos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
      } catch (error) {
        toast({
          title: "Erro ao carregar pedidos",
          description: "Não foi possível carregar os pedidos online.",
          variant: "destructive",
          duration: 2000,
        });
      }
    };

    fetchPedidos();
    const intervalo = setInterval(fetchPedidos, 10000);
    return () => clearInterval(intervalo);
  }, [toast]);

  const handlePreparar = async (pedidoId: string) => {
    const sucesso = await atualizarStatusPedidoOnline(pedidoId, 'em-andamento');
    if (sucesso) {
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: 'em-andamento' } : p));
      toast({
        title: "Pedido em preparação",
        description: `O pedido #${pedidoId.substring(0, 8)} foi movido para preparação.`,
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

  const pedidosFiltrados = filtroStatus === 'todos' ? pedidos : pedidos.filter(p => p.status === filtroStatus);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos Online</h1>
          <p className="text-muted-foreground">Gerencie os pedidos recebidos da loja online.</p>
        </div>
      </div>
      <Tabs defaultValue="pendente" onValueChange={setFiltroStatus}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="em-andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="entregue">Entregues</TabsTrigger>
          <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
        </TabsList>
        <TabsContent value={filtroStatus} className="mt-6">
          {pedidosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Não há pedidos {filtroStatus === 'todos' ? '' : filtroStatus + 's'} no momento.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pedidosFiltrados.map((pedido) => (
                <Card key={pedido.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <CardTitle className="text-lg">Pedido #{pedido.id.substring(0, 8)}</CardTitle>
                        <CardDescription>{formatarData(pedido.data)}</CardDescription>
                      </div>
                      {getStatusBadge(pedido.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Detalhes do Cliente</h3>
                        <div className="space-y-1">
                          <p className="font-medium">{pedido.cliente?.nome || "Cliente"}</p>
                          {pedido.cliente?.telefone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="w-4 h-4 mr-1" />
                              {pedido.cliente.telefone}
                            </div>
                          )}
                          {pedido.cliente?.endereco && (
                            <div className="flex items-start text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-1 mt-1 flex-shrink-0" />
                              <span>{pedido.cliente.endereco}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Resumo do Pedido</h3>
                        <div className="space-y-2">
                          {pedido.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantidade}x {item.nome}</span>
                              <span>{formatarDinheiro(item.total)}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t flex justify-between font-medium">
                            <span>Total:</span>
                            <span>{formatarDinheiro(pedido.total)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Pagamento: {getMetodoPagamento(pedido.metodoPagamento)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {pedido.status === 'pendente' && (
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePreparar(pedido.id)}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Preparar Pedido
                        </Button>
                      </div>
                    )}
                    {pedido.status === 'em-andamento' && (
                      <div className="flex items-center justify-end mt-2 text-blue-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">Em preparação</span>
                      </div>
                    )}
                    {pedido.status === 'entregue' && (
                      <div className="flex items-center justify-end mt-2 text-green-600">
                        <CheckCheck className="h-4 w-4 mr-1" />
                        <span className="text-sm">Entregue em {formatarData(pedido.data)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PedidosOnline;

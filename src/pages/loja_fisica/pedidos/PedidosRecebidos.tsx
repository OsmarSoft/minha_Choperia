
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatarDinheiro } from "@/lib/utils";
import { Check, X, Phone, MapPin, Clock } from "lucide-react";

// Mock data for demonstration
const mockPedidos = [
  {
    id: "1",
    cliente: "João Silva",
    telefone: "(11) 98765-4321",
    endereco: "Rua das Flores, 123 - Centro",
    dataPedido: "2023-05-15T14:30:00",
    status: "pendente",
    metodoPagamento: "dinheiro",
    valorTotal: 87.50,
    items: [
      { id: "1", nome: "X-Bacon", quantidade: 2, valor: 25.90 },
      { id: "2", nome: "Batata Frita Grande", quantidade: 1, valor: 15.90 },
      { id: "3", nome: "Refrigerante 2L", quantidade: 1, valor: 12.90 }
    ]
  },
  {
    id: "2",
    cliente: "Maria Oliveira",
    telefone: "(11) 91234-5678",
    endereco: "Av. Principal, 456 - Jardim Europa",
    dataPedido: "2023-05-15T15:15:00",
    status: "pendente",
    metodoPagamento: "cartao_credito",
    valorTotal: 65.80,
    items: [
      { id: "4", nome: "Pizza Média Calabresa", quantidade: 1, valor: 45.90 },
      { id: "5", nome: "Refrigerante 600ml", quantidade: 2, valor: 9.95 }
    ]
  },
  {
    id: "3",
    cliente: "Pedro Santos",
    telefone: "(11) 98888-7777",
    endereco: "Rua dos Pinheiros, 789 - Vila Nova",
    dataPedido: "2023-05-15T13:45:00",
    status: "entregue",
    metodoPagamento: "pix",
    valorTotal: 102.70,
    items: [
      { id: "6", nome: "Combo Família", quantidade: 1, valor: 89.90 },
      { id: "7", nome: "Sobremesa Brownie", quantidade: 1, valor: 12.80 }
    ]
  },
  {
    id: "4",
    cliente: "Ana Pereira",
    telefone: "(11) 97777-8888",
    endereco: "Alameda Santos, 321 - Bela Vista",
    dataPedido: "2023-05-14T19:20:00",
    status: "cancelado",
    metodoPagamento: "cartao_debito",
    valorTotal: 43.80,
    items: [
      { id: "8", nome: "Salada Especial", quantidade: 1, valor: 28.90 },
      { id: "9", nome: "Suco Natural", quantidade: 1, valor: 14.90 }
    ]
  }
];

const statusLabels = {
  pendente: { label: "Pendente", color: "bg-yellow-500" },
  preparando: { label: "Preparando", color: "bg-blue-500" },
  saiu: { label: "Saiu para entrega", color: "bg-indigo-500" },
  entregue: { label: "Entregue", color: "bg-green-500" },
  cancelado: { label: "Cancelado", color: "bg-red-500" }
};

const metodoPagamentoLabels = {
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  pix: "PIX",
  vr: "Vale Refeição",
  alimentacao: "Vale Alimentação"
};

interface Pedido {
  id: string;
  cliente: string;
  telefone: string;
  endereco: string;
  dataPedido: string;
  status: string;
  metodoPagamento: string;
  valorTotal: number;
  items: {
    id: string;
    nome: string;
    quantidade: number;
    valor: number;
  }[];
}

const PedidosRecebidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>(mockPedidos);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pedidosFiltrados = filtroStatus === "todos" 
    ? pedidos 
    : pedidos.filter(pedido => pedido.status === filtroStatus);

  const atualizarStatusPedido = (pedidoId: string, novoStatus: string) => {
    setPedidos(prevPedidos => 
      prevPedidos.map(pedido => 
        pedido.id === pedidoId 
          ? { ...pedido, status: novoStatus }
          : pedido
      )
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos Recebidos</h1>
          <p className="text-muted-foreground">Gerencie os pedidos de delivery recebidos.</p>
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList>
          <TabsTrigger value="todos" onClick={() => setFiltroStatus("todos")}>
            Todos
          </TabsTrigger>
          <TabsTrigger value="pendente" onClick={() => setFiltroStatus("pendente")}>
            Pendentes
          </TabsTrigger>
          <TabsTrigger value="preparando" onClick={() => setFiltroStatus("preparando")}>
            Preparando
          </TabsTrigger>
          <TabsTrigger value="saiu" onClick={() => setFiltroStatus("saiu")}>
            Em Entrega
          </TabsTrigger>
          <TabsTrigger value="entregue" onClick={() => setFiltroStatus("entregue")}>
            Entregues
          </TabsTrigger>
          <TabsTrigger value="cancelado" onClick={() => setFiltroStatus("cancelado")}>
            Cancelados
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filtroStatus} className="mt-6">
          {pedidosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pedidosFiltrados.map((pedido) => (
                <Card key={pedido.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <CardTitle className="text-lg">Pedido #{pedido.id}</CardTitle>
                        <CardDescription>
                          {formatarData(pedido.dataPedido)}
                        </CardDescription>
                      </div>
                      <Badge 
                        className={`${statusLabels[pedido.status as keyof typeof statusLabels]?.color} text-white`}
                      >
                        {statusLabels[pedido.status as keyof typeof statusLabels]?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Informações do Cliente</h3>
                        <div className="space-y-1">
                          <p>{pedido.cliente}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="w-4 h-4 mr-1" />
                            {pedido.telefone}
                          </div>
                          <div className="flex items-start text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-1 mt-1 flex-shrink-0" />
                            <span>{pedido.endereco}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Resumo do Pedido</h3>
                        <div className="space-y-2">
                          {pedido.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.quantidade}x {item.nome}</span>
                              <span>{formatarDinheiro(item.valor * item.quantidade)}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t flex justify-between font-medium">
                            <span>Total:</span>
                            <span>{formatarDinheiro(pedido.valorTotal)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Pagamento na entrega: {metodoPagamentoLabels[pedido.metodoPagamento as keyof typeof metodoPagamentoLabels]}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {pedido.status === "pendente" && (
                      <div className="flex flex-wrap gap-2 justify-end mt-2">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => atualizarStatusPedido(pedido.id, "cancelado")}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => atualizarStatusPedido(pedido.id, "preparando")}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Aceitar e Preparar
                        </Button>
                      </div>
                    )}
                    
                    {pedido.status === "preparando" && (
                      <div className="flex justify-end mt-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => atualizarStatusPedido(pedido.id, "saiu")}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Saiu para Entrega
                        </Button>
                      </div>
                    )}
                    
                    {pedido.status === "saiu" && (
                      <div className="flex justify-end mt-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => atualizarStatusPedido(pedido.id, "entregue")}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Confirmar Entrega
                        </Button>
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

export default PedidosRecebidos;


// src/components/loja/PagamentoModalOnline.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Wallet,
  Receipt,
  CakeSlice,
  UtensilsCrossed,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmacaoPagamentoModalOnline } from './ConfirmacaoPagamentoModalOnline';

interface CarrinhoItem {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
  venda?: number;
  imagem?: string;
}

interface PagamentoModalOnlineProps {
  isOpen: boolean;
  onClose: () => void;
  valorTotal: number;
  itensCarrinho: CarrinhoItem[];
  onConfirmarPagamento: (metodoPagamento: string, valor: number) => void;
}

export const PagamentoModalOnline = ({
  isOpen,
  onClose,
  valorTotal,
  itensCarrinho = [],
  onConfirmarPagamento,
}: PagamentoModalOnlineProps) => {
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const { toast } = useToast();

  const handleMetodoPagamentoClick = (metodoId: string) => {
    setMetodoPagamento(metodoId);
    setShowConfirmacao(true);
  };

  const handleConfirmarPagamento = (valorPago: number) => {
    setPagamentoConfirmado(true);
    setShowConfirmacao(false);
    toast({
      title: "Pagamento confirmado",
      description: `Pagamento de R$ ${valorPago.toFixed(2)} via ${getMetodoPagamentoNome(metodoPagamento)} confirmado.`,
      duration: 2000,
      action: (
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
          <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
        </div>
      ),
    });
  };

  const handleEnviarPedido = () => {
    if (!metodoPagamento) {
      toast({
        title: "Selecione um método de pagamento",
        description: "Por favor, selecione como deseja pagar pelo seu pedido.",
        variant: "destructive",
        duration: 2000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
      return;
    }

    if (!pagamentoConfirmado) {
      toast({
        title: "Confirme o pagamento",
        description: "Por favor, confirme o pagamento antes de enviar o pedido.",
        variant: "destructive",
        duration: 2000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
      return;
    }

    onConfirmarPagamento(metodoPagamento, valorTotal);
    onClose();
  };

  const getMetodoPagamentoNome = (metodo: string) => {
    const metodoInfo = metodosPagamento.find(m => m.id === metodo);
    return metodoInfo ? metodoInfo.nome : metodo;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          onClose();
          setPagamentoConfirmado(false); // Resetar ao fechar
        }
      }}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              Finalizar Pedido
            </DialogTitle>
            <DialogDescription>
              Selecione a forma de pagamento e confirme seu pedido.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Resumo do Pedido</h3>
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-2">
                      {itensCarrinho.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span>{item.quantidade}x {item.nome}</span>
                          <span>R$ {((item.venda || item.preco) * item.quantidade).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total a pagar na entrega:</span>
                  <span className="text-lg font-bold">R$ {valorTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Forma de Pagamento na Entrega</h3>
              <div className="grid grid-cols-2 gap-3">
                {metodosPagamento.map((metodo) => (
                  <Button
                    key={metodo.id}
                    variant={metodoPagamento === metodo.id ? "default" : "outline"}
                    className={cn(
                      "h-20 flex flex-col gap-2",
                      metodoPagamento === metodo.id && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleMetodoPagamentoClick(metodo.id)}
                  >
                    <metodo.icon className="h-6 w-6" />
                    {metodo.nome}
                  </Button>
                ))}
              </div>
              <Button
                className="w-full h-12 mt-6"
                onClick={handleEnviarPedido}
                disabled={!pagamentoConfirmado}
              >
                <Send className="h-5 w-5 mr-2" />
                Enviar Pedido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmacaoPagamentoModalOnline
        isOpen={showConfirmacao}
        onClose={() => setShowConfirmacao(false)}
        metodoPagamento={metodoPagamento}
        valor={valorTotal}
        onConfirm={handleConfirmarPagamento}
      />
    </>
  );
};

const metodosPagamento = [
  { id: 'dinheiro', nome: 'Dinheiro', icon: DollarSign },
  { id: 'cartao_credito', nome: 'Cartão de Crédito', icon: CreditCard },
  { id: 'cartao_debito', nome: 'Cartão de Débito', icon: CreditCard },
  { id: 'pix', nome: 'PIX', icon: Smartphone },
  { id: 'vr', nome: 'Vale Refeição', icon: CakeSlice },
  { id: 'alimentacao', nome: 'Vale Alimentação', icon: UtensilsCrossed },
];

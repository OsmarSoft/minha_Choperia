
//src\components\loja_fisica\mesa\PagamentoModal.tsx
import React, { useState, useEffect } from 'react';
import { PedidoItem } from "@/types/tipo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Users, 
  Plus, 
  Minus, 
  CheckCircle2,
  Receipt,
  CakeSlice,
  UtensilsCrossed
} from "lucide-react";
import { ConfirmacaoPagamentoModal } from "./ConfirmacaoPagamentoModal";

interface PagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  valorTotal: number;
  itensMesa: PedidoItem[];
  onConfirmarPagamento: (metodoPagamento: string, valor: number) => void;
}

export const PagamentoModal = ({
  isOpen,
  onClose,
  valorTotal,
  itensMesa = [],
  onConfirmarPagamento,
}: PagamentoModalProps) => {
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [numeroPessoas, setNumeroPessoas] = useState(1);
  const [pessoasPagaram, setPessoasPagaram] = useState(0);
  const [valorPorPessoa, setValorPorPessoa] = useState(valorTotal);
  const [valorRestante, setValorRestante] = useState(valorTotal);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [valorUltimoPagamento, setValorUltimoPagamento] = useState(0);
  const [pagamentoCompleto, setPagamentoCompleto] = useState(false);

  const dividirValorEntrePessoas = (total: number, numPessoas: number): number[] => {
    let baseValor = Math.floor((total / numPessoas) * 100) / 100; // Arredonda para baixo
    let valores = new Array(numPessoas).fill(baseValor);
  
    let somaAtual = valores.reduce((acc, val) => acc + val, 0);
    let diferenca = total - somaAtual; // Diferença devido ao arredondamento
  
    // Distribui centavos restantes para algumas pessoas
    for (let i = 0; i < Math.round(diferenca * 100); i++) {
      valores[i] = parseFloat((valores[i] + 0.01).toFixed(2));
    }
  
    return valores;
  };
  
  useEffect(() => {
    let valoresAjustados = dividirValorEntrePessoas(valorTotal, numeroPessoas);
    setValorPorPessoa(valoresAjustados[pessoasPagaram] || 0);
  
    let novoValorRestante = valoresAjustados
      .slice(pessoasPagaram)
      .reduce((acc, val) => acc + val, 0);
  
    setValorRestante(novoValorRestante);
    
    // Verifica se o pagamento está completo (valor restante próximo a zero)
    setPagamentoCompleto(Math.abs(novoValorRestante) < 0.01);
  }, [numeroPessoas, valorTotal, pessoasPagaram]);
  
  const handleChangePessoas = (incremento: number) => {
    const novoNumero = Math.max(1, numeroPessoas + incremento);
    setNumeroPessoas(novoNumero);
  };

  const handleMetodoPagamentoClick = (metodoId: string) => {
    setMetodoPagamento(metodoId);
    setShowConfirmacao(true);
  };

  const handleConfirmarPagamento = (valorPago: number) => {
    setValorUltimoPagamento(valorPago);
    setPessoasPagaram(prev => Math.min(numeroPessoas, prev + 1));
    setShowConfirmacao(false);
    
    const novoValorRestante = Math.max(0, valorRestante - valorPago);
    setValorRestante(novoValorRestante);

    // Verifica se o pagamento está completo após esta confirmação
    if (novoValorRestante < 0.01 || pessoasPagaram + 1 >= numeroPessoas) {
      setPagamentoCompleto(true);
    }
  };

  const handleFinalizarPagamento = () => {
    onConfirmarPagamento(metodoPagamento, valorTotal);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        // Só permite fechar o diálogo manualmente se não estiver em meio a um pagamento
        if (!open && !showConfirmacao) {
          onClose();
        }
      }}>
        <DialogContent className="sm:max-w-[900px] h-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              Pagamento da Mesa
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Coluna Esquerda - Detalhes da Conta */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-2">
                    {itensMesa.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{item.quantidade}x {item.nome}</span>
                        <span>R$ {item.total !== undefined ? item.total.toFixed(2) : 'N/A'}</span>
                      </div>
                    ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold">R$ {valorTotal.toFixed(2)}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="dividir" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Dividir
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleChangePessoas(-1)}
                        disabled={numeroPessoas <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="dividir"
                        type="number"
                        value={numeroPessoas}
                        onChange={(e) => setNumeroPessoas(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center"
                        min="1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleChangePessoas(1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-secondary p-3 rounded-lg text-center">
                    <span className="block text-sm text-muted-foreground">Valor por pessoa</span>
                    <span className="text-lg font-bold">R$ {valorPorPessoa.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita - Métodos de Pagamento */}
            <div className="space-y-4">
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

              <Card className="mt-6">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <span>Pessoas pagaram:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setPessoasPagaram(Math.max(0, pessoasPagaram - 1))}
                        disabled={!metodoPagamento || pessoasPagaram <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{pessoasPagaram}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setPessoasPagaram(Math.min(numeroPessoas, pessoasPagaram + 1))}
                        disabled={!metodoPagamento || pessoasPagaram >= numeroPessoas}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-destructive">
                    <span>Faltam:</span>
                    <span className="font-bold">R$ {valorRestante.toFixed(2)}</span>
                  </div>

                  <div className="pt-4 border-t">
                  <Button
                    className="w-full h-12"
                    onClick={handleFinalizarPagamento}
                    disabled={!pagamentoCompleto} // Habilita somente quando o valor restante for 0
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Finalizar Pagamento
                  </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmacaoPagamentoModal
        isOpen={showConfirmacao}
        onClose={() => setShowConfirmacao(false)}
        metodoPagamento={metodoPagamento}
        valor={valorPorPessoa}
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

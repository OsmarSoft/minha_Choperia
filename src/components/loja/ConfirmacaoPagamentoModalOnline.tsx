
// src/components/loja/ConfirmacaoPagamentoModalOnline.tsx
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { formatarDinheiro } from "@/lib/utils";

interface ConfirmacaoPagamentoModalOnlineProps {
  isOpen: boolean;
  onClose: () => void;
  metodoPagamento: string;
  valor: number;
  onConfirm: (valorPago: number) => void;
}

export const ConfirmacaoPagamentoModalOnline = ({
  isOpen,
  onClose,
  metodoPagamento,
  valor,
  onConfirm,
}: ConfirmacaoPagamentoModalOnlineProps) => {
  const [valorEditado, setValorEditado] = useState(valor.toFixed(2));

  useEffect(() => {
    setValorEditado(valor.toFixed(2));
  }, [valor]);

  const getTituloPagamento = (metodo: string) => {
    const metodos: { [key: string]: string } = {
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX',
      vr: 'Vale Refeição',
      alimentacao: 'Vale Alimentação'
    };
    return metodos[metodo] || metodo;
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoValor = e.target.value;
    if (!isNaN(parseFloat(novoValor))) {
      setValorEditado(parseFloat(novoValor).toFixed(2));
    } else {
      setValorEditado('0.00');
    }
  };

  const handleConfirm = () => {
    if (parseFloat(valorEditado) <= 0) {
      return;
    }
    onConfirm(parseFloat(valorEditado));
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Confirmar Pagamento - {getTituloPagamento(metodoPagamento)}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div>
                <span className="block text-sm mb-2">Valor a ser pago na entrega:</span>
                <Input
                  type="number"
                  value={valorEditado}
                  onChange={handleValorChange}
                  step="0.01"
                  min="0"
                  className="font-bold text-lg"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Valor original: <span className="font-medium">{formatarDinheiro(valor)}</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={parseFloat(valorEditado) <= 0}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

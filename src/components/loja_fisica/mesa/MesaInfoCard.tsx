
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mesa } from "@/types/tipo";
import { User } from "@/types/usuario";
import { PagamentoModal } from './PagamentoModal';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { confirmarPagamento } from '@/api/mesas/mesaService';

interface MesaInfoCardProps {
  mesa: Mesa | undefined;
  currentTime: Date;
  user: User | null;
  itensMesa: any[];
}

export const MesaInfoCard = ({ mesa, currentTime, user, itensMesa }: MesaInfoCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);

  const handlePagamento = (metodoPagamento: string, valor: number) => {
    if (mesa) {
      // Após confirmar o pagamento, limpar a mesa e redirecionar para a página de mesas
      confirmarPagamento(mesa.slug, itensMesa);
      
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
      
      // Redirecionar para a página de mesas em vez de ficar na página de detalhes da mesa
      navigate('/loja-fisica/mesas');
    }
  };

  const totalGeral = itensMesa.reduce((total, item) => total + item.total, 0) || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600 font-bold">
            Mesa: {mesa?.nome.slice(-2)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-bold">Pedido: {mesa?.pedido}</p>
              <p className="bg-green-600 text-white px-2 py-1 rounded inline-block">
                Em aberto
              </p>
            </div>
            
            <div className="space-y-2 text-gray-600">
              <p>Data: {currentTime.toLocaleDateString()}</p>
              <p>Hora: {currentTime.toLocaleTimeString()}</p>
              <p>Atendente: {user?.name || "Sistema"}</p>
            </div>
        
            <div className="space-x-2">
              <Button variant="outline" className="bg-blue-600 hover:bg-blue-700">
                Trocar usuário
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PagamentoModal
        isOpen={isPagamentoModalOpen}
        onClose={() => setIsPagamentoModalOpen(false)}
        valorTotal={totalGeral}
        onConfirmarPagamento={handlePagamento}
        itensMesa={itensMesa || []}
      />
    </>
  );
};
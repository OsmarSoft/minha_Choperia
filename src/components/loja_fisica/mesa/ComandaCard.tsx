// src/components/loja_fisica/mesa/ComandaCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { printComanda } from "@/services/PrintService";
import { Plus } from 'lucide-react';
import { PedidoItem } from "@/types/tipo";
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComandaCardProps {
  mesaPedido?: number;
  itensMesa: PedidoItem[];
  onAddProduto: () => void;
  onDeleteItem: (itemSlug: string) => void;
  onCancelPedido: () => void;
  totalGeral: number;
  onPagar: () => void;
}

export const ComandaCard = ({ 
  mesaPedido, 
  itensMesa, 
  onAddProduto, 
  onDeleteItem,
  onCancelPedido,
  totalGeral,
  onPagar
}: ComandaCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  /*
  // Log das props recebidas
  useEffect(() => {
    console.log('📌 ComandaCard - mesaPedido:', mesaPedido);
    console.log('📌 ComandaCard - itensMesa:', itensMesa);
    console.log('📌 ComandaCard - totalGeral:', totalGeral);
  }, [mesaPedido, itensMesa, totalGeral]);
  */

  const handleDeleteItem = async (itemSlug: string) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onDeleteItem(itemSlug);
      toast({
        title: "Item removido",
        description: "O item foi removido da comanda.",
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
          // Adicionando um progress indicator através de HTML
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o item.",
        variant: "destructive",
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
          // Adicionando um progress indicator através de HTML
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPedido = async () => {
    try {
      await onCancelPedido();
      toast({
        title: "Pedido cancelado",
        description: "Todos os itens foram removidos.",
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
          // Adicionando um progress indicator através de HTML
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
      navigate(`/loja-fisica/mesas/`);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o pedido.",
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

  const handlePreview = () => {
    console.log('🖨️ Gerando pré-visualização da comanda:', { mesaPedido, itensMesa, totalGeral });
    printComanda(mesaPedido, itensMesa, totalGeral);
    toast({
      title: "Pré-visualização da comanda",
      description: "Uma nova janela foi aberta com a pré-visualização da comanda.",
      duration: 2000, // Reduzindo para 2 segundos (2000ms)
        // Adicionando um progress indicator através de HTML
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
  };

  return (
    <Card className="md:col-span-2">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Comanda de Pedido: {mesaPedido}
          </h2>
          <Button onClick={onAddProduto}>
            <Plus className="h-5 w-5 mr-2" /> Produto
          </Button>
        </div>

        {itensMesa.length > 0 ? (
          <div className="space-y-4">
            {/* Tabela com cabeçalho fixo, corpo rolável e rodapé fixo */}
            <div className="relative">
              {/* Cabeçalho fixo */}
              <table className="w-full table-fixed border-b">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2 w-2/5">Item</th>
                    <th className="text-left p-2 w-1/5">Qtd</th>
                    <th className="text-left p-2 w-1/5">Preço Unit.</th>
                    <th className="text-left p-2 w-1/5">Total</th>
                    <th className="p-2 w-1/5"></th>
                  </tr>
                </thead>
              </table>

              {/* Corpo rolável */}
              <ScrollArea className="h-[40vh] w-full">
                <table className="w-full table-fixed">
                  <tbody>
                    {itensMesa.map((item, index) => (
                      <tr key={`${item.id}-${index}`}>
                        <td className="p-2 w-2/5 truncate">{item.nome}</td>
                        <td className="p-2 w-1/5">{item.quantidade}</td>
                        <td className="p-2 w-1/5">R$ {item.precoUnitario.toFixed(2)}</td>
                        <td className="p-2 w-1/5">R$ {(item.total).toFixed(2)}</td>
                        <td className="p-2 w-1/5">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteItem(item.slug)}
                            disabled={isLoading}
                          >
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea> 

              {/* Rodapé fixo */}
              <table className="w-full table-fixed border-t">
                <tfoot>
                  <tr className="bg-gray-100">
                    <td colSpan={3} className="text-right font-bold p-2 w-4/5">
                      Total a pagar:
                    </td>
                    <td className="font-bold p-2 w-1/5">
                      R$ {totalGeral.toFixed(2)}
                    </td>
                    <td className="p-2 w-1/5"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Botões */}
            <div className="space-x-2">
              <Button variant="secondary" onClick={handlePreview}>
                Visualizar e Imprimir Comanda
              </Button>
              <Button variant="destructive" onClick={handleCancelPedido}>
                Cancelar Pedido
              </Button>
              <Button variant="default" onClick={onPagar}>
                Pagar
              </Button>
            </div>
          </div>
        ) : (
          <p>Nenhum item adicionado.</p>
        )}
      </CardContent>
    </Card>
  );
};


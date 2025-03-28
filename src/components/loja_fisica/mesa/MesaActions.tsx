// src\components\loja_fisica\mesa\MesaActions.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { deletarMesa, getAllMesas } from '@/api/mesas/mesaService';
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from '@tanstack/react-query';

interface MesaActionsProps {
  isNovaMesaDialogOpen: boolean;
  setIsNovaMesaDialogOpen: (open: boolean) => void;
  isBalcaoDialogOpen: boolean;
  setIsBalcaoDialogOpen: (open: boolean) => void;
  nomeBalcao: string;
  setNomeBalcao: (nome: string) => void;
  handleCreateMesa: (numero: string) => void;
  handleCreateMesaBalcao: (event: React.FormEvent) => void;
  mesasDisponiveis: string[];
}

const MesaActions = ({
  isNovaMesaDialogOpen,
  setIsNovaMesaDialogOpen,
  isBalcaoDialogOpen,
  setIsBalcaoDialogOpen,
  nomeBalcao,
  setNomeBalcao,
  handleCreateMesa,
  handleCreateMesaBalcao,
  mesasDisponiveis,
}: MesaActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [mesaParaExcluir, setMesaParaExcluir] = React.useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeleteMesa = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const mesas = await getAllMesas();
      const mesa = mesas.find(m => m.numero === mesaParaExcluir); // Busca por numero em vez de nome

      if (!mesa) {
        toast({
          variant: "destructive",
          title: "Erro ao excluir mesa",
          description: "Mesa não encontrada.",
          duration: 2000,
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
        return;
      }

      try {
        await deletarMesa(mesa.slug);
        queryClient.invalidateQueries({ queryKey: ['mesas'] });

        toast({
          title: "Mesa excluída",
          description: `A mesa ${mesa.numero} foi excluída com sucesso.`,
          duration: 2000,
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });

        setIsDeleteDialogOpen(false);
        setMesaParaExcluir('');
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao excluir mesa",
          description: "Não foi possível excluir a mesa.",
          duration: 2000,
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
      }
    } catch (error) {
      console.error('Erro ao buscar mesas:', error);
    }
  };

  return (
    <div className="flex gap-4 mb-8">
      <Dialog open={isNovaMesaDialogOpen} onOpenChange={setIsNovaMesaDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="bg-green-600 hover:bg-green-700">
            <Plus className="h-5 w-5 mr-2" /> Mesa
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Nova Mesa</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {mesasDisponiveis.map((numero) => (
              <Card key={numero} className="bg-green-100 hover:bg-green-200 cursor-pointer transition-colors">
                <div className="text-center mb-2">
                  <Button onClick={() => handleCreateMesa(numero)}>
                    Escolher
                  </Button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <h5 className="text-xl font-bold text-center">{numero}</h5>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isBalcaoDialogOpen} onOpenChange={setIsBalcaoDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            Pedido no balcão
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Mesa com Nome de Pessoa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateMesaBalcao} className="space-y-4">
            <div>
              <label htmlFor="nomeBalcao" className="text-sm font-medium">
                Nome da Mesa (Pessoa)
              </label>
              <Input
                id="nomeBalcao"
                value={nomeBalcao}
                onChange={(e) => setNomeBalcao(e.target.value)}
                placeholder="Digite o nome da pessoa"
                required
              />
            </div>
            <Button type="submit">Cadastrar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="ml-auto">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Mesa
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Mesa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDeleteMesa} className="space-y-4">
            <div>
              <label htmlFor="mesaParaExcluir" className="text-sm font-medium">
                Número da Mesa
              </label>
              <Input
                id="mesaParaExcluir"
                value={mesaParaExcluir}
                onChange={(e) => setMesaParaExcluir(e.target.value)}
                placeholder="Digite o número da mesa (ex.: 11)"
                required
              />
            </div>
            <Button type="submit" variant="destructive">Excluir</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MesaActions;
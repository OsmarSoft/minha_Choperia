// src\pages\loja_fisica\mesas\MesasPage.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { getAllMesas, salvarMesa, deletarMesa } from '@/api/mesas/mesaService';
import MesaCard from '@/components/loja_fisica/mesa/MesaCard';
import MesaActions from '@/components/loja_fisica/mesa/MesaActions';
import { Mesa } from "@/types/tipo";

const MesasPage = () => {
  const [isNovaMesaDialogOpen, setIsNovaMesaDialogOpen] = useState(false);
  const [isBalcaoDialogOpen, setIsBalcaoDialogOpen] = useState(false);
  const [nomeBalcao, setNomeBalcao] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: mesas = [], refetch } = useQuery({
    queryKey: ['mesas'],
    queryFn: getAllMesas,
    initialData: [],
  });
  
  const handleDeleteMesa = async (slug: string) => {
    try {
      await deletarMesa(slug); // Já usa o slug, sem necessidade de busca por nome ou número
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
  
      toast({
        title: "Mesa excluída",
        description: "A mesa foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir mesa",
        description: "Não foi possível excluir a mesa.",
      });
    }
  };

  useEffect(() => {
    const mesasStorage = localStorage.getItem('mesas');
    if (!mesasStorage) {
      refetch();
    }
  }, [refetch]);

  const mesasAbertas = mesas
    .filter(mesa => mesa.status === 'Ocupada')
    .sort((a, b) => {
      if (a.pedido !== b.pedido) {
        return a.pedido - b.pedido;
      }
      return a.nome.localeCompare(b.nome);
    });

  const mesasFechadas = mesas
    .filter(mesa => mesa.status === 'Livre')
    .sort((a, b) => {
      const numA = parseInt(a.nome);
      const numB = parseInt(b.nome);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.nome.localeCompare(b.nome);
    });

  const mesasDisponiveis = Array.from({ length: 20 }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    const mesaNome = `Mesa ${num}`;  // Match the format used in handleCreateMesa
    return !mesas.some(m => m.nome === mesaNome) ? num : null;
  }).filter(Boolean) as string[];

  const handleCreateMesa = async (numero: string) => {
    try {
      await salvarMesa({
        nome: `Mesa ${numero}`,
        numero: numero,
        status: 'Livre',
        pedido: 0,
        slug: `mesa-${numero}`,
        items: [],
        pedidos: [],
        ocupada: false,
        empresa: '1',
        valor_pago: 0.00,
        pessoas_pagaram: 0,
        numero_pessoas: 1,
        is_available: true,
      });
  
      // Invalidate the query to force a refetch
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
  
      setIsNovaMesaDialogOpen(false);
      toast({
        title: "Mesa criada",
        description: `A mesa ${numero} foi criada com sucesso.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar mesa",
        description: "Não foi possível criar a mesa.",
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

  const handleCreateMesaBalcao = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nomeBalcao.trim()) return;
  
    const slug = nomeBalcao.toLowerCase().replace(/\s+/g, '-');
    const novaMesa: Omit<Mesa, "id"> = {
      nome: nomeBalcao,
      numero: slug.slice(0, 10),
      status: 'Ocupada',
      pedido: 0,
      slug: slug,
      empresa: '1',
      valor_pago: 0.00,
      pessoas_pagaram: 0,
      numero_pessoas: 1,
      is_available: false,
      ocupada: true, // Adicionei a propriedade ocupada
      items: [], // Adicionei a propriedade items
      pedidos: [], // Adicionei a propriedade pedidos
      not_numerico: true,
    };
  
    try {
      const savedMesa = await salvarMesa(novaMesa);
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
      setIsBalcaoDialogOpen(false);
      setNomeBalcao('');
      toast({
        title: "Mesa de balcão criada",
        description: `A mesa para ${nomeBalcao} foi criada com sucesso.`,
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
        // Adicionando um progress indicator através de HTML
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
      navigate(`/loja-fisica/mesas/${savedMesa.slug}`);
    } catch (error: any) {
      console.error('Erro ao criar mesa de balcão:', error.response?.data || error);
      toast({
        variant: "destructive",
        title: "Erro ao criar mesa de balcão",
        description: `Não foi possível criar a mesa: ${JSON.stringify(error.response?.data || error.message)}`,
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

  const handleOpenMesa = (mesa: Mesa) => {
    navigate(`/loja-fisica/mesas/${mesa.slug}`);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-brewery-dark-brown mb-6">Gerenciamento de Mesas</h1>
      <MesaActions
        isNovaMesaDialogOpen={isNovaMesaDialogOpen}
        setIsNovaMesaDialogOpen={setIsNovaMesaDialogOpen}
        isBalcaoDialogOpen={isBalcaoDialogOpen}
        setIsBalcaoDialogOpen={setIsBalcaoDialogOpen}
        nomeBalcao={nomeBalcao}
        setNomeBalcao={setNomeBalcao}
        handleCreateMesa={handleCreateMesa}
        handleCreateMesaBalcao={handleCreateMesaBalcao}
        mesasDisponiveis={mesasDisponiveis}
      />

      {mesasAbertas.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Pedido(s) em andamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mesasAbertas.map((mesa) => (
              <MesaCard
                key={mesa.id}
                mesa={mesa}
                onOpen={() => handleOpenMesa(mesa)}
                onDelete={() => handleDeleteMesa(mesa.slug)}
                isOpen={true}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mesasFechadas.map((mesa) => (
          <MesaCard
            key={mesa.id}
            mesa={mesa}
            onOpen={() => handleOpenMesa(mesa)}
            onDelete={() => handleDeleteMesa(mesa.slug)}
          />
        ))}
      </div>
    </div>
  );
};

export default MesasPage;
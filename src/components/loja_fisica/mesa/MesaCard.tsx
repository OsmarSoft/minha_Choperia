
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Mesa } from "@/types/tipo";

interface MesaCardProps {
  mesa: Mesa;
  onOpen: (id: number) => void;
  onDelete: (slug: string) => void;
  isOpen?: boolean;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const MesaCard = ({ mesa, onOpen, onDelete, isOpen }: MesaCardProps) => {
  const total = mesa.items?.reduce((acc, item) => acc + item.total, 0) || 0;
  return (
    <Card className={`${isOpen ? 'bg-blue-600' : 'bg-gray-600'} text-white relative min-h-[130px] p-3 sm:p-4 flex flex-col transition-all`}>
      <div className="flex justify-between items-start mb-2">
        <Button 
          variant="link" 
          className="text-white hover:text-gray-100 p-0 sm:p-2 h-auto"
          onClick={() => onOpen(mesa.id)}
        >
          {isOpen ? `Ver pedido #${mesa.pedido}` : 'Abrir'}
        </Button>
        {!isOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(mesa.slug
            )}
            className="hover:bg-red-700/20 h-8 w-8"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </Button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <h5 className="text-xl font-bold text-center">{mesa.nome}</h5>
      </div>
      {total > 0 && (
        <div className="text-center mt-2 text-sm bg-white/10 py-1 px-2 rounded">
          {formatCurrency(total)}
        </div>
      )}
    </Card>
  );
};

export default MesaCard;

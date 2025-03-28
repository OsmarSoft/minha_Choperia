
// src/components/loja/CarrinhoDrawer.tsx
import React, { useState } from 'react';
import { useCarrinho } from '@/components/loja/carrinhoApi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CarrinhoDrawer = () => {
  const {
    carrinho,
    removerItem,
    atualizarQuantidade,
    totalCarrinho,
    subtotalCarrinho,
    quantidadeItens,
    limparCarrinho
  } = useCarrinho();

  console.log('Valores recebidos no CarrinhoDrawer:', {
    carrinho,
    subtotalCarrinho,
    totalCarrinho,
    quantidadeItens
  });

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  const handleLimparCarrinho = () => {
    if (window.confirm('Tem certeza que deseja limpar o carrinho? Esta ação não pode ser desfeita.')) {
      console.log('Limpando o carrinho...');
      limparCarrinho();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="relative hover:scale-105 transition-transform duration-200"
        >
          <ShoppingCart className="h-5 w-5" />
          {quantidadeItens > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {quantidadeItens}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        key={carrinho.length} // Força re-renderização
        className="w-full sm:w-[400px] md:w-[540px] lg:w-[640px] xl:w-[720px] flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>Seu Carrinho</SheetTitle>
          <SheetDescription>
            Gerencie os itens do seu carrinho de compras
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 mt-8 overflow-y-auto h-[calc(100vh-250px)]">
          {carrinho.length === 0 ? (
            <p className="text-center text-gray-500">Seu carrinho está vazio</p>
          ) : (
            <div className="space-y-4 pr-4">
              {carrinho.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:shadow-lg transition-shadow duration-300 space-y-4 sm:space-y-0"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{item.nome}</h3>
                    <p className="text-sm text-gray-500">
                      R$ {(item.venda || item.preco).toFixed(2)}
                    </p>
                    {item.empresaId && (
                      <p className="text-xs text-gray-400">
                        Empresa ID: {item.empresaId}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => atualizarQuantidade(item.slug, item.quantidade - 1)}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => atualizarQuantidade(item.slug, item.quantidade + 1)}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removerItem(item.slug)}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-background border-t pt-4">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span>R$ {typeof subtotalCarrinho === 'number' ? subtotalCarrinho.toFixed(2) : '0.00'}</span>
            </div>
            <div className="flex justify-between items-center font-bold">
              <span>Total:</span>
              <span>R$ {typeof totalCarrinho === 'number' ? totalCarrinho.toFixed(2) : '0.00'}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 py-4">
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleLimparCarrinho}
            >
              Limpar Carrinho
            </Button>
            <Button 
              onClick={handleCheckout} 
              className="w-full sm:w-auto"
            >
              Finalizar Compra
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CarrinhoDrawer;

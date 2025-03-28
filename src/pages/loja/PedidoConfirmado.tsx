// Code: src/components/loja/PedidoConfirmado.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Home, ShoppingBag } from 'lucide-react';

const PedidoConfirmado = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-16 px-4 flex flex-col items-center">
      <div className="mb-8 flex flex-col items-center">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-center">Pedido Confirmado!</h1>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          Seu pedido foi recebido e está sendo processado. Obrigado por sua compra!
        </p>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Detalhes do Pedido</CardTitle>
          <CardDescription>Informações sobre seu pedido</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Número do Pedido:</span>
              <span>{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Data:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="text-green-600 font-medium">Confirmado</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Button>
          <Button 
            className="w-full" 
            onClick={() => navigate('/produtos')}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continuar Comprando
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PedidoConfirmado;

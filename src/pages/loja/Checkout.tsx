import React, { useState } from 'react';
import { useCarrinho } from '@/components/loja/carrinhoApi';
import { useToast } from '@/hooks/use-toast';
import { PagamentoModalOnline } from '@/components/loja/PagamentoModalOnline';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, ArrowLeft, Send } from 'lucide-react';
import { criarPedidoOnline, carregarPedidosUsuario } from '@/api/pedidos/pedidoService';
import { PedidoItem, ProdutoCarrinho } from '@/types/tipo';

const Checkout = () => {
  const { carrinho, totalCarrinho, limparCarrinho, subtotalCarrinho, carrinhoSlug } = useCarrinho();
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePagamento = async (metodoPagamento: string, valor: number) => {
    if (!carrinhoSlug) {
      toast({ title: "Erro", description: "Carrinho não encontrado.", variant: "destructive" });
      return;
    }

    const itensPedido: PedidoItem[] = carrinho.map((item: ProdutoCarrinho) => ({
      id: item.id,
      nome: item.nome,
      empresaId: item.empresaId || '1', // Valor padrão se não houver empresaId
      quantidade: item.quantidade,
      precoUnitario: item.venda || item.preco,
      total: (item.venda || item.preco) * item.quantidade,
      slug: item.slug,
    }));

    try {
      console.log('🚀 Iniciando processamento do pedido online...');
      console.log('📌 Itens do pedido:', itensPedido);

      // Validar itens antes de processar
      for (const item of itensPedido) {
        if (!item.slug) throw new Error(`Item sem slug: ${item.nome}`);
        if (!item.empresaId) throw new Error(`Item sem empresaId: ${item.nome}`);
      }

      // Criar pedido no backend usando o endpoint correto
      console.log('📤 Criando pedido online...');
      const novoPedido = await criarPedidoOnline({
        carrinhoSlug,
        empresaId: itensPedido[0].empresaId,
        metodoPagamento,
        itens: itensPedido,
        total: totalCarrinho,
      });

      console.log('✅ Pedido criado com sucesso:', novoPedido);

      // Limpar carrinho
      limparCarrinho();
      console.log('🧹 Carrinho limpo');

      // Atualizar o histórico imediatamente
      const pedidosAtualizados = await carregarPedidosUsuario();
      console.log('✅ Histórico atualizado:', pedidosAtualizados);

      toast({
        title: "Pedido enviado com sucesso!",
        description: "Seu pedido foi registrado e está em processamento.",
        duration: 2000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });

      navigate('/historico'); // Redirecionar para o histórico em vez de '/pedido-confirmado'
    } catch (error: any) {
      console.error('❌ Erro ao processar pedido:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      toast({
        title: "Erro ao enviar pedido",
        description: `Não foi possível registrar o pedido: ${error.message}. Verifique o console para mais detalhes.`,
        variant: "destructive",
        duration: 2000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-red-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
    }
  };

  const handleVoltar = () => navigate(-1);

  if (carrinho.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Carrinho vazio</CardTitle>
            <CardDescription>Seu carrinho está vazio. Adicione produtos antes de continuar.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/produtos')}>
              Ver produtos
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Button variant="outline" onClick={handleVoltar} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Resumo do Pedido
              </CardTitle>
              <CardDescription>Confira os itens do seu pedido</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carrinho.map((item: ProdutoCarrinho) => (
                  <div key={item.id} className="flex justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantidade} x R$ {(item.venda || item.preco).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      R$ {((item.venda || item.preco) * item.quantidade).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {subtotalCarrinho.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>R$ {totalCarrinho.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowPagamentoModal(true)}
              >
                <Send className="mr-2 h-5 w-5" />
                Finalizar Pedido
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <PagamentoModalOnline
        isOpen={showPagamentoModal}
        onClose={() => setShowPagamentoModal(false)}
        valorTotal={totalCarrinho}
        itensCarrinho={carrinho}
        onConfirmarPagamento={handlePagamento}
      />
    </div>
  );
};

export default Checkout;
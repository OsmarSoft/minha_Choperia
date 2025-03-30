import React, { useState, useEffect } from 'react';
import { useAvaliacoes } from '@/components/loja/avaliacoesApi';
import { useAuth } from '@/components/auth/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/loja/StarRating';
import { Avaliacao } from '@/types/tipo';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, Pencil, Trash2 } from 'lucide-react';

interface ProdutoAvaliacaoProps {
  produtoId: string | number; // Aceitar string ou number
}

const ProdutoAvaliacao = ({ produtoId }: ProdutoAvaliacaoProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    getAvaliacoesProduto, 
    getMediaAvaliacoes, 
    adicionarAvaliacao,
    editarAvaliacao,
    removerAvaliacao,
    avaliacoes: avaliacoesUsuario
  } = useAvaliacoes();
  
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [mediaAvaliacoes, setMediaAvaliacoes] = useState(0);
  const [novaAvaliacao, setNovaAvaliacao] = useState(0);
  const [comentario, setComentario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(true);

  // Normalizar o produtoId para string
  const produtoIdString = String(produtoId);

  // Verifica se o usuário já avaliou este produto
  const avaliacaoExistente = avaliacoesUsuario.find(
    (a) => a.produtoId === produtoIdString
  );

  useEffect(() => {
    if (avaliacaoExistente) {
      setNovaAvaliacao(avaliacaoExistente.rating);
      setComentario(avaliacaoExistente.comentario);
    } else {
      setNovaAvaliacao(0);
      setComentario('');
    }
  }, [avaliacaoExistente]);

  useEffect(() => {
    const carregarAvaliacoes = async () => {
      setLoadingAvaliacoes(true);
      try {
        const [avaliacoesProduto, media] = await Promise.all([
          getAvaliacoesProduto(produtoIdString),
          getMediaAvaliacoes(produtoIdString)
        ]);
        setAvaliacoes(avaliacoesProduto);
        setMediaAvaliacoes(media);
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      } finally {
        setLoadingAvaliacoes(false);
      }
    };

    carregarAvaliacoes();
  }, [produtoIdString, getAvaliacoesProduto, getMediaAvaliacoes]);

  const handleSubmitAvaliacao = async () => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para avaliar este produto.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (novaAvaliacao === 0) {
      toast({
        title: "Avaliação necessária",
        description: "Selecione pelo menos uma estrela para avaliar o produto.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Sempre usa adicionarAvaliacao, pois o backend faz update_or_create
      await adicionarAvaliacao(produtoIdString, novaAvaliacao, comentario);
      
      // Recarrega as avaliações do produto
      const [avaliacoesProduto, media] = await Promise.all([
        getAvaliacoesProduto(produtoIdString),
        getMediaAvaliacoes(produtoIdString)
      ]);
      
      setAvaliacoes(avaliacoesProduto);
      setMediaAvaliacoes(media);
      
      // Limpa o formulário apenas se for uma nova avaliação
      if (!avaliacaoExistente) {
        setNovaAvaliacao(0);
        setComentario('');
      }
      
      toast({
        title: avaliacaoExistente ? "Avaliação atualizada" : "Avaliação enviada",
        description: avaliacaoExistente 
          ? "Sua avaliação foi atualizada com sucesso." 
          : "Obrigado pela sua avaliação!",
        duration: 3000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_3s_ease-in-out]"></div>
          </div>
        ),
      });
    } catch (error: any) {
      toast({
        title: "Erro ao avaliar",
        description: error.message || "Não foi possível enviar sua avaliação.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditarAvaliacao = (avaliacao: Avaliacao) => {
    setNovaAvaliacao(avaliacao.rating);
    setComentario(avaliacao.comentario);
  };

  const handleRemoverAvaliacao = async (slug: string) => {
    setIsLoading(true);
    try {
      await removerAvaliacao(slug);
      
      // Recarrega as avaliações do produto
      const [avaliacoesProduto, media] = await Promise.all([
        getAvaliacoesProduto(produtoIdString),
        getMediaAvaliacoes(produtoIdString)
      ]);
      
      setAvaliacoes(avaliacoesProduto);
      setMediaAvaliacoes(media);
      setNovaAvaliacao(0);
      setComentario('');
      
      toast({
        title: "Avaliação removida",
        description: "Sua avaliação foi removida com sucesso.",
        duration: 3000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_3s_ease-in-out]"></div>
          </div>
        ),
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message || "Não foi possível remover a avaliação.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatarData = (dataString: string) => {
    try {
      return format(parseISO(dataString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dataString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-bold mb-4">Avaliações do Produto</h2>
        
        <div className="flex items-center mb-6">
          <div className="flex items-center mr-4">
            <StarRating rating={mediaAvaliacoes} readonly={true} />
          </div>
          <span className="text-lg font-medium">
            {mediaAvaliacoes.toFixed(1)} ({avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'})
          </span>
        </div>
        
        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{avaliacaoExistente ? "Sua Avaliação" : "Avalie este produto"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <StarRating 
                  rating={novaAvaliacao} 
                  onRate={(rating) => setNovaAvaliacao(rating)}
                />
              </div>
              <Textarea
                placeholder="Compartilhe sua opinião sobre este produto..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="h-24"
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSubmitAvaliacao}
                disabled={isLoading || novaAvaliacao === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : avaliacaoExistente ? (
                  'Atualizar Avaliação'
                ) : (
                  'Enviar Avaliação'
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {loadingAvaliacoes ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : avaliacoes.length > 0 ? (
          <div className="space-y-4">
            {avaliacoes.map((avaliacao) => (
              <Card key={avaliacao.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold">{avaliacao.userName}</p>
                      <p className="text-sm text-gray-500">
                        {formatarData(avaliacao.data)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StarRating rating={avaliacao.rating} readonly={true} />
                      {user && avaliacao.userId === String(user.id) && (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditarAvaliacao(avaliacao)}
                            disabled={isLoading}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoverAvaliacao(avaliacao.slug)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700">{avaliacao.comentario}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Este produto ainda não possui avaliações.
              {user ? ' Seja o primeiro a avaliar!' : ' Faça login para avaliar este produto.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProdutoAvaliacao;
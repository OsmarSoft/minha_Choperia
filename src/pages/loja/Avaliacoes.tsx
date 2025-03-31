import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Star } from "lucide-react";
import { useAvaliacoes } from '@/components/loja/avaliacoesApi';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion } from 'framer-motion';
import { Avaliacao } from '@/types/tipo';

const StarRating = ({ rating, onChange }: { rating: number; onChange?: (rating: number) => void }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`p-1 ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHoverRating(star)}
          onMouseLeave={() => onChange && setHoverRating(0)}
        >
          <Star
            className={`h-6 w-6 ${
              star <= (hoverRating || rating)
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const Avaliacoes = () => {
  const { getAvaliacoesUsuario, editarAvaliacao, removerAvaliacao } = useAvaliacoes();
  const { toast } = useToast();
  const [minhasAvaliacoes, setMinhasAvaliacoes] = useState<Avaliacao[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [avaliacaoAtual, setAvaliacaoAtual] = useState<Avaliacao | null>(null);
  const [novoComentario, setNovoComentario] = useState('');
  const [novaAvaliacao, setNovaAvaliacao] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchAvaliacoes = async () => {
    setIsLoading(true);
    try {
      const avaliacoesUsuario = await getAvaliacoesUsuario(email, password);
      setMinhasAvaliacoes(avaliacoesUsuario);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar avaliações",
        description: "Não foi possível carregar suas avaliações.",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (email && password) {
      fetchAvaliacoes();
    }
  }, [email, password]);

  const handleEditarClick = (avaliacao: Avaliacao) => {
    setAvaliacaoAtual(avaliacao);
    setNovoComentario(avaliacao.comentario);
    setNovaAvaliacao(avaliacao.rating);
    setIsDialogOpen(true);
  };

  const handleRemoverAvaliacao = async (id: string) => {
    setIsLoading(true);
    try {
      await removerAvaliacao(email, password, id);
      await fetchAvaliacoes();
      toast({
        title: "Avaliação removida",
        description: "Sua avaliação foi removida com sucesso.",
        duration: 2000,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover avaliação",
        description: error.response?.data?.error || "Não foi possível remover a avaliação.",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalvarEdicao = async () => {
    if (!avaliacaoAtual) return;
    setIsLoading(true);
    try {
      await editarAvaliacao(email, password, avaliacaoAtual.id, novaAvaliacao, novoComentario);
      await fetchAvaliacoes();
      setIsDialogOpen(false);
      toast({
        title: "Avaliação atualizada",
        description: "Sua avaliação foi atualizada com sucesso.",
        duration: 2000,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar avaliação",
        description: error.response?.data?.error || "Não foi possível atualizar a avaliação.",
        duration: 2000,
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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-brewery-dark-brown mb-6">
        Minhas Avaliações
      </h1>

      {!email || !password ? (
        <div className="mb-6">
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <input
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <Button onClick={fetchAvaliacoes}>Carregar Avaliações</Button>
        </div>
      ) : isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-8"
        >
          <p className="text-gray-600">Carregando avaliações...</p>
        </motion.div>
      ) : minhasAvaliacoes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-gray-100 rounded-lg"
        >
          <p className="text-gray-600 mb-4">Você ainda não fez nenhuma avaliação.</p>
          <Button asChild>
            <a href="/produtos">Ver Produtos</a>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {minhasAvaliacoes.map((avaliacao, index) => (
            <motion.div
              key={avaliacao.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{avaliacao.produtoNome || "Produto"}</CardTitle>
                      <CardDescription>{formatarData(avaliacao.data)}</CardDescription>
                    </div>
                    <div>
                      <StarRating rating={avaliacao.rating} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{avaliacao.comentario}</p>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditarClick(avaliacao)}
                    disabled={isLoading}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoverAvaliacao(avaliacao.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Avaliação</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-center mb-4">
              <StarRating
                rating={novaAvaliacao}
                onChange={(rating) => setNovaAvaliacao(rating)}
              />
            </div>
            <Textarea
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              placeholder="Compartilhe sua opinião sobre este produto..."
              className="h-32"
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSalvarEdicao} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Avaliacoes;
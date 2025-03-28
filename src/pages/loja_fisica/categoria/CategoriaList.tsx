import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Edit, Plus, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { getAllCategorias, salvarCategoria, atualizarCategoria, removerCategoria } from '@/api/categorias/categoriaService';
import { useToast } from '@/hooks/use-toast';
import { Categoria } from '@/types/tipo';
import { getProdutosPorCategoria, getProdutosPorCategoriaCount } from '@/api/produtos/produtoService';
import { getCachedCategorias, getCachedProdutosCount, saveToLocalStorage } from '@/data/categoria_storage';

const ITEMS_PER_PAGE = 5;

const CategoriaList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [deletingCategoria, setDeletingCategoria] = useState<Categoria | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ 
    key: string | null; 
    direction: 'ascending' | 'descending' 
  }>({ 
    key: null, 
    direction: 'ascending' 
  });
  const [produtosCount, setProdutosCount] = useState<{ [key: string]: number }>(getCachedProdutosCount());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categorias = getCachedCategorias() } = useQuery({
    queryKey: ['categorias'],
    queryFn: getAllCategorias,
    initialData: getCachedCategorias(),
  });

  useEffect(() => {
    const fetchProdutosCount = async () => {
      const counts: { [key: string]: number } = {};
      for (const categoria of categorias) {
        counts[categoria.id] = await getProdutosPorCategoriaCount(categoria.nome);
      }
      setProdutosCount(counts);
      saveToLocalStorage(categorias, counts);
    };

    fetchProdutosCount();
  }, [categorias]);

  useEffect(() => {
    saveToLocalStorage(categorias, produtosCount);
  }, [categorias, produtosCount]);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNovaCategoria('');
    setEditingCategoria(null);
  };

  const handleAddCategoria = async () => {
    if (novaCategoria.trim().length < 3) {
      const toastId = toast({
        variant: "destructive",
        description: "O nome da categoria deve ter pelo menos 3 caracteres.",
        duration: 2000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
      // Não é necessário fechar manualmente se duration funciona
      return;
    }
  
    if (
      categorias.some(
        (cat) =>
          cat.nome.toLowerCase() === novaCategoria.toLowerCase() &&
          (!editingCategoria || cat.slug !== editingCategoria.slug)
      )
    ) {
      const toastId = toast({
        variant: "destructive",
        description: "Esta categoria já existe.",
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
      if (editingCategoria) {
        const categoriaAtualizada = {
          id: editingCategoria.id,
          nome: novaCategoria,
          slug: novaCategoria.toLowerCase().replace(/\s/g, '-'),
        };
        await atualizarCategoria(editingCategoria.slug, categoriaAtualizada);
        await queryClient.invalidateQueries({ queryKey: ['categorias'] });
        toast({
          description: `Categoria "${editingCategoria.nome}" atualizada para "${novaCategoria}" com sucesso.`,
          duration: 2000,
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
      } else {
        const novaCategoriaObj = {
          id: crypto.randomUUID(),
          nome: novaCategoria,
          slug: novaCategoria.toLowerCase().replace(/\s/g, '-'),
        };
        await salvarCategoria(novaCategoriaObj);
        await queryClient.invalidateQueries({ queryKey: ['categorias'] });
        toast({
          description: `Categoria "${novaCategoria}" adicionada com sucesso.`,
          duration: 2000,
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
      }
      handleCloseDialog();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Ocorreu um erro ao salvar a categoria.",
        duration: 2000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setNovaCategoria(categoria.nome);
    setIsDialogOpen(true);
  };

  const handleDelete = (categoria: Categoria) => {
    setDeletingCategoria(categoria);
  };

  const confirmDelete = async () => {
    if (deletingCategoria) {
      try {
        const produtosNaCategoria = await getProdutosPorCategoria(deletingCategoria.nome);
  
        if (produtosNaCategoria.length > 0) {
          toast({
            variant: "destructive",
            description: `Não é possível excluir a categoria "${deletingCategoria.nome}" pois existe${produtosNaCategoria.length > 1 ? 'm' : ''} ${produtosNaCategoria.length} produto${produtosNaCategoria.length > 1 ? 's' : ''} vinculado${produtosNaCategoria.length > 1 ? 's' : ''} a ela.`,
            duration: 2000, // Reduzindo para 2 segundos (2000ms)
            // Adicionando um progress indicator através de HTML
            action: (
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
                <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
              </div>
            ),
          });
        } else {
          console.log('Excluindo categoria:', deletingCategoria.slug);
          await removerCategoria(deletingCategoria.slug);
          await queryClient.invalidateQueries({ queryKey: ['categorias'] });
          await queryClient.invalidateQueries({ queryKey: ['produtos'] });
          toast({
            description: `Categoria "${deletingCategoria.nome}" removida com sucesso.`,
            duration: 2000, // Reduzindo para 2 segundos (2000ms)
            // Adicionando um progress indicator através de HTML
            action: (
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
                <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
              </div>
            ),
          });
          // Atualizar a UI apenas se a remoção for bem-sucedida
          await queryClient.invalidateQueries({ queryKey: ['categoria', deletingCategoria.slug] });
          setDeletingCategoria(null);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          description: "Ocorreu um erro ao excluir a categoria.",
          duration: 2000, // Reduzindo para 2 segundos (2000ms)
          // Adicionando um progress indicator através de HTML
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
      }
    }
  };

  const categoriasFiltradas = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === 'ascending' ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const sortedCategorias = [...categoriasFiltradas].sort((a, b) => {
    if (!sortConfig.key) return 0;
  
    let aValue, bValue;
  
    if (sortConfig.key === 'produtos') {
      aValue = produtosCount[a.id] || 0;
      bValue = produtosCount[b.id] || 0;
    } else {
      aValue = a[sortConfig.key as keyof Categoria];
      bValue = b[sortConfig.key as keyof Categoria];
    }
  
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortConfig.direction === 'ascending' ? comparison : -comparison;
    }
  
    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedCategorias.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategorias = sortedCategorias.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const SortableTableHead = ({ children, sortKey }: { children: React.ReactNode; sortKey: string }) => (
    <TableHead>
      <div 
        className="flex items-center cursor-pointer hover:text-primary"
        onClick={() => requestSort(sortKey)}
      >
        {children}
        {renderSortIcon(sortKey)}
      </div>
    </TableHead>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brewery-dark-brown">Gerenciar Categorias</h1>
        <Button 
          onClick={() => {
            setEditingCategoria(null);
            setNovaCategoria('');
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Categoria
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Buscar categoria..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border">
        {paginatedCategorias.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma categoria cadastrada. Clique em "Nova Categoria" para adicionar.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead sortKey="nome">Nome</SortableTableHead>
                <SortableTableHead sortKey="produtos">Quantidade de Produtos</SortableTableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell className="font-medium">{categoria.nome}</TableCell>
                  <TableCell>{produtosCount[categoria.id] || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(categoria)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(categoria)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={`hover:cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="hover:cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={`hover:cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nome da categoria"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              className="w-full"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategoria()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleAddCategoria}>
              {editingCategoria ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCategoria} onOpenChange={(open) => !open && setDeletingCategoria(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deletingCategoria?.nome}"? 
              Isso pode afetar produtos associados a esta categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoriaList;
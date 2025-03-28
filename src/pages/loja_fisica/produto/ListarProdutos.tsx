// src\pages\loja_fisica\produto\ListarProdutos.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { 
  getAllProdutos, 
  salvarProduto, 
  atualizarProduto, 
  removerProduto 
} from '@/api/produtos/produtoService';
import { getEmpresas } from '@/api/empresas/empresaService';
import { getAllCategorias } from '@/api/categorias/categoriaService';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import ProdutoTable from '@/components/loja_fisica/produto/ProdutoTable';
import ProdutoDialog from '@/components/loja_fisica/produto/ProdutoDialog';

const ListarProdutos = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<any>(null);
  const [deletingProdutoSlug, setDeletingProdutoSlug] = useState<string | null>(null);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const { toast } = useToast();
  const [empresas, setEmpresas] = useState<Array<{ id: string; nome: string }>>([]);
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string }>>([]);
  const navigate = useNavigate();
  const { slug } = useParams();
  const ITEMS_PER_PAGE = 5;
  const queryClient = useQueryClient();
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending'
  });

  const { data: produtos = [], isFetching } = useQuery({
    queryKey: ['produtos'],
    queryFn: getAllProdutos,
  });

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const categoriasData = await getAllCategorias();
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const empresasData = await getEmpresas();
        if (empresasData.length === 0) {
          setEmpresas([{ id: '1', nome: 'Empresa Padrão' }]);
        } else {
          setEmpresas(empresasData);
        }
      } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        setEmpresas([{ id: '1', nome: 'Empresa Padrão' }]);
      }
    };
    fetchEmpresas();
  }, []);

  useEffect(() => {
    if (slug) {
      const produto = produtos.find(p => p.slug === slug);
      if (produto) {
        setEditingProduto(produto);
        setIsDialogOpen(true);
      }
    }
  }, [slug, produtos]);

  const handleDeleteAll = async () => {
    try {
      for (const produto of produtos) {
        await removerProduto(produto.slug);
      }
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast({
        title: "Produtos removidos",
        description: "Todos os produtos foram removidos com sucesso.",
        duration: 2000, // Reduzindo para 2 segundos (2000ms)
        // Adicionando um progress indicator através de HTML
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
      setIsDeleteAllDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Ocorreu um erro ao tentar remover todos os produtos.",
        duration: 2000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
      
    }
  };

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = selectedCategoria === 'todas' || produto.categoria === selectedCategoria;
    
    return matchesSearch && matchesCategoria;
  });

  const sortedProdutos = [...filteredProdutos].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key as keyof typeof a];
    const bValue = b[sortConfig.key as keyof typeof b];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortConfig.direction === 'ascending' ? comparison : -comparison;
    }

    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedProdutos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProdutos = sortedProdutos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchClick = () => {
    setCurrentPage(1);
    toast({
      title: "Produto pesquisado",
      description: searchTerm ? `Pesquisando por "${searchTerm}"` : "Mostrando todos os produtos",
      duration: 2000, // Reduzindo para 2 segundos (2000ms)
      // Adicionando um progress indicator através de HTML
      action: (
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
          <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
        </div>
      ),
    });
  };

  const handleCategoriaChange = (value: string) => {
    setSelectedCategoria(value);
    setCurrentPage(1);
  };

  const handleEdit = (produto: any) => {
    navigate(`/loja-fisica/produtos/${produto.slug}`);
  };

  const handleDelete = (slug: string) => {
    setDeletingProdutoSlug(slug);
  };

  const confirmDelete = async () => {
    if (deletingProdutoSlug) {
      try {
        const produto = produtos.find(p => p.slug === deletingProdutoSlug);
        if (produto) {
          await removerProduto(deletingProdutoSlug);
          queryClient.invalidateQueries({ queryKey: ['produtos'] });
          queryClient.invalidateQueries({ queryKey: ['categorias'] });
          toast({
            title: "Produto removido",
            description: "O produto foi removido com sucesso.",
            duration: 2000, // Reduzindo para 2 segundos (2000ms)
            // Adicionando um progress indicator através de HTML
            action: (
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
                <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
              </div>
            ),
          });
          setDeletingProdutoSlug(null);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          description: "Ocorreu um erro ao tentar remover o produto.",
          duration: 2000,
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
      }
    }
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingProduto) {
        const updatedProduto = {
          ...editingProduto,
          ...data,
        };
        await atualizarProduto(updatedProduto, editingProduto.slug);
        queryClient.setQueryData(['produtos'], (oldData: any[] | undefined) => {
          if (!oldData) return [updatedProduto];
          return oldData.map((p) =>
            p.slug === editingProduto.slug ? updatedProduto : p
          );
        });
        await queryClient.invalidateQueries({ queryKey: ['produtos'] });
        toast({
          title: "Produto atualizado",
          description: `O produto "${data.nome}" foi atualizado com sucesso.`,
          duration: 2000,
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
      } else {
        const novoProduto = {
          ...data,
          id: crypto.randomUUID(),
          is_available: true,
        };
        await salvarProduto(novoProduto);
        queryClient.setQueryData(['produtos'], (oldData: any[] | undefined) => {
          if (!oldData) return [novoProduto];
          return [...oldData, novoProduto];
        });
        await queryClient.invalidateQueries({ queryKey: ['produtos'] });
        toast({
          description: `O produto "${data.nome}" foi cadastrado com sucesso.`,
          duration: 2000,
          action: (
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
            </div>
          ),
        });
        setSearchTerm('');
        setSelectedCategoria('todas');
        setCurrentPage(1);
      }
      // Fechar o modal e limpar o estado em ambos os casos
      setIsDialogOpen(false);
      setEditingProduto(null);
      if (slug) {
        navigate('/loja-fisica/produtos'); // Redireciona após edição, se veio de uma URL específica
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Ocorreu um erro ao tentar salvar o produto.",
        duration: 2000,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
    }
  };
  
  // Ajustar o onOpenChange para ser mais simples
  <ProdutoDialog
    isOpen={isDialogOpen}
    onOpenChange={setIsDialogOpen} // Simplificado: apenas atualiza o estado
    onSubmit={handleSubmit}
    empresas={empresas}
    categorias={categorias}
    initialData={editingProduto}
    slug={slug}
  />;
  
  // Remova ou ajuste a função handleCloseDialog se não for mais necessária em outros lugares
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduto(null);
    if (slug) {
      navigate('/loja-fisica/produtos');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lista de Produtos</h1>
        <div className="flex gap-4">
          <Button onClick={() => setIsDialogOpen(true)}>
            Adicionar Produto
          </Button>
        </div>
        <ProdutoDialog
          isOpen={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseDialog();
            } else {
              setIsDialogOpen(true);
            }
          }}
          onSubmit={handleSubmit}
          empresas={empresas}
          categorias={categorias}
          initialData={editingProduto}
          slug={slug}
        />
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="flex-1 flex gap-2">
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
          />
          <Button onClick={handleSearchClick} className="shrink-0">
            <Search className="h-4 w-4 mr-2" />
            Pesquisar
          </Button>
        </div>
        <div className="w-[200px]">
          <Select value={selectedCategoria} onValueChange={handleCategoriaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.nome}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isFetching && <p>Atualizando produtos...</p>}
      <ProdutoTable 
        produtos={paginatedProdutos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortConfig={sortConfig}
        onRequestSort={requestSort}
      />

      <AlertDialog open={!!deletingProdutoSlug} onOpenChange={(open) => !open && setDeletingProdutoSlug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
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

      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={(open) => !open && setIsDeleteAllDialogOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão de todos os produtos</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir todos os produtos? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="bg-red-500 hover:bg-red-600">
              Excluir Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:cursor-pointer'}
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
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'hover:cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ListarProdutos;


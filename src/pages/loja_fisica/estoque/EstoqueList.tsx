import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getMovimentacoesEstoque } from '@/api/estoque/estoqueService';
import { getProdutoPorId } from '@/api/produtos/produtoService';
import EstoqueTable from '@/components/loja_fisica/estoque/EstoqueTable';
import { MovimentacaoEstoque, ProdutoTipos } from '@/types/tipo';
import { getCachedMovimentacoes, getCachedProdutos, saveToLocalStorage } from '@/data/estoque_storage';

const EstoqueList = () => {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>(getCachedMovimentacoes());
  const [produtos, setProdutos] = useState<{ [key: string]: ProdutoTipos }>(getCachedProdutos());
  const [isLoading, setIsLoading] = useState(true); // Novo estado de carregamento
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({
    key: null,
    direction: 'ascending',
  });

  useEffect(() => {
    const fetchMovimentacoes = async () => {
      try {
        setIsLoading(true); // Inicia o carregamento
        const data = await getMovimentacoesEstoque();
        console.log("📦 Movimentações de Estoque:", data);
        setMovimentacoes(data);

        const produtosData: { [key: string]: ProdutoTipos } = { ...produtos }; // Preserva dados já existentes
        const movimentacoesValidas = data.filter(
          (movimentacao) => movimentacao.produto && typeof movimentacao.produto === "number"
        );

        console.log(`🔢 Total de movimentações válidas: ${movimentacoesValidas.length}`);

        const promessasProdutos = movimentacoesValidas.map(async (movimentacao) => {
          if (!produtosData[movimentacao.produto.toString()]) { // Só busca se não estiver em cache
            try {
              const produto = await getProdutoPorId(movimentacao.produto.toString());
              produtosData[movimentacao.produto.toString()] = produto;
            } catch (error) {
              console.error(`❌ Erro ao buscar produto ${movimentacao.produto}:`, error);
            }
          }
        });

        await Promise.all(promessasProdutos);
        setProdutos(produtosData);
        saveToLocalStorage(data, produtosData);
      } catch (error) {
        console.error("❌ Erro ao buscar movimentações:", error);
      } finally {
        setIsLoading(false); // Finaliza o carregamento
      }
    };

    fetchMovimentacoes();
  }, []);

  const ITEMS_PER_PAGE = 5;

  const filteredMovimentacoes = movimentacoes.filter((movimentacao) => {
    const produto = produtos[movimentacao.produto.toString()];
    return produto?.nome.toLowerCase().includes(searchTerm.toLowerCase()) || false;
  });

  const sortedMovimentacoes = [...filteredMovimentacoes].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (sortConfig.key === 'produto') {
      const produtoA = produtos[a.produto.toString()];
      const produtoB = produtos[b.produto.toString()];
      const comparison = (produtoA?.nome || '').localeCompare(produtoB?.nome || '');
      return sortConfig.direction === 'ascending' ? comparison : -comparison;
    }

    const aValue = a[sortConfig.key as keyof typeof a];
    const bValue = b[sortConfig.key as keyof typeof b];

    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedMovimentacoes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMovimentacoes = sortedMovimentacoes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p>Carregando movimentações...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Movimentações de Estoque</h1>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Buscar movimentações..."
          value={searchTerm}
          onChange={handleSearch}
          className="cursor-pointer"
        />
      </div>

      <EstoqueTable
        data={paginatedMovimentacoes}
        type="movimentacoes"
        nomesProdutos={Object.fromEntries(
          Object.entries(produtos).map(([id, produto]) => [id, produto.nome])
        )} // Passa os nomes dos produtos
        sortConfig={sortConfig}
        onRequestSort={requestSort}
      />

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className={`hover:cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default EstoqueList;
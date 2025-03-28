
import React from 'react';
import { ArrowDown, ArrowUp, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProdutoTableProps {
  produtos: any[];
  onEdit: (produto: any) => void;
  onDelete: (slug: string) => void;
  sortConfig: {
    key: string | null;
    direction: 'ascending' | 'descending';
  };
  onRequestSort: (key: string) => void;
}

const ProdutoTable: React.FC<ProdutoTableProps> = ({ 
  produtos, 
  onEdit, 
  onDelete, 
  sortConfig, 
  onRequestSort 
}) => {
  // Log the products to the console
  console.log('Produtos:', produtos);
  
  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <div 
      className="flex items-center cursor-pointer hover:text-primary"
      onClick={() => onRequestSort(sortKey)}
    >
      {label}
      {renderSortIcon(sortKey)}
    </div>
  );

  if (produtos.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <p className="text-gray-500">Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortableHeader label="Nome" sortKey="nome" />
            </TableHead>
            <TableHead>
              <SortableHeader label="Categoria" sortKey="categoria" />
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <SortableHeader label="Preço de Custo" sortKey="custo" />
            </TableHead>
            <TableHead>
              <SortableHeader label="Preço de Venda" sortKey="venda" />
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <SortableHeader label="Estoque" sortKey="estoque" />
            </TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produtos.map((produto) => (
            <TableRow key={produto.id}>
              <TableCell className="font-medium">{produto.nome}</TableCell>
              <TableCell>{produto.categoria}</TableCell>
              <TableCell className="hidden md:table-cell">
                {typeof produto.custo === 'number' 
                  ? produto.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                  : 'N/A'}
              </TableCell>
              <TableCell>
                {typeof produto.venda === 'number' 
                  ? produto.venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                  : 'N/A'}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className={`${produto.estoque < 10 ? 'text-red-500' : 'text-green-600'}`}>
                  {produto.estoque} unidades
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(produto)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-red-500" 
                    onClick={() => {
                      if (produto.slug) {
                        onDelete(produto.slug);
                      } else {
                        console.error('Produto sem slug:', produto);
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProdutoTable;

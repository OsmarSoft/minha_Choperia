import React from 'react';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { MovimentacaoEstoque, ProdutoTipos } from "@/types/tipo";
import { Badge } from "@/components/ui/badge";

interface EstoqueTableProps {
  data: ProdutoTipos[] | MovimentacaoEstoque[];
  type: 'produtos' | 'movimentacoes';
  nomesProdutos?: { [key: string]: string };
  sortConfig?: { key: string | null; direction: 'ascending' | 'descending' };
  onRequestSort?: (key: string) => void;
}

const EstoqueTable = ({ data, type, nomesProdutos = {}, sortConfig, onRequestSort }: EstoqueTableProps) => {
  const formatarData = (dataString: string): string => {
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  if (type === 'produtos') {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço (R$)</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data as ProdutoTipos[]).map((produto, index) => (
              <TableRow key={`${produto.id}-${index}`}>
                <TableCell>{produto.id}</TableCell>
                <TableCell>{produto.nome}</TableCell>
                <TableCell>{produto.categoria}</TableCell>
                <TableCell>R$ {produto.venda.toFixed(2)}</TableCell>
                <TableCell>{produto.estoque}</TableCell>
                <TableCell>
                  <Badge variant={produto.is_available ? "default" : "destructive"}>
                    {produto.is_available ? "Disponível" : "Indisponível"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => onRequestSort?.('produto')} className="cursor-pointer">
              Produto {getSortIcon('produto')}
            </TableHead>
            <TableHead onClick={() => onRequestSort?.('created')} className="cursor-pointer">
              Data {getSortIcon('created')}
            </TableHead>
            <TableHead onClick={() => onRequestSort?.('tipo')} className="cursor-pointer">
              Tipo {getSortIcon('tipo')}
            </TableHead>
            <TableHead onClick={() => onRequestSort?.('quantidade')} className="cursor-pointer">
              Quantidade {getSortIcon('quantidade')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data as MovimentacaoEstoque[]).map((movimentacao, index) => (
            <TableRow key={`${movimentacao.id}-${index}`}>
              <TableCell>{nomesProdutos[movimentacao.produto.toString()] || movimentacao.produto.toString()}</TableCell>
              <TableCell>{formatarData(movimentacao.created)}</TableCell>
              <TableCell>
                <Badge variant={movimentacao.tipo === 'entrada' ? "default" : "destructive"}>
                  {movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                </Badge>
              </TableCell>
              <TableCell>{movimentacao.quantidade}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EstoqueTable;
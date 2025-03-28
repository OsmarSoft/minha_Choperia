/*
Explicação das mudanças
Encapsulamento no categoria_storage.ts:
Criei funções reutilizáveis:
getCachedCategorias: Retorna categorias do localStorage ou initialCategorias como fallback.
getCachedProdutosCount: Retorna a contagem de produtos do localStorage ou initialProdutosCount como fallback.
saveToLocalStorage: Salva categorias e contagem no localStorage.
Os dados iniciais mockados (initialCategorias e initialProdutosCount) estão no arquivo para centralizar a lógica.
Integração no CategoriaList:
Importei as funções de categoria_storage.ts.
Usei getCachedCategorias() como initialData no useQuery para exibir categorias imediatamente.
Inicializei produtosCount com getCachedProdutosCount() para exibir valores iniciais antes da busca real.
Adicionei um segundo useEffect para salvar no localStorage sempre que categorias ou produtosCount mudarem.
Fluxo de carregamento:
Inicial: A página carrega com categorias e contagens do localStorage (ou mockadas, se não houver cache).
Atualização: O useQuery busca as categorias reais via getAllCategorias, e o useEffect atualiza produtosCount com os valores reais da API.
Persistência: Após cada atualização, os dados são salvos no localStorage para a próxima renderização.
Benefícios:
A tabela nunca começa com "Quantidade de Produtos" como 0, pois usa o cache ou valores iniciais.
O estado persiste entre sessões do navegador, melhorando a experiência do usuário.
Resultado esperado
Ao abrir a página, as categorias aparecem imediatamente com nomes e quantidades baseadas no localStorage (ou mockadas, se for a primeira vez).
A API atualiza os dados em segundo plano, e as mudanças são refletidas sem "saltos" visíveis de 0 para os valores reais.
Após cada interação (adicionar, editar, excluir), o localStorage é atualizado para manter os dados consistentes.
*/

import { Categoria } from '@/types/tipo';

// Dados iniciais mockados (padrão caso não haja dados no localStorage)
const initialCategorias: Categoria[] = [
  { id: '1', nome: 'Bebidas', slug: 'bebidas' },
  { id: '2', nome: 'Lanches', slug: 'lanches' },
  { id: '3', nome: 'Sobremesas', slug: 'sobremesas' },
];

const initialProdutosCount: { [key: string]: number } = {
  '1': 5, // Bebidas
  '2': 3, // Lanches
  '3': 2, // Sobremesas
};

// Função para obter categorias do cache ou valores iniciais
export const getCachedCategorias = (): Categoria[] => {
  const cached = localStorage.getItem('categorias');
  return cached ? JSON.parse(cached) : initialCategorias;
};

// Função para obter contagem de produtos do cache ou valores iniciais
export const getCachedProdutosCount = (): { [key: string]: number } => {
  const cached = localStorage.getItem('produtosCount');
  return cached ? JSON.parse(cached) : initialProdutosCount;
};

// Função para salvar categorias e contagem no localStorage
export const saveToLocalStorage = (
  categorias: Categoria[],
  produtosCount: { [key: string]: number }
) => {
  localStorage.setItem('categorias', JSON.stringify(categorias));
  localStorage.setItem('produtosCount', JSON.stringify(produtosCount));
};
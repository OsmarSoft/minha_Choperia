// src/data/loja/favoritos_storage.ts
export interface ProdutoFavorito {
  id: string;
  nome: string;
  preco: number;
  imagem?: string;
  descricao?: string;
}

const FAVORITOS_STORAGE_KEY = 'favoritos';

export const carregarFavoritos = (): ProdutoFavorito[] => {
  const savedFavoritos = localStorage.getItem(FAVORITOS_STORAGE_KEY);
  if (savedFavoritos) {
    try {
      return JSON.parse(savedFavoritos);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      return [];
    }
  }
  return [];
};

export const salvarFavoritos = (favoritos: ProdutoFavorito[]) => {
  localStorage.setItem(FAVORITOS_STORAGE_KEY, JSON.stringify(favoritos));
};


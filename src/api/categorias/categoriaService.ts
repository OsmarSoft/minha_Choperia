import axios from 'axios';
import { API_URL } from '../../config/api';

import { Categoria } from '../../types/tipo';

/*
export const getAllCategorias = (): Categoria[] => {
  return getAllCategoriasStorage();
};
*/

export const getAllCategorias = async (): Promise<Categoria[]> => {
  try {
    const response = await axios.get<Categoria[]>(`${API_URL}/categorias/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

export const salvarCategoria = async (categoria: Categoria): Promise<Categoria> => {
  try {
    const response = await axios.post(`${API_URL}/categorias/`, categoria);
    return response.data as Categoria;
  } catch (error) {
    console.error('Erro ao salvar categoria:', error);
  }
};

export const removerCategoria = async (slug: string): Promise<any> => {
  try {
    const categorias = await getAllCategorias();
    const categoria = categorias.find(cat => cat.slug === slug);

    console.log('🔍 Categoria a ser excluida:', categoria);

    if (categoria) {
      const response = await axios.delete(`${API_URL}/categorias/${slug}/`);
      return response.data;
    } else {
      console.error(`Categoria com id '${slug}' não encontrada`);
    }
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    throw error;
  }
};

export const atualizarCategoria = async (slug: string, novaCategoria: Categoria): Promise<any> => {
  try {
    const categorias = await getAllCategorias();
    const categoria = categorias.find(cat => cat.slug === slug);

    if (categoria) {
      const response = await axios.put(`${API_URL}/categorias/${slug}/`, novaCategoria);
      return response.data;
    } else {
      console.error(`Categoria com slug '${slug}' não encontrada`);
    }
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
};



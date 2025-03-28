
import { Empresa, NotaFiscal } from "../types/tipo";
import { empresas_iniciais } from "./empresas_locais";

const STORAGE_KEY = 'empresas';

// Get companies from storage or initialize with default values
export const getEmpresasFromStorage = (): Empresa[] => {
  try {
    const empresasFromStorage = localStorage.getItem(STORAGE_KEY);
    if (empresasFromStorage) {
      return JSON.parse(empresasFromStorage);
    }
    // Initialize with default values on first use and save to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empresas_iniciais));
    return empresas_iniciais;
  } catch (error) {
    console.error('Erro ao recuperar empresas do storage:', error);
    return empresas_iniciais;
  }
};

// Save a new company to storage
export const salvarEmpresaNoStorage = (empresa: Empresa): Empresa => {
  try {
    const empresas = getEmpresasFromStorage();
    empresas.push(empresa);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empresas));
    return empresa;
  } catch (error) {
    console.error('Erro ao salvar empresa no storage:', error);
    throw new Error('Falha ao salvar empresa.');
  }
};

// Update an existing company in storage
export const atualizarEmpresaNoStorage = (id: string, dadosAtualizados: Partial<Empresa>): Empresa | null => {
  try {
    const empresas = getEmpresasFromStorage();
    const index = empresas.findIndex(e => e.id === id);
    
    if (index === -1) return null;
    
    const empresaAtualizada = { ...empresas[index], ...dadosAtualizados };
    empresas[index] = empresaAtualizada;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empresas));
    
    return empresaAtualizada;
  } catch (error) {
    console.error('Erro ao atualizar empresa no storage:', error);
    throw new Error('Falha ao atualizar empresa.');
  }
};

// Delete a company from storage
export const deletarEmpresaDoStorage = (id: string): boolean => {
  try {
    const empresas = getEmpresasFromStorage();
    const novaLista = empresas.filter(e => e.id !== id);
    
    if (novaLista.length === empresas.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
    return true;
  } catch (error) {
    console.error('Erro ao deletar empresa do storage:', error);
    throw new Error('Falha ao deletar empresa.');
  }
};

/**
 * Inicializa o armazenamento de empresas se não existir
 */
const inicializarEmpresas = (): Empresa[] => {
  const empresas: Empresa[] = [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(empresas));
  return empresas;
};

/**
 * Obtém todas as empresas armazenadas
 */
export const getAllEmpresas = (): Empresa[] => {
  try {
    const empresasStorage = localStorage.getItem(STORAGE_KEY);
    if (!empresasStorage) {
      return inicializarEmpresas();
    }
    return JSON.parse(empresasStorage);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return [];
  }
};

/**
 * Busca uma empresa pelo seu ID
 */
export const getEmpresaById = (id: string): Empresa | null => {
  try {
    const empresas = getAllEmpresas();
    return empresas.find((emp) => emp.id === id) || null;
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return null;
  }
};

/**
 * Cadastra uma nova empresa
 */
export const cadastrarEmpresa = (
  data: Omit<Empresa, 'id' | 'notasFiscais'> & { 
    notaFiscal?: Omit<NotaFiscal, 'id' | 'empresaId'> 
  }
): Empresa => {
  try {
    const empresas = getAllEmpresas();
    const empresaId = crypto.randomUUID();
    
    const novaEmpresa: Empresa = {
      ...data,
      id: empresaId,
    };
    
    if (data.notaFiscal) {
      novaEmpresa.notasFiscais = [{
        ...data.notaFiscal,
        id: crypto.randomUUID(),
        empresaId: empresaId
      }];
    }
    
    empresas.push(novaEmpresa);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empresas));
    
    return novaEmpresa;
  } catch (error) {
    console.error('Erro ao cadastrar empresa:', error);
    throw error;
  }
};

/**
 * Remove uma empresa pelo seu ID
 */
export const deleteEmpresa = (id: string): void => {
  try {
    const empresas = getAllEmpresas();
    const updatedEmpresas = empresas.filter((emp) => emp.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmpresas));
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    throw error;
  }
};

/**
 * Obtém todas as notas fiscais de uma empresa
 */
export const getNotasFiscaisByEmpresa = (empresaId: string): NotaFiscal[] => {
  try {
    const empresa = getEmpresaById(empresaId);
    return empresa?.notasFiscais || [];
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error);
    return [];
  }
};

/**
 * Cria uma nova nota fiscal para uma empresa
 */
export const createNotaFiscal = (data: Omit<NotaFiscal, 'id'>): NotaFiscal => {
  try {
    const empresas = getAllEmpresas();
    const empresaIndex = empresas.findIndex((emp) => emp.id === data.empresaId);
    
    if (empresaIndex === -1) {
      throw new Error('Empresa não encontrada');
    }

    const novaNota = {
      ...data,
      id: crypto.randomUUID(),
    };

    if (!empresas[empresaIndex].notasFiscais) {
      empresas[empresaIndex].notasFiscais = [];
    }

    empresas[empresaIndex].notasFiscais.push(novaNota);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empresas));
    
    return novaNota;
  } catch (error) {
    console.error('Erro ao cadastrar nota fiscal:', error);
    throw error;
  }
};

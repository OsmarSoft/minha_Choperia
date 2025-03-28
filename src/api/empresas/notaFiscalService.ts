
import { NotaFiscal } from "../../types/tipo";
import { getEmpresaById, atualizarEmpresa } from "./empresaService";

// Function to get all invoices for a company
export const getNotasFiscaisByEmpresa = async (empresaId: string): Promise<NotaFiscal[]> => {
  const empresa = await getEmpresaById(empresaId);
  return empresa?.notasFiscais || [];
};

// Function to get a single invoice by id
export const getNotaFiscalById = async (empresaId: string, notaId: string): Promise<NotaFiscal | null> => {
  const notas = await getNotasFiscaisByEmpresa(empresaId);
  return notas.find(nota => nota.id === notaId) || null;
};

// Function to save a new invoice
export const salvarNotaFiscal = async (empresaId: string, notaFiscal: Omit<NotaFiscal, 'id' | 'empresaId'>): Promise<NotaFiscal> => {
  const empresa = await getEmpresaById(empresaId);
  
  if (!empresa) {
    throw new Error(`Empresa com ID ${empresaId} não encontrada`);
  }
  
  const newNotaFiscal: NotaFiscal = {
    ...notaFiscal,
    id: `nf_${Date.now()}`,
    empresaId
  };
  
  const notasFiscais = [...(empresa.notasFiscais || []), newNotaFiscal];
  
  await atualizarEmpresa(empresaId, { notasFiscais });
  
  return newNotaFiscal;
};

// Function to create a new invoice (alias for salvarNotaFiscal)
export const createNotaFiscal = salvarNotaFiscal;

// Function to update an existing invoice
export const atualizarNotaFiscal = async (
  empresaId: string, 
  notaId: string, 
  dadosAtualizados: Partial<NotaFiscal>
): Promise<NotaFiscal | null> => {
  const empresa = await getEmpresaById(empresaId);
  
  if (!empresa || !empresa.notasFiscais) {
    return null;
  }
  
  const notaIndex = empresa.notasFiscais.findIndex(nota => nota.id === notaId);
  
  if (notaIndex === -1) {
    return null;
  }
  
  const notaAtualizada = {
    ...empresa.notasFiscais[notaIndex],
    ...dadosAtualizados
  };
  
  const notasFiscaisAtualizadas = [...empresa.notasFiscais];
  notasFiscaisAtualizadas[notaIndex] = notaAtualizada;
  
  await atualizarEmpresa(empresaId, { notasFiscais: notasFiscaisAtualizadas });
  
  return notaAtualizada;
};

// Function to delete an invoice
export const deletarNotaFiscal = async (empresaId: string, notaId: string): Promise<boolean> => {
  const empresa = await getEmpresaById(empresaId);
  
  if (!empresa || !empresa.notasFiscais) {
    return false;
  }
  
  const notasFiscaisAtualizadas = empresa.notasFiscais.filter(nota => nota.id !== notaId);
  
  if (notasFiscaisAtualizadas.length === empresa.notasFiscais.length) {
    return false;
  }
  
  await atualizarEmpresa(empresaId, { notasFiscais: notasFiscaisAtualizadas });
  
  return true;
};

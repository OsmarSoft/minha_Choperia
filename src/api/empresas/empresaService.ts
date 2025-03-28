
import { Empresa, NotaFiscal } from "@/types/tipo";
import { 
  getEmpresasFromStorage, 
  salvarEmpresaNoStorage, 
  atualizarEmpresaNoStorage, 
  deletarEmpresaDoStorage,
  getAllEmpresas as getAllEmpresasStorage
} from "../../data/empresa_storage";

// Function to get all companies
export const getEmpresas = async (): Promise<Empresa[]> => {
  return getEmpresasFromStorage();
};

// Alias for compatibility with existing code
export const getAllEmpresas = getEmpresas;

// Function to get a single company by id
export const getEmpresaById = async (id: string): Promise<Empresa | null> => {
  const empresas = await getEmpresas();
  return empresas.find(empresa => empresa.id === id) || null;
};

// Function to save a new company
export const salvarEmpresa = async (empresa: Empresa): Promise<Empresa> => {
  return salvarEmpresaNoStorage(empresa);
};

// Alias for compatibility with existing code
export const cadastrarEmpresa = salvarEmpresa;

// Function to update an existing company
export const atualizarEmpresa = async (id: string, dadosAtualizados: Partial<Empresa>): Promise<Empresa | null> => {
  return atualizarEmpresaNoStorage(id, dadosAtualizados);
};

// Function to delete a company
export const deletarEmpresa = async (id: string): Promise<boolean> => {
  return deletarEmpresaDoStorage(id);
};

// Alias for compatibility with existing code
export const deleteEmpresa = deletarEmpresa;

// Function to get invoices for a company
export const getNotasFiscaisByEmpresa = async (empresaId: string): Promise<NotaFiscal[]> => {
  const empresa = await getEmpresaById(empresaId);
  return empresa?.notasFiscais || [];
};

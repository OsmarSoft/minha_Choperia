
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarData(dataString: string | undefined): string {
  if (!dataString) return '';
  try {
    const data = new Date(dataString);
    return format(data, "PPP 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dataString;
  }
}

export function formatarDinheiro(valor: number | undefined): string {
  if (valor === undefined) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Alias for formatarDinheiro to maintain backward compatibility
export const formatCurrency = formatarDinheiro;

export function gerarSlug(texto: string): string {
  return texto
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function truncarTexto(texto: string, tamanho: number): string {
  if (texto.length <= tamanho) return texto;
  return texto.substring(0, tamanho) + '...';
}

// Função para gerar um código único
export function gerarCodigo(prefixo: string = ''): string {
  const timestamp = new Date().getTime().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefixo}${timestamp}${randomStr}`;
}

// Função para remover caracteres especiais de um texto
export function removerCaracteresEspeciais(texto: string): string {
  return texto.replace(/[^\w\s]/gi, '');
}

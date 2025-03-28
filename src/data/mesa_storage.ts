import { Mesa, Item, PedidoItem } from '../types/tipo'; 
import { obterProdutoPorId, decrementarEstoque, incrementarEstoque } from './produto_storage';

const STORAGE_KEY = 'mesas';
const LAST_RESET_DATE_KEY = 'lastResetDate';
const HIGHEST_PEDIDO_KEY = 'highestPedido';

const inicializarMesas = (): Mesa[] => {
  const mesas: Mesa[] = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    nome: String(index + 1).padStart(2, '0'),
    numero: String(index + 1).padStart(2, '0'),
    slug: generateSlug(String(index + 1).padStart(2, '0')),
    ocupada: false,
    empresa: '',
    pedido: 0,
    dataAbertura: '',
    horaAbertura: '',
    items: [],
    pedidos: [],
    status: 'Livre',
    valor_pago: 0,
    pessoas_pagaram: 0,
    numero_pessoas: 1,
    is_available: true
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mesas));
  return mesas;
};

const checkAndResetPedidos = () => {
  const today = new Date().toDateString();
  const lastResetDate = localStorage.getItem(LAST_RESET_DATE_KEY);

  if (lastResetDate !== today) {
    localStorage.setItem(LAST_RESET_DATE_KEY, today);
    localStorage.setItem(HIGHEST_PEDIDO_KEY, '0');
  }
};

const getNextPedidoNumber = (): number => {
  checkAndResetPedidos();
  const currentHighest = parseInt(localStorage.getItem(HIGHEST_PEDIDO_KEY) || '0');
  const nextNumber = currentHighest + 1;
  localStorage.setItem(HIGHEST_PEDIDO_KEY, nextNumber.toString());
  return nextNumber;
};

const generateSlug = (nome: string): string => {
  return `mesa-${nome.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}`;
};

export const getAllMesas = (): Mesa[] => {
  const mesasStorage = localStorage.getItem(STORAGE_KEY);
  if (!mesasStorage) {
    return inicializarMesas();
  }
  const mesas = JSON.parse(mesasStorage);
  if (mesas.length === 0) {
    return inicializarMesas();
  }
  return mesas;
};

export const getMesaBySlug = (slug: string): Mesa | undefined => {
  const mesas = getAllMesas();
  return mesas.find(mesa => mesa.slug === slug);
};

export const salvarMesa = (mesa: Omit<Mesa, 'id'>): Mesa => {
  const mesasAtuais = getAllMesas();
  const novaMesa: Mesa = {
    ...mesa,
    id: Math.max(...mesasAtuais.map(m => m.id), 0) + 1,
    items: [],
    pedidos: [],
    slug: generateSlug(mesa.nome),
    numero: mesa.nome,
    valor_pago: 0,
    pessoas_pagaram: 0,
    numero_pessoas: 1,
    is_available: true
  };
  mesasAtuais.push(novaMesa);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mesasAtuais));
  return novaMesa;
};

export const atualizarMesa = (slug: string, mesaData: Partial<Mesa>): void => {
  const mesasAtuais = getAllMesas();
  const index = mesasAtuais.findIndex(m => m.slug === slug);
  if (index !== -1) {
    mesasAtuais[index] = { ...mesasAtuais[index], ...mesaData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mesasAtuais));
  }
};

export const adicionarItemMesa = (mesaSlug: string, item: Item): void => {
  const mesasAtuais = getAllMesas();
  const index = mesasAtuais.findIndex(m => m.slug === mesaSlug);
  
  if (index !== -1) {
    if (!mesasAtuais[index].items) {
      mesasAtuais[index].items = [];
    }
    
    if (!mesasAtuais[index].ocupada || mesasAtuais[index].pedido === 0) {
      mesasAtuais[index].pedido = getNextPedidoNumber();
      mesasAtuais[index].ocupada = true;
      const now = new Date();
      mesasAtuais[index].dataAbertura = now.toLocaleDateString();
      mesasAtuais[index].horaAbertura = now.toLocaleTimeString();
    }
    
    // Check if item already exists in the table
    const existingItemIndex = mesasAtuais[index].items?.findIndex(i => i.slug === item.slug);
    
    if (existingItemIndex !== -1 && existingItemIndex !== undefined) {
      const existingItem = mesasAtuais[index].items[existingItemIndex];
      const newQuantidade = existingItem.quantidade + item.quantidade;
      const newTotal = existingItem.precoUnitario * newQuantidade;
    
      mesasAtuais[index].items[existingItemIndex] = {
        ...existingItem,
        quantidade: newQuantidade,
        total: newTotal
      };
    } else {
      const pedidoItem: PedidoItem = {
        ...item,
        precoUnitario: item.preco // Supondo que `preco` em `Item` corresponde a `precoUnitario`
      };
      mesasAtuais[index].items?.push(pedidoItem);
    }
    
    mesasAtuais[index].status = 'Ocupada';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mesasAtuais));
    
    // Decrement product stock
    decrementarEstoque(item.slug, item.quantidade);
  }
};

export const removerItemMesa = (mesaSlug: string, itemSlug: string): void => {
  const mesasAtuais = getAllMesas();
  const index = mesasAtuais.findIndex(m => m.slug === mesaSlug);
  
  if (index !== -1 && mesasAtuais[index].items) {
    const itemRemovido = mesasAtuais[index].items?.find(item => item.slug === itemSlug);
    if (itemRemovido) {
      incrementarEstoque(itemRemovido.slug, itemRemovido.quantidade);
    }
    
    mesasAtuais[index].items = mesasAtuais[index].items?.filter(item => item.slug !== itemSlug);
    
    if (mesasAtuais[index].items.length === 0) {
      mesasAtuais[index].ocupada = false;
      mesasAtuais[index].status = 'Livre';
      mesasAtuais[index].pedido = 0;
      mesasAtuais[index].dataAbertura = '';
      mesasAtuais[index].horaAbertura = '';
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mesasAtuais));
  }
};

export const cancelarPedido = (mesaSlug: string): void => {
  const mesasAtuais = getAllMesas();
  const index = mesasAtuais.findIndex(m => m.slug === mesaSlug);
  
  if (index !== -1 && mesasAtuais[index].items) {
    // Return all items to stock
    mesasAtuais[index].items?.forEach(item => {
      incrementarEstoque(item.slug, item.quantidade);
    });
    
    // Clear mesa items and reset status
    mesasAtuais[index].items = [];
    mesasAtuais[index].ocupada = false;
    mesasAtuais[index].status = 'Livre';
    mesasAtuais[index].pedido = 0;
    mesasAtuais[index].dataAbertura = '';
    mesasAtuais[index].horaAbertura = '';
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mesasAtuais));
  }
};

export const confirmarPagamento = (mesaSlug: string): void => {
  const mesasAtuais = getAllMesas();
  const index = mesasAtuais.findIndex(m => m.slug === mesaSlug);
  
  if (index !== -1 && mesasAtuais[index].items) {    
    // Clear mesa items and reset status
    mesasAtuais[index].items = [];
    mesasAtuais[index].ocupada = false;
    mesasAtuais[index].status = 'Livre';
    mesasAtuais[index].pedido = 0;
    mesasAtuais[index].dataAbertura = '';
    mesasAtuais[index].horaAbertura = '';
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mesasAtuais));
  }
};

export const deleteMesa = (slug: string): void => {
  const mesasAtuais = getAllMesas();
  const mesasAtualizadas = mesasAtuais.filter(m => m.slug !== slug);
  if (mesasAtualizadas.length === 0) {
    inicializarMesas();
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mesasAtualizadas));
  }
};

export const limparMesas = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

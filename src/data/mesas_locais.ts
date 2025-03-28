
import { Mesa } from '../types/tipo';

// Create basic dummy data objects with required fields for local testing
export const mesasLocais: Mesa[] = [
  {
    id: 1,
    nome: 'Mesa 1',
    slug: 'mesa-1',
    ocupada: false,
    pedido: 0,
    dataAbertura: '2023-04-01',
    horaAbertura: '10:00',
    items: [],
    status: 'Livre',
    empresa: "1", // Corrigido para string
    pedidos: [],
    valor_pago: 0,
    pessoas_pagaram: 0,
    valor_total: 0,
    em_preparo: false
  },
  {
    id: 2,
    nome: 'Mesa 2',
    slug: 'mesa-2',
    ocupada: false,
    pedido: 0,
    dataAbertura: '2023-04-01',
    horaAbertura: '10:15',
    items: [],
    status: 'Livre',
    empresa: "1", // Corrigido para string
    pedidos: [],
    valor_pago: 0,
    pessoas_pagaram: 0,
    valor_total: 0,
    em_preparo: false
  },
  {
    id: 3,
    nome: 'Mesa 3',
    slug: 'mesa-3',
    ocupada: false,
    pedido: 0,
    dataAbertura: '2023-04-01',
    horaAbertura: '10:30',
    items: [],
    status: 'Livre',
    empresa: "1", // Corrigido para string
    pedidos: [],
    valor_pago: 0,
    pessoas_pagaram: 0,
    valor_total: 0,
    em_preparo: false
  },
  {
    id: 4,
    nome: 'Mesa 4',
    slug: 'mesa-4',
    ocupada: false,
    pedido: 0,
    dataAbertura: '2023-04-01',
    horaAbertura: '10:45',
    items: [],
    status: 'Livre',
    empresa: "1", // Corrigido para string
    pedidos: [],
    valor_pago: 0,
    pessoas_pagaram: 0,
    valor_total: 0,
    em_preparo: false
  },
];

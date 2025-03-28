// src\pages\loja_fisica\Index.tsx
import { useAuth } from '@/components/auth/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Users, Clipboard, PackageOpen, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllProdutos } from '@/api/produtos/produtoService';
import { getAllMesas } from '@/api/mesas/mesaService';

const LojaFisicaIndex = () => {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState(0);
  const [mesasOcupadas, setMesasOcupadas] = useState('0 / 0');
  const [itensEstoque, setItensEstoque] = useState(0);
  const [produtosBaixos, setProdutosBaixos] = useState([]);
  const [mesasAtivas, setMesasAtivas] = useState([]);
  const [percentualOcupacao, setPercentualOcupacao] = useState(0);
  const [produtosComTempo, setProdutosComTempo] = useState([]);
  const [produtosEmEstoqueComTempo, setProdutosEmEstoqueComTempo] = useState([]);


  const calcularTempoAdicionado = (dataCriacao) => {
    const dataFormatada = new Date(dataCriacao); // ✅ Converte a data para o formato Date
    const agora = new Date();
    const diferencaEmMilissegundos = agora.getTime() - dataFormatada.getTime(); // ✅ Correto agora!
    const diferencaEmDias = Math.floor(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));
  
    if (diferencaEmDias === 0) return 'hoje';
    if (diferencaEmDias === 1) return 'há 1 dia';
    if (diferencaEmDias < 7) return `há ${diferencaEmDias} dias`;
    if (diferencaEmDias < 14) return 'há 1 semana';
    if (diferencaEmDias < 21) return 'há 2 semanas';
    if (diferencaEmDias < 28) return 'há 3 semanas';
    if (diferencaEmDias < 365) return 'há um mês';
    return 'há um ano ou mais';
  };

  const agruparPorTempo = (produtos) => {
    return produtos.reduce((acc, produto) => {
      const tempo = produto.tempoAdicionado;
  
      if (!acc[tempo]) {
        acc[tempo] = 1; // Se o tempo ainda não existe, inicializa com 1
      } else {
        acc[tempo] += 1; // Se o tempo já existe, incrementa
      }
  
      return acc;
    }, {});
  };    

  useEffect(() => {
    const fetchData = async () => {
      try {
        const produtosData = await getAllProdutos();
        setProdutos(produtosData.length);

        const mesasData = await getAllMesas();
        const mesasOcupadasCount = mesasData.filter(mesa => mesa.status ==='Ocupada').length;
        setMesasOcupadas(`${mesasOcupadasCount} / ${mesasData.length}`);

        const percentual = (mesasOcupadasCount / mesasData.length) * 100;
        setPercentualOcupacao(Math.round(percentual));

        const itensEstoqueCount = produtosData.filter(produto => produto.estoque > 0).length;
        setItensEstoque(itensEstoqueCount);

        const produtosBaixosData = produtosData.filter(produto => produto.estoque < 10);
        setProdutosBaixos(produtosBaixosData);

        const mesasAtivasData = mesasData.filter(mesa => mesa.status === 'Ocupada');
        setMesasAtivas(mesasAtivasData);

        try {
          const produtosData = await getAllProdutos();
    
          const produtosComTempo = produtosData.map(produto => ({
            ...produto,
            tempoAdicionado: calcularTempoAdicionado(produto.created) 
          }));
    
          setProdutosComTempo(produtosComTempo);

          // 🔥 Filtra apenas produtos em estoque e calcula tempo
          const produtosEmEstoque = produtosComTempo.filter(produto => produto.estoque > 0);
          setProdutosEmEstoqueComTempo(produtosEmEstoque);
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-16 text-center">
        <h1 className="text-2xl font-bold text-brewery-dark-brown mb-2">
          Bem-vindo ao Dashboard da Loja Física
        </h1>
        <p className="text-gray-600">
          Olá {user?.name}, aqui você pode gerenciar todos os aspectos da loja física.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-brewery-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos}</div>
            
            <div className="max-h-32 overflow-y-auto space-y-1"> 
              {Object.entries(agruparPorTempo(produtosComTempo)).map(([tempo, quantidade]) => (
                <p key={tempo} className="text-xs text-gray-500">
                  {String(quantidade)} {'adicionado'} {tempo}
                </p>
              ))}
            </div>
          </CardContent>

        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
              <Users className="h-4 w-4 text-brewery-amber" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-500">+1 adicionado este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mesas Ocupadas</CardTitle>
            <Clipboard className="h-4 w-4 text-brewery-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mesasOcupadas}</div>
            <p className="text-xs text-gray-500">{percentualOcupacao}% de ocupação</p>
          </CardContent>
        </Card>
        
        {/* 📦 Card de Itens em Estoque */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Itens em Estoque</CardTitle>
            <PackageOpen className="h-4 w-4 text-brewery-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itensEstoque}</div>
            <div className="max-h-32 overflow-y-auto space-y-1"> 
              {Object.entries(agruparPorTempo(produtosEmEstoqueComTempo)).map(([tempo, quantidade]) => (
                <p key={tempo} className="text-xs text-gray-500">
                  {String(quantidade)} {'disponível'} {tempo}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Produtos com Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {produtosBaixos.map((produto) => (
                <div key={produto.nome} className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                  <span>{produto.nome}</span>
                  <span className="ml-auto text-sm text-red-500 font-medium">{produto.estoque}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Mesas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mesasAtivas.map((mesa) => (
                <div key={mesa.nome} className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                  <span>{mesa.slug.charAt(0).toUpperCase() + mesa.slug.slice(1)}</span>
                  <span className="ml-auto text-sm text-gray-500">{mesa.tempo}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LojaFisicaIndex;

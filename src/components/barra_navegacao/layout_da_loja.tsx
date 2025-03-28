
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Clock, Heart, Star, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFavoritos } from '@/components/loja/favoritosApi';
import { useCarrinho } from '@/components/loja/carrinhoApi';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import CarrinhoDrawer from '@/components/loja/CarrinhoDrawer';

interface LayoutDaLojaProps {
  children: ReactNode;
}

const LayoutDaLoja: React.FC<LayoutDaLojaProps> = ({ children }) => {
  const location = useLocation();
  const { quantidadeItens } = useCarrinho();
  const { favoritos } = useFavoritos();

  const menuItems = [
    { label: 'Produtos', path: '/produtos', icon: <ShoppingBag size={20} /> },
    { label: 'Histórico', path: '/historico', icon: <Clock size={20} /> },
    { label: 'Favoritos', path: '/favoritos', icon: <Heart size={20} />, count: favoritos.length },
    { label: 'Avaliações', path: '/avaliacoes', icon: <Star size={20} /> },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <div className="px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-brewery-dark-brown">Loja Online</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Menu de navegação */}
          <aside className="w-full sm:w-52 lg:w-64 flex-shrink-0">
            <nav className="space-y-1 bg-white rounded-lg shadow p-3">
              <div className="pb-2 mb-2 border-b border-gray-100">
                <Link 
                  to="/loja" 
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/loja') ? 'bg-brewery-amber/10 text-brewery-amber' : 'text-gray-600 hover:bg-brewery-amber/5 hover:text-brewery-amber'
                  }`}
                >
                  <ShoppingBag className="mr-3" size={20} />
                  Minha Loja
                </Link>
              </div>
              
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path) ? 'bg-brewery-amber/10 text-brewery-amber' : 'text-gray-600 hover:bg-brewery-amber/5 hover:text-brewery-amber'
                  }`}
                >
                  <span className="flex items-center">
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </span>
                  {item.count !== undefined && item.count > 0 && (
                    <Badge variant="outline" className="h-5 min-w-5 px-1.5 flex items-center justify-center">
                      {item.count}
                    </Badge>
                  )}
                </Link>
              ))}
              
              <div className="pt-2 mt-2 border-t border-gray-100">
                <Link 
                  to="/checkout" 
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/checkout') ? 'bg-brewery-amber text-white' : 'bg-brewery-amber/80 text-white hover:bg-brewery-amber'
                  }`}
                >
                  <ShoppingCart className="mr-3" size={20} />
                  Finalizar Compra
                </Link>
              </div>
            </nav>
          </aside>
          
          {/* Conteúdo principal */}
          <div className="flex-grow bg-white rounded-lg shadow p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutDaLoja;

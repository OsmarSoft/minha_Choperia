
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Layers, ShoppingBag, Users, Package, ClipboardList, LayoutList, Store, LogOut, Menu, X, ShoppingCart } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const LayoutLojaFisica = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso",
    });
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', icon: <Layers className="w-5 h-5 mr-2" />, path: '/loja-fisica' },
    { label: 'Produtos', icon: <ShoppingBag className="w-5 h-5 mr-2" />, path: '/loja-fisica/produtos' },
    { label: 'Fornecedores', icon: <Users className="w-5 h-5 mr-2" />, path: '/loja-fisica/empresas' },
    { label: 'Estoque', icon: <Package className="w-5 h-5 mr-2" />, path: '/loja-fisica/estoque' },
    { label: 'Mesas', icon: <ClipboardList className="w-5 h-5 mr-2" />, path: '/loja-fisica/mesas' },
    { label: 'Categorias', icon: <LayoutList className="w-5 h-5 mr-2" />, path: '/loja-fisica/categorias' },
    { label: 'Pedidos Online', icon: <ShoppingCart className="w-5 h-5 mr-2" />, path: '/loja-fisica/pedidos-online' },
    { label: 'Pedidos na Loja', icon: <ClipboardList className="w-5 h-5 mr-2" />, path: '/loja-fisica/pedidos-recebidos' },
  ];

  const NavItem = ({ item }: { item: typeof navItems[0] }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center py-2 px-3 rounded-md transition-colors ${
          isActive
            ? 'bg-brewery-amber text-white font-medium'
            : 'text-brewery-brown hover:bg-brewery-amber/10'
        }`
      }
      onClick={() => setSheetOpen(false)}
      end={item.path === '/loja-fisica'}
    >
      {item.icon}
      {item.label}
    </NavLink>
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="flex items-center mb-6 mt-2">
          <Store className="h-8 w-8 text-brewery-amber mr-2" />
          <h2 className="text-xl font-bold text-brewery-dark-brown">Loja Física</h2>
        </div>
        
        <nav className="space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>
        
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center mb-4 p-2 rounded-md">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback className="bg-brewery-amber text-white">
                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-brewery-dark-brown truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'usuario@email.com'}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>
      
      {/* Mobile Sidebar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden fixed top-[4.5rem] left-4 z-50 bg-white/90 shadow-md hover:bg-white"
          >
            <Menu className="h-5 w-5 text-brewery-dark-brown" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-[85vw] max-w-xs">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <Store className="h-6 w-6 text-brewery-amber mr-2" />
              <h2 className="text-lg font-bold text-brewery-dark-brown">Loja Física</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSheetOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4 p-2 rounded-md">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback className="bg-brewery-amber text-white">
                  {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-brewery-dark-brown truncate">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'usuario@email.com'}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 pt-6 md:pt-4">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutLojaFisica;

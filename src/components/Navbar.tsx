
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Beer, UserCircle, ShoppingBag, Home, LogOut, Store } from 'lucide-react';
import { useAuth } from '@/components/auth/useAuth';
import { Button } from './ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Início', path: '/', icon: <Home size={18} className="mr-2" /> },
    { name: 'Menu', path: '/menu', icon: <ShoppingBag size={18} className="mr-2" /> },
    { name: 'Sobre', path: '/sobre', icon: <Beer size={18} className="mr-2" /> },
    { name: 'Contato', path: '/contato', icon: <UserCircle size={18} className="mr-2" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-brewery-dark/90 backdrop-blur-md shadow-md py-2'
          : 'bg-transparent py-3 md:py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Beer className="h-7 w-7 md:h-8 md:w-8 text-brewery-amber mr-2" />
            <span className="text-lg md:text-xl font-brewery font-bold text-brewery-dark dark:text-white">
              Choperia
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}

            {/* Authentication links */}
            {user ? (
              <div className="flex items-center gap-3 md:gap-4">
                {user.userType === 'physical' && (
                  <Link to="/loja-fisica" className="btn-primary text-sm md:text-base whitespace-nowrap">
                    Área da Loja
                  </Link>
                )}
                {user.userType === 'online' && (
                  <Link to="/loja" className="btn-primary text-sm md:text-base whitespace-nowrap">
                    Minha Conta
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-brewery-brown text-brewery-brown hover:bg-red-600 hover:text-white flex items-center justify-center"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="md:mr-2" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-outline text-sm md:text-base">
                  Entrar
                </Link>
                <Link to="/register" className="btn-primary text-sm md:text-base">
                  Cadastrar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-brewery-dark dark:text-white p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-brewery-dark shadow-md overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`py-2 px-3 rounded-md flex items-center nav-link ${
                    isActive(link.path) ? 'active bg-brewery-amber/10' : ''
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              
              {/* Authentication links for mobile */}
              {user ? (
                <>
                  <div className="pt-2 border-t border-brewery-brown/20">
                    <div className="flex items-center gap-2 mb-3 px-3 py-2">
                      <UserCircle className="h-5 w-5 text-brewery-amber" />
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    {user.userType === 'physical' && (
                      <Link to="/loja-fisica" className="btn-primary w-full mb-2 text-center flex items-center justify-center">
                        <Store size={18} className="mr-2" />
                        Área da Loja
                      </Link>
                    )}
                    {user.userType === 'online' && (
                      <Link to="/loja" className="btn-primary w-full mb-2 text-center flex items-center justify-center">
                        <ShoppingBag size={18} className="mr-2" />
                        Minha Conta
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      className="w-full border-brewery-brown text-brewery-brown hover:bg-red-600 hover:text-white flex items-center justify-center"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} className="mr-2" />
                      Sair
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-brewery-brown/20">
                  <Link to="/login" className="btn-outline text-center">
                    Entrar
                  </Link>
                  <Link to="/register" className="btn-primary text-center">
                    Cadastrar
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

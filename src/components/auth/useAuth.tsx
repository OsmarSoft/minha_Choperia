import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/usuario';
import { 
  login as loginService, 
  register as registerService,
  logout as logoutService,
  getUser as getUserService,
  isAuthenticated
} from '@/api/usuarios/usuarioService';

interface LoginResult {
  success: boolean;
  userType?: 'physical' | 'online';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (nome: string, email: string, password: string, userType: 'physical' | 'online') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: () => Promise<boolean>; // Atualizado para Promise<boolean>
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Inicia como true para refletir o carregamento inicial

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      console.log('AuthProvider: Token encontrado no localStorage:', token);
      if (!token) {
        console.log('AuthProvider: Nenhum token encontrado, usuário não autenticado.');
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getUserService();
        console.log('AuthProvider: Usuário carregado do backend:', currentUser);
        if (currentUser) {
          setUser(currentUser);
        } else {
          console.log('AuthProvider: Nenhum usuário retornado, limpando estado.');
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthProvider: Erro ao carregar usuário:', error);
        localStorage.removeItem('token'); // Remove token inválido
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const userData = await loginService(email, password);
      console.log('AuthProvider: Login bem-sucedido, dados:', userData);
      if (userData.token) {
        localStorage.setItem('token', userData.token);
        setUser(userData);
        return {
          success: true,
          userType: userData.userType || userData.user_type as ('physical' | 'online') || 'online',
        };
      }
      throw new Error('Token não retornado');
    } catch (error) {
      console.error('AuthProvider: Erro no login:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, userType: 'physical' | 'online'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userData = await registerService(name, email, password, userType);
      console.log('AuthProvider: Registro bem-sucedido, dados:', userData);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('AuthProvider: Erro no registro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('AuthProvider: Executando logout, usuário antes:', user);
    logoutService();
    localStorage.removeItem('token');
    setUser(null);
    console.log('AuthProvider: Logout concluído');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoading,
      isAuthenticated: () => isAuthenticated() 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
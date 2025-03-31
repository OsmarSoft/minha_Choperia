import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types/usuario';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const userData: User = {
        id: '1',
        name: 'Usuário Exemplo',
        email,
        userType: 'online',
        slug: 'usuario-exemplo',
      };
      console.log('AuthProvider: Login bem-sucedido, dados:', userData);
      setUser(userData);
      return { success: true, userType: userData.userType };
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
      const userData: User = {
        id: '2',
        name,
        email,
        userType,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      };
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
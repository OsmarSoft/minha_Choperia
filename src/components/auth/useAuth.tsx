
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
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if the user is already authenticated when the app loads
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await getUserService();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error loading user:", error);
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
      if (userData.token) {
        localStorage.setItem('token', userData.token); // Salva o token no localStorage
      }
      setUser(userData);
      setIsLoading(false);
      return {
        success: true,
        userType: userData.userType || userData.user_type as ('physical' | 'online') || 'online',
      };
    } catch (error) {
      setIsLoading(false);
      console.error("Login error:", error);
      return {
        success: false,
      };
    }
  };

  const register = async (name: string, email: string, password: string, userType: 'physical' | 'online'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userData = await registerService(name, email, password, userType);
      setUser(userData);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
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



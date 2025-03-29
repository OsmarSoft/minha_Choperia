import axios from 'axios';
import { API_URL } from '../../config/api';
import { User, UserType, DjangoUserResponse } from '@/types/usuario';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to localStorage when user logs in
const setToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('auth_token');
};

// Remove token from localStorage when user logs out
const removeToken = () => {
  localStorage.removeItem('auth_token');
};

//  interceptor no Axios para lidar com erros 401 Unauthorized
/*
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken(); // Remove o token inválido
      window.location.href = '/login'; // Redireciona para a página de login
    }
    return Promise.reject(error);
  }
);
*/

// Add token to request headers
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string): Promise<User> => {
  try {
    console.log('Tentando fazer login com:', email, password);
    
    // Use the correct endpoint that matches the Django URLs
    const response = await api.post('/login/', { email, password });
    
    // Adjust to match your Django response format
    const userData = response.data as DjangoUserResponse;
    
    if (!userData) {
      throw new Error('Credenciais inválidas');
    }
    
    // Store token if it's included in the response
    if (userData.token) {
      setToken(userData.token); // Salva o token no localStorage
    }
    
    // Map the Django user response to our User interface
    const user: User = {
      id: userData.id || userData.user || '',
      email: email, // Django doesn't return email in serializer
      name: userData.name || '',
      userType: userData.user_type as UserType || 'online',
      slug: userData.slug || '',
      token: userData.token,
      // Keep other Django fields
      user: userData.user,
      user_type: userData.user_type,
      ativo: userData.ativo,
      is_available: userData.is_available,
      created: userData.created,
      updated: userData.updated
    };
    
    toast.success("Login realizado com sucesso!", {
      description: `Bem-vindo(a), ${user.name}!`,
    });
    
    return user;
  } catch (error: any) {
    console.error('Erro ao fazer login:', error.response?.data);
    toast.error("Erro ao fazer login", {
      description: error.response?.data?.detail || "Ocorreu um erro inesperado",
    });
    throw error;
  }
};

export const register = async (
  name: string, 
  email: string, 
  password: string, 
  user_type: UserType = 'online'
): Promise<User> => {
  try {
    console.log('Registrando usuário:', name, email, password, user_type);
    const response = await api.post('/usuarios/', { name, email, password, user_type });
    const userData = response.data as DjangoUserResponse;
    
    // Store token if it's included in the response
    if (userData.token) {
      setToken(userData.token);
    }
    
    // Map the Django user response to our User interface
    const user: User = {
      id: userData.id || userData.user || '',
      email: email, // Using the email provided in the request
      name: userData.name || '',
      userType: userData.user_type as UserType || user_type,
      slug: userData.slug || '',
      token: userData.token,
      // Keep other Django fields
      user: userData.user,
      user_type: userData.user_type,
      ativo: userData.ativo,
      is_available: userData.is_available,
      created: userData.created,
      updated: userData.updated
    };
    
    toast.success("Cadastro realizado com sucesso!", {
      description: "Sua conta foi criada.",
    });
    
    return user;
  } catch (error: any) {
    console.error('Erro ao cadastrar:', error.response?.data);
    toast.error("Erro ao cadastrar", {
      description: error.response?.data?.detail || "Ocorreu um erro inesperado",
    });
    throw error;
  }
};

export const logout = (): void => {
  removeToken();
  toast.success("Logout realizado com sucesso!", {
    description: "Até logo!",
  });
};

export const getUser = async (): Promise<User | null> => {
  try {
    const token = getToken();
    if (!token) return null;
    
    const response = await api.get('/usuarios/me/');
    const userData = response.data as DjangoUserResponse;
    
    // Map the Django user response to our User interface
    return {
      id: userData.id || userData.user || '',
      email: '', // API doesn't return email, we'd need to get it from another source
      name: userData.name || '',
      userType: userData.user_type as UserType || 'online',
      slug: userData.slug || '',
      token: token,
      // Keep other Django fields
      user: userData.user,
      user_type: userData.user_type,
      ativo: userData.ativo,
      is_available: userData.is_available,
      created: userData.created,
      updated: userData.updated
    };
  } catch (error: any) {
    console.error('Erro ao buscar usuário atual:', error.response?.data);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/usuarios/');
    
    // Check if response is an array
    if (!Array.isArray(response.data)) {
      throw new Error("Dados inválidos retornados pela API");
    }
    
    // Map each user object to our User interface
    return response.data.map((userData: DjangoUserResponse) => ({
      id: userData.id || userData.user || '',
      email: '', // API doesn't return email
      name: userData.name || '',
      userType: userData.user_type as UserType || 'online',
      slug: userData.slug || '',
      // Keep other Django fields
      user: userData.user,
      user_type: userData.user_type,
      ativo: userData.ativo,
      is_available: userData.is_available,
      created: userData.created,
      updated: userData.updated
    }));
  } catch (error: any) {
    console.error('Erro ao buscar todos os usuários:', error);
    throw error;
  }
};

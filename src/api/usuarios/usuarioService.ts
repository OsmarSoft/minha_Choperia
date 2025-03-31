import axios from 'axios';
import { API_URL } from '../../config/api';
import { User, UserType, DjangoUserResponse, LoginResponse, GetUserResponse } from '@/types/usuario';
import { toast } from 'sonner';

interface TokenResponse {
  access: string;
  refresh: string;
}

const api = axios.create({
  baseURL: API_URL,
});

// Adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    console.log('Token no interceptor:', token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Lidar com expiração do token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post<TokenResponse>(`${API_URL}/api/token/refresh/`, { refresh: refreshToken });
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Falha ao atualizar token:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post<TokenResponse>('/api/token/', { username: email, password });
    const { access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    console.log('Token armazenado:', access);
    localStorage.setItem('refresh_token', refresh);

    // Obter dados do usuário (assumindo um endpoint como /get-user/)
    const userResponse = await api.get<GetUserResponse>('/get-user/');
    const userData = userResponse.data.user;

    const user: User = {
      id: userData.id || '',
      email: userData.email || email,
      name: userData.name || '',
      userType: (userData.user_type as UserType) || 'online',
      slug: userData.slug || '',
      ativo: userData.ativo || true,
      is_available: userData.is_available || false,
      created: userData.created || '',
      updated: userData.updated || '',
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
  user_type: UserType,
): Promise<User> => {
  try {
    const response = await api.post('/usuarios/', { name, email, password, user_type });
    const userData = response.data as DjangoUserResponse;

    const user: User = {
      id: userData.id || '',
      email: email,
      name: userData.name || '',
      userType: (userData.user_type as UserType) || user_type,
      slug: userData.slug || '',
      ativo: userData.ativo || true,
      is_available: userData.is_available || false,
      created: userData.created || '',
      updated: userData.updated || '',
    };

    toast.success("Cadastro realizado com sucesso!", {
      description: "Sua conta foi criada.",
    });

    return await login(email, password); // Login automático
  } catch (error: any) {
    console.error('Erro ao cadastrar:', error.response?.data);
    toast.error("Erro ao cadastrar", {
      description: error.response?.data?.detail || "Ocorreu um erro inesperado",
    });
    throw error;
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const response = await api.get<GetUserResponse>('/get-user/');
    const userData = response.data.user;

    if (!userData) return null;

    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      userType: userData.user_type,
      slug: userData.slug,
      ativo: userData.ativo,
      is_available: userData.is_available,
      created: userData.created,
      updated: userData.updated,
    };

    return user;
  } catch (error: any) {
    console.error('Erro ao buscar usuário atual:', error.response?.data);
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  toast.success("Logout realizado com sucesso!", {
    description: "Até logo!",
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/usuarios/');
    if (!Array.isArray(response.data)) {
      throw new Error("Dados inválidos retornados pela API");
    }
    return response.data.map((userData: DjangoUserResponse) => ({
      id: userData.id || userData.user || '',
      email: '',
      name: userData.name || '',
      userType: (userData.user_type as UserType) || 'online',
      slug: userData.slug || '',
      ativo: userData.ativo,
      is_available: userData.is_available,
      created: userData.created,
      updated: userData.updated,
    }));
  } catch (error: any) {
    console.error('Erro ao buscar todos os usuários:', error);
    throw error;
  }
};
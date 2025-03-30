import axios from 'axios';
import { API_URL } from '../../config/api';
import { User, UserType, DjangoUserResponse, LoginResponse, GetUserResponse } from '@/types/usuario';
import { toast } from 'sonner';

let cachedToken: string | null = null;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getToken = async (): Promise<string | null> => {
  if (cachedToken) {
    console.log('Token em cache:', cachedToken);
    return cachedToken;
  }

  try {
    const user = await getUser();
    cachedToken = user?.token || null;
    console.log('Token obtido do backend:', cachedToken);
    return cachedToken;
  } catch (error) {
    console.error('Erro ao obter token:', error);
    return null;
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  try {
    console.log('Tentando fazer  login com:', email, password);
    const response = await api.post<LoginResponse>('/login/', { email, password });
    console.log('Resposta do backend no login:', response.data);

    const userData = response.data.user;

    if (!userData) {
      throw new Error('Dados do usuário não encontrados na resposta');
    }

    const user: User = {
      id: userData.id || userData.user || '',
      email: email,
      name: userData.name || '',
      userType: (userData.user_type as UserType) || 'online',
      slug: userData.slug || '',
      token: userData.token,
      user: userData.user,
      user_type: userData.user_type,
      ativo: userData.ativo,
      is_available: userData.is_available,
      created: userData.created,
      updated: userData.updated,
    };

    cachedToken = user.token;
    console.log('Token armazenado após login:', cachedToken);

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
    console.log('Registrando usuário:', name, email, password, user_type);
    const response = await api.post('/usuarios/', { name, email, password, user_type });
    const userData = response.data as DjangoUserResponse;

    const user: User = {
      id: userData.id || userData.user || '',
      email: email,
      name: userData.name || '',
      userType: (userData.user_type as UserType) || user_type,
      slug: userData.slug || '',
      token: userData.token || null,
      user: userData.user,
      user_type: userData.user_type,
      ativo: userData.ativo,
      is_available: userData.is_available,
      created: userData.created,
      updated: userData.updated,
    };

    toast.success("Cadastro realizado com sucesso!", {
      description: "Sua conta foi criada.",
    });

    const loginResponse = await login(email, password); // Login automático
    return loginResponse;
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
    const response = await api.get<GetUserResponse>('/get-user-token/');
    const { user: userData, access_token } = response.data;

    if (!userData) return null;

    const user: User = {
      id: userData.id || userData.user || '',
      email: userData.email || '',
      name: userData.name || '',
      userType: (userData.user_type as UserType) || 'online',
      slug: userData.slug || '',
      token: access_token,
      user: userData.user,
      user_type: userData.user_type,
      ativo: userData.ativo,
      is_available: userData.is_available,
      created: userData.created,
      updated: userData.updated,
    };

    // Atualizar o cache com o token
    cachedToken = user.token;
    return user;
  } catch (error: any) {
    console.error('Erro ao buscar usuário atual:', error.response?.data);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/logout/');
    cachedToken = null; // Limpar o token do cache
    toast.success("Logout realizado com sucesso!", {
      description: "Até logo!",
    });
  } catch (error: any) {
    console.error('Erro ao fazer logout:', error.response?.data);
    toast.error("Erro ao fazer logout", {
      description: error.response?.data?.detail || "Ocorreu um erro inesperado",
    });
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getUser();
    return !!user;
  } catch (error) {
    return false;
  }
};

// Interceptor para lidar com erros 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      cachedToken = null;
      console.log('401 detectado, token limpo e redirecionando para login');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Adicionar token às requisições usando o cache
api.interceptors.request.use((config) => {
  if (cachedToken) {
    console.log(`Adicionando token ao header para ${config.url}: Bearer ${cachedToken}`);
    config.headers.Authorization = `Bearer ${cachedToken}`;
  } else {
    console.log(`Nenhum token disponível para ${config.url}`);
  }
  return config;
});

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
      user: userData.user,
      user_type: userData.user_type,
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
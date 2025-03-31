export type UserType = "physical" | "online";

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  phone?: string;
  address?: string;
  password?: string; // Only used internally, not exposed to components
  slug: string;
  user?: string; // Reference to Django User model
  user_type?: string; // Backend uses user_type instead of userType
  ativo?: boolean;
  is_available?: boolean;
  created?: string;
  updated?: string;
}

// Ajuste o tipo DjangoUserResponse para incluir email como opcional
export interface DjangoUserResponse {
  id?: string;
  user?: string;
  name?: string;
  email?: string; // Tornando email opcional, já que pode não vir em todos os endpoints
  user_type?: string;
  slug?: string;
  ativo?: boolean;
  is_available?: boolean;
  created?: string;
  updated?: string;
}

export interface LoginResponse {
  user: DjangoUserResponse;
}

export interface GetUserResponse {
  user: {
    id: string;
    email: string;
    name: string;
    user_type: UserType;
    slug: string;
    ativo: boolean;
    is_available: boolean;
    created: string;
    updated: string;
  };
}

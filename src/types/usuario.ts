
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
  token?: string; // Add token for authentication
  user?: string; // Reference to Django User model
  user_type?: string; // Backend uses user_type instead of userType
  ativo?: boolean;
  is_available?: boolean;
  created?: string;
  updated?: string;
}

// Interface to type the Django response
export interface DjangoUserResponse {
  id: string;
  user: string;
  name: string;
  user_type: string;
  ativo: boolean;
  slug: string;
  is_available: boolean;
  created: string;
  updated: string;
  token?: string;
}

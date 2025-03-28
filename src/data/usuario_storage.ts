// src\data\usuario_storage.ts
import { User, UserType } from "../types/usuario";

const USERS_STORAGE_KEY = 'users';
const CURRENT_USER_KEY = 'user';

/**
 * Initialize users in localStorage if they don't exist
 */
export const initializeUsers = (): void => {
  const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
  
  if (!existingUsers) {
    const initialUsers = [
      {
        id: "1",
        name: "Admin",
        email: "admin@choperia.com",
        password: "admin123",
        userType: "physical" as UserType,
        slug: "admin"
      },
      {
        id: "2",
        name: "Cliente",
        email: "cliente@exemplo.com",
        password: "cliente123",
        userType: "online" as UserType,
        slug: "cliente"
      }
    ];
    
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
  }
};

/**
 * Get all users from localStorage
 */
export const getAllUsers = (): User[] => {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  return users ? JSON.parse(users) : [];
};

/**
 * Get current logged in user
 */
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Set current user in localStorage
 */
export const setCurrentUser = (user: User): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

/**
 * Remove current user from localStorage
 */
export const removeCurrentUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * Find user by email and password
 */
export const findUserByCredentials = (email: string, password: string): User | null => {
  const users = getAllUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Create a version of the user without the password
    const { password: _, ...safeUser } = user;
    return safeUser;
  }
  
  return null;
};

/**
 * Add a new user to localStorage
 */
export const addUser = (name: string, email: string, password: string, userType: UserType): User => {
  const users = getAllUsers();
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    throw new Error('Email já cadastrado');
  }
  
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    password,
    userType,
    slug: name.toLowerCase().replace(/ /g, '-')
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  // Return a version of the user without the password
  const { password: _, ...safeUser } = newUser;
  return safeUser;
};


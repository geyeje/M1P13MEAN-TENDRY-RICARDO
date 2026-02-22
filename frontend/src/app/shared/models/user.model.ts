// frontend/src/app/shared/models/user.model.ts

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: 'admin' | 'boutique' | 'acheteur';
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt?: Date;
}

export interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role?: 'admin' | 'boutique' | 'acheteur';
  phone?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
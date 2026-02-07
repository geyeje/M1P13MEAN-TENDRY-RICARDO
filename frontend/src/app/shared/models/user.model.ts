// frontend/src/app/shared/models/user.model.ts

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'boutique' | 'acheteur';
  telephone?: string;
  adresse?: string;
  avatar?: string;
  createdAt?: Date;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role?: 'admin' | 'boutique' | 'acheteur';
  telephone?: string;
  adresse?: string;
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
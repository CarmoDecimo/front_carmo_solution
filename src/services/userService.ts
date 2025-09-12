import { api } from './api';

// Tipos para usuários
export interface User {
  id: string;
  nome: string;
  email: string;
  funcao: 'Administrador' | 'Usuario';
  departamento?: string;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
  ultimo_login?: string;
}

export interface CreateUserRequest {
  nome: string;
  email: string;
  password: string;
  funcao: 'Administrador' | 'Usuario';
  departamento?: string;
}

export interface UpdateUserRequest {
  nome?: string;
  email?: string;
  password?: string;
  funcao?: 'Administrador' | 'Usuario';
  departamento?: string;
  ativo?: boolean;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

class UserService {
  private baseUrl = '/api/auth';

  // Listar todos os usuários com paginação
  async getAll(page = 1, limit = 10, search = ''): Promise<UsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    return api.get<UsersResponse>(`/api/users?${params}`);
  }

  // Listar apenas usuários ativos
  async getAtivos(): Promise<User[]> {
    return api.get<User[]>(`/api/users/ativos`);
  }

  // Buscar usuário por ID
  async getById(id: string): Promise<User> {
    return api.get<User>(`/api/users/${id}`);
  }

  // Criar novo usuário
  async create(data: CreateUserRequest): Promise<User> {
    return api.post<User>(`${this.baseUrl}/register`, data);
  }

  // Atualizar usuário
  async update(id: string, data: UpdateUserRequest): Promise<User> {
    return api.put<User>(`/api/users/${id}`, data);
  }

  // Deletar usuário (soft delete - marca como inativo)
  async delete(id: string): Promise<void> {
    return api.delete(`/api/users/${id}`);
  }

  // Reativar usuário
  async reactivate(id: string): Promise<User> {
    return api.patch<User>(`/api/users/${id}/reactivate`);
  }

  // Resetar senha do usuário
  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    return api.post<{ temporaryPassword: string }>(`/api/users/${id}/reset-password`);
  }

  // Verificar se email já existe
  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    return api.get<{ exists: boolean }>(`/api/users/check-email?email=${encodeURIComponent(email)}`);
  }
}

export const userService = new UserService();

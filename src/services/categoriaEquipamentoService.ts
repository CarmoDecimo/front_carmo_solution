import { api } from './api';

// Tipos para categorias de equipamentos
export interface Categoria {
  categoria_id: number;
  nome: string;
  descricao?: string;
  criado_em: string;
}

export interface CreateCategoriaRequest {
  nome: string;
  descricao?: string;
}

export interface UpdateCategoriaRequest {
  nome?: string;
  descricao?: string;
}

class CategoriaEquipamentoService {
  private baseUrl = '/api/categorias-equipamentos';

  // Listar todas as categorias
  async getAll(): Promise<Categoria[]> {
    const response = await api.get<{ success: boolean; data: Categoria[] }>(`${this.baseUrl}`);
    return response.data;
  }

  // Buscar categoria por ID
  async getById(id: number): Promise<Categoria> {
    const response = await api.get<{ success: boolean; data: Categoria }>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Criar nova categoria
  async create(data: CreateCategoriaRequest): Promise<Categoria> {
    const response = await api.post<{ success: boolean; data: Categoria }>(`${this.baseUrl}`, data);
    return response.data;
  }

  // Atualizar categoria
  async update(id: number, data: UpdateCategoriaRequest): Promise<Categoria> {
    const response = await api.put<{ success: boolean; data: Categoria }>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Deletar categoria
  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}

export const categoriaEquipamentoService = new CategoriaEquipamentoService();

import { api } from './api';

// Interfaces para Equipamentos
export interface Equipamento {
  equipamento_id: number;
  nome: string;
  codigo_ativo: string;
  categoria: string;
  categoria_id: number;
  horimetro_atual: number;
  km_atual?: number;
  status_equipamento: 'ativo' | 'manutencao' | 'parado';
  horas_para_vencer: number;
  alerta_manutencao: boolean;
  ultima_revisao_horimetro: number;
  proxima_revisao_horimetro: number;
  data_ultima_leitura: string;
  ultima_revisao_data?: string;
  intervalo_manutencao: number;
  observacoes?: string;
  centros_custo: Array<{
    centro_custo_id: number;
    nome: string;
    data_associacao: string;
    associacao_ativa?: boolean;
  }>;
  categorias_equipamentos?: {
    categoria_id: number;
    nome: string;
    descricao: string;
  };
}

export interface CreateEquipamentoRequest {
  nome: string;
  codigo_ativo: string;
  categoria_id: number;
  horimetro_atual: number;
  intervalo_manutencao: number;
  status_equipamento: 'ativo' | 'manutencao' | 'parado';
  observacoes?: string;
}

export interface UpdateEquipamentoRequest {
  nome?: string;
  codigo_ativo?: string;
  categoria_id?: number;
  status_equipamento?: 'ativo' | 'manutencao' | 'parado';
  observacoes?: string;
}

export interface UpdateHorimetroRequest {
  horimetro_atual: number;
  data_leitura: string;
  observacoes?: string;
}

export interface RegistrarManutencaoRequest {
  horimetro_manutencao: number;
  data_manutencao: string;
  tipo_revisao: string;
  observacoes?: string;
  novo_intervalo?: number;
}

export interface AssociarCentroCustoRequest {
  centro_custo_id: number;
  data_associacao?: string;
  observacoes?: string;
}

export interface Categoria {
  categoria_id: number;
  nome: string;
  descricao?: string;
}

export interface CategoriasResponse {
  success: boolean;
  data: Categoria[];
  total?: number;
  message?: string;
}

export interface EquipamentosResponse {
  success: boolean;
  data: Equipamento[];
  total: number;
}

export interface EquipamentosFilters {
  categoria_id?: number;
  status_equipamento?: string;
  centro_custo_id?: number;
  alerta_manutencao?: boolean;
}

// Service para equipamentos
export const equipamentosService = {
  // Listar equipamentos com filtros
  getAll: async (filters?: EquipamentosFilters): Promise<Equipamento[]> => {
    const params = new URLSearchParams();
    if (filters?.categoria_id) params.append('categoria_id', filters.categoria_id.toString());
    if (filters?.status_equipamento) params.append('status_equipamento', filters.status_equipamento);
    if (filters?.centro_custo_id) params.append('centro_custo_id', filters.centro_custo_id.toString());
    if (filters?.alerta_manutencao !== undefined) params.append('alerta_manutencao', filters.alerta_manutencao.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/api/equipamentos?${queryString}` : '/api/equipamentos';
    
    const response = await api.get<EquipamentosResponse>(url);
    return response.data;
  },

  // Buscar equipamento por ID
  getById: async (id: number): Promise<Equipamento> => {
    try {
      const response = await api.get<{ success: boolean; data: Equipamento }>(`/api/equipamentos/${id}`);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Equipamento não encontrado ou dados inválidos');
      }
    } catch (error) {
      console.error('Erro no getById do equipamentosService:', error);
      throw error;
    }
  },

  // Criar novo equipamento
  create: async (data: CreateEquipamentoRequest): Promise<Equipamento> => {
    return api.post<Equipamento>('/api/equipamentos', data);
  },

  // Atualizar equipamento
  update: async (id: number, data: UpdateEquipamentoRequest): Promise<Equipamento> => {
    return api.put<Equipamento>(`/api/equipamentos/${id}`, data);
  },

  // Excluir equipamento
  delete: async (id: number): Promise<void> => {
    return api.delete(`/api/equipamentos/${id}`);
  },

  // Atualizar horímetro manualmente
  updateHorimetro: async (id: number, data: UpdateHorimetroRequest): Promise<Equipamento> => {
    return api.put<Equipamento>(`/api/equipamentos/${id}/horimetro`, data);
  },

  // Registrar manutenção
  registrarManutencao: async (id: number, data: RegistrarManutencaoRequest): Promise<Equipamento> => {
    return api.post<Equipamento>(`/api/equipamentos/${id}/manutencao`, data);
  },

  // Listar equipamentos de um centro de custo
  getByCentroCusto: async (centroCustoId: number): Promise<Equipamento[]> => {
    const response = await api.get<EquipamentosResponse>(`/api/equipamentos/centro-custo/${centroCustoId}`);
    return response.data;
  },

  // Associar equipamento a centro de custo
  associarCentroCusto: async (equipamentoId: number, data: AssociarCentroCustoRequest): Promise<void> => {
    return api.put(`/api/equipamentos/${equipamentoId}`, {
      centro_custo_id: data.centro_custo_id
    });
  },

  // Remover associação equipamento-centro de custo
  removerAssociacao: async (equipamentoId: number): Promise<void> => {
    return api.put(`/api/equipamentos/${equipamentoId}`, {
      centro_custo_id: null
    });
  },

  // Equipamentos com alerta de manutenção
  getAlertas: async (centroCustoId?: number): Promise<Equipamento[]> => {
    const params = centroCustoId ? `?centro_custo_id=${centroCustoId}` : '';
    const response = await api.get<EquipamentosResponse>(`/api/equipamentos/alertas${params}`);
    return response.data;
  },

  // Estatísticas de manutenção
  getEstatisticas: async (centroCustoId?: number) => {
    const params = centroCustoId ? `?centro_custo_id=${centroCustoId}` : '';
    return api.get(`/api/equipamentos/estatisticas${params}`);
  },

  // Buscar categorias da API
  getCategorias: async (): Promise<Categoria[]> => {
    try {
      const response = await api.get('/api/categorias-equipamentos') as { data: CategoriasResponse };
      if (response.data && response.data.success) {
        return response.data.data || [];
      } else {
        console.error('Erro ao buscar categorias:', response.data?.message);
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }
};
import { api } from './api';

// Interfaces para Abastecimento
export interface Abastecimento {
  id: string;
  veiculo_id: string;
  data_abastecimento: string;
  km_atual: number;
  litros_abastecidos: number;
  valor_total: number;
  valor_por_litro: number;
  posto: string;
  motorista: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAbastecimentoRequest {
  veiculo_id: string;
  data_abastecimento: string;
  km_atual: number;
  litros_abastecidos: number;
  valor_total: number;
  valor_por_litro: number;
  posto: string;
  motorista: string;
  observacoes?: string;
}

export interface UpdateAbastecimentoRequest extends Partial<CreateAbastecimentoRequest> {
  id: string;
}

// Serviço de Abastecimento
export const abastecimentoService = {
  // Listar todos os abastecimentos
  getAll: async (): Promise<Abastecimento[]> => {
    return api.get<Abastecimento[]>('/api/abastecimento');
  },

  // Obter abastecimento por ID
  getById: async (id: string): Promise<Abastecimento> => {
    return api.get<Abastecimento>(`/api/abastecimento/${id}`);
  },

  // Obter abastecimentos por veículo
  getByVeiculo: async (veiculoId: string): Promise<Abastecimento[]> => {
    return api.get<Abastecimento[]>(`/api/abastecimento/veiculo/${veiculoId}`);
  },

  // Criar novo abastecimento
  create: async (data: CreateAbastecimentoRequest): Promise<Abastecimento> => {
    return api.post<Abastecimento>('/api/abastecimento', data);
  },

  // Atualizar abastecimento
  update: async (id: string, data: Partial<CreateAbastecimentoRequest>): Promise<Abastecimento> => {
    return api.put<Abastecimento>(`/api/abastecimento/${id}`, data);
  },

  // Deletar abastecimento
  delete: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/api/abastecimento/${id}`);
  },

  // Obter relatório de consumo
  getRelatorioConsumo: async (veiculoId?: string, periodo?: { inicio: string; fim: string }) => {
    const params = new URLSearchParams();
    if (veiculoId) params.append('veiculo_id', veiculoId);
    if (periodo) {
      params.append('data_inicio', periodo.inicio);
      params.append('data_fim', periodo.fim);
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/abastecimento/relatorio/consumo?${queryString}` : '/api/abastecimento/relatorio/consumo';
    
    return api.get(endpoint);
  },
};

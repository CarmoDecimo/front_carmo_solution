import { api } from './api';

// Interfaces para Veículos e Equipamentos
export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  combustivel: 'gasolina' | 'diesel' | 'flex' | 'eletrico';
  km_atual: number;
  status: 'ativo' | 'inativo' | 'manutencao';
  renavam?: string;
  chassi?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVeiculoRequest {
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  combustivel: 'gasolina' | 'diesel' | 'flex' | 'eletrico';
  km_atual: number;
  renavam?: string;
  chassi?: string;
  observacoes?: string;
}

export interface Horimetro {
  id: string;
  veiculo_id: string;
  data_registro: string;
  horas_atual: number;
  horas_trabalhadas: number;
  operador: string;
  observacoes?: string;
  created_at: string;
}

export interface CreateHorimetroRequest {
  veiculo_id: string;
  data_registro: string;
  horas_atual: number;
  horas_trabalhadas: number;
  operador: string;
  observacoes?: string;
}

// Serviço de Veículos
export const veiculosService = {
  // Listar todos os veículos
  getAll: async (): Promise<Veiculo[]> => {
    return api.get<Veiculo[]>('/api/veiculos');
  },

  // Obter veículo por ID
  getById: async (id: string): Promise<Veiculo> => {
    return api.get<Veiculo>(`/api/veiculos/${id}`);
  },

  // Obter veículo por placa
  getByPlaca: async (placa: string): Promise<Veiculo> => {
    return api.get<Veiculo>(`/api/veiculos/placa/${placa}`);
  },

  // Obter veículos ativos
  getAtivos: async (): Promise<Veiculo[]> => {
    return api.get<Veiculo[]>('/api/veiculos?status=ativo');
  },

  // Criar novo veículo
  create: async (data: CreateVeiculoRequest): Promise<Veiculo> => {
    return api.post<Veiculo>('/api/veiculos', data);
  },

  // Atualizar veículo
  update: async (id: string, data: Partial<CreateVeiculoRequest>): Promise<Veiculo> => {
    return api.put<Veiculo>(`/api/veiculos/${id}`, data);
  },

  // Atualizar quilometragem
  updateKm: async (id: string, km_atual: number): Promise<Veiculo> => {
    return api.patch<Veiculo>(`/api/veiculos/${id}/km`, { km_atual });
  },

  // Deletar veículo
  delete: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/api/veiculos/${id}`);
  },
};

// Serviço de Horímetros
export const horimetroService = {
  // Listar todos os horímetros
  getAll: async (): Promise<Horimetro[]> => {
    return api.get<Horimetro[]>('/api/horimetros');
  },

  // Obter horímetro por ID
  getById: async (id: string): Promise<Horimetro> => {
    return api.get<Horimetro>(`/api/horimetros/${id}`);
  },

  // Obter horímetros por veículo
  getByVeiculo: async (veiculoId: string): Promise<Horimetro[]> => {
    return api.get<Horimetro[]>(`/api/horimetros/veiculo/${veiculoId}`);
  },

  // Obter último horímetro de um veículo
  getUltimoByVeiculo: async (veiculoId: string): Promise<Horimetro> => {
    return api.get<Horimetro>(`/api/horimetros/veiculo/${veiculoId}/ultimo`);
  },

  // Criar novo registro de horímetro
  create: async (data: CreateHorimetroRequest): Promise<Horimetro> => {
    return api.post<Horimetro>('/api/horimetros', data);
  },

  // Atualizar horímetro
  update: async (id: string, data: Partial<CreateHorimetroRequest>): Promise<Horimetro> => {
    return api.put<Horimetro>(`/api/horimetros/${id}`, data);
  },

  // Deletar horímetro
  delete: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/api/horimetros/${id}`);
  },

  // Obter relatório de horas trabalhadas
  getRelatorioHoras: async (veiculoId?: string, periodo?: { inicio: string; fim: string }) => {
    const params = new URLSearchParams();
    if (veiculoId) params.append('veiculo_id', veiculoId);
    if (periodo) {
      params.append('data_inicio', periodo.inicio);
      params.append('data_fim', periodo.fim);
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/horimetros/relatorio/horas?${queryString}` : '/api/horimetros/relatorio/horas';
    
    return api.get(endpoint);
  },
};

import { api } from './api';

// Interfaces para Oficina/Manutenção
export interface Manutencao {
  id: string;
  veiculo_id: string;
  tipo_manutencao: 'preventiva' | 'corretiva' | 'preditiva';
  data_manutencao: string;
  km_manutencao: number;
  descricao: string;
  servicos_realizados: string[];
  pecas_utilizadas: PecaUtilizada[];
  valor_mao_obra: number;
  valor_pecas: number;
  valor_total: number;
  oficina: string;
  responsavel: string;
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface PecaUtilizada {
  nome: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

export interface CreateManutencaoRequest {
  veiculo_id: string;
  tipo_manutencao: 'preventiva' | 'corretiva' | 'preditiva';
  data_manutencao: string;
  km_manutencao: number;
  descricao: string;
  servicos_realizados: string[];
  pecas_utilizadas: PecaUtilizada[];
  valor_mao_obra: number;
  valor_pecas: number;
  oficina: string;
  responsavel: string;
  observacoes?: string;
}

export interface InspecaoEquipamento {
  id: string;
  equipamento_id: string;
  data_inspecao: string;
  tipo_inspecao: string;
  status: 'aprovado' | 'reprovado' | 'pendente';
  itens_verificados: ItemInspecao[];
  responsavel: string;
  observacoes?: string;
  created_at: string;
}

export interface ItemInspecao {
  item: string;
  status: 'ok' | 'nok' | 'na';
  observacao?: string;
}

// Serviço de Oficina/Manutenção
export const oficinaService = {
  // === MANUTENÇÕES ===
  
  // Listar todas as manutenções
  getAllManutencoes: async (): Promise<Manutencao[]> => {
    return api.get<Manutencao[]>('/api/oficina/manutencoes');
  },

  // Obter manutenção por ID
  getManutencaoById: async (id: string): Promise<Manutencao> => {
    return api.get<Manutencao>(`/api/oficina/manutencoes/${id}`);
  },

  // Obter manutenções por veículo
  getManutencoesByVeiculo: async (veiculoId: string): Promise<Manutencao[]> => {
    return api.get<Manutencao[]>(`/api/oficina/manutencoes/veiculo/${veiculoId}`);
  },

  // Criar nova manutenção
  createManutencao: async (data: CreateManutencaoRequest): Promise<Manutencao> => {
    return api.post<Manutencao>('/api/oficina/manutencoes', data);
  },

  // Atualizar manutenção
  updateManutencao: async (id: string, data: Partial<CreateManutencaoRequest>): Promise<Manutencao> => {
    return api.put<Manutencao>(`/api/oficina/manutencoes/${id}`, data);
  },

  // Deletar manutenção
  deleteManutencao: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/api/oficina/manutencoes/${id}`);
  },

  // === INSPEÇÕES ===
  
  // Listar todas as inspeções
  getAllInspecoes: async (): Promise<InspecaoEquipamento[]> => {
    return api.get<InspecaoEquipamento[]>('/api/oficina/inspecoes');
  },

  // Obter inspeção por ID
  getInspecaoById: async (id: string): Promise<InspecaoEquipamento> => {
    return api.get<InspecaoEquipamento>(`/api/oficina/inspecoes/${id}`);
  },

  // Criar nova inspeção
  createInspecao: async (data: Omit<InspecaoEquipamento, 'id' | 'created_at'>): Promise<InspecaoEquipamento> => {
    return api.post<InspecaoEquipamento>('/api/oficina/inspecoes', data);
  },

  // Atualizar inspeção
  updateInspecao: async (id: string, data: Partial<InspecaoEquipamento>): Promise<InspecaoEquipamento> => {
    return api.put<InspecaoEquipamento>(`/api/oficina/inspecoes/${id}`, data);
  },

  // === RELATÓRIOS ===
  
  // Obter relatório de manutenções
  getRelatorioManutencoes: async (periodo?: { inicio: string; fim: string }) => {
    const params = new URLSearchParams();
    if (periodo) {
      params.append('data_inicio', periodo.inicio);
      params.append('data_fim', periodo.fim);
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/oficina/relatorio/manutencoes?${queryString}` : '/api/oficina/relatorio/manutencoes';
    
    return api.get(endpoint);
  },

  // Obter relatório de custos
  getRelatorioCustos: async (periodo?: { inicio: string; fim: string }) => {
    const params = new URLSearchParams();
    if (periodo) {
      params.append('data_inicio', periodo.inicio);
      params.append('data_fim', periodo.fim);
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/oficina/relatorio/custos?${queryString}` : '/api/oficina/relatorio/custos';
    
    return api.get(endpoint);
  },
};

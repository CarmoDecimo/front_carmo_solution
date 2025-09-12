import { api } from './api';

// Interfaces para Alertas
export interface Alerta {
  id: string;
  tipo: 'manutencao' | 'combustivel' | 'vencimento' | 'quilometragem' | 'sistema';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  titulo: string;
  descricao: string;
  veiculo_id?: string;
  equipamento_id?: string;
  data_criacao: string;
  data_vencimento?: string;
  status: 'ativo' | 'resolvido' | 'ignorado';
  automatico: boolean;
  lido: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAlertaRequest {
  tipo: 'manutencao' | 'combustivel' | 'vencimento' | 'quilometragem' | 'sistema';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  titulo: string;
  descricao: string;
  veiculo_id?: string;
  equipamento_id?: string;
  data_vencimento?: string;
  automatico?: boolean;
}

export interface AlertaSummary {
  total: number;
  ativos: number;
  criticos: number;
  nao_lidos: number;
  por_tipo: Record<string, number>;
  por_prioridade: Record<string, number>;
}

// Serviço de Alertas
export const alertasService = {
  // Listar todos os alertas
  getAll: async (): Promise<Alerta[]> => {
    return api.get<Alerta[]>('/api/alertas');
  },

  // Obter alerta por ID
  getById: async (id: string): Promise<Alerta> => {
    return api.get<Alerta>(`/api/alertas/${id}`);
  },

  // Obter alertas ativos
  getAtivos: async (): Promise<Alerta[]> => {
    return api.get<Alerta[]>('/api/alertas?status=ativo');
  },

  // Obter alertas críticos
  getCriticos: async (): Promise<Alerta[]> => {
    return api.get<Alerta[]>('/api/alertas?prioridade=critica');
  },

  // Obter alertas automáticos
  getAutomaticos: async (): Promise<Alerta[]> => {
    return api.get<Alerta[]>('/api/alertas?automatico=true');
  },

  // Obter alertas por tipo
  getByTipo: async (tipo: string): Promise<Alerta[]> => {
    return api.get<Alerta[]>(`/api/alertas?tipo=${tipo}`);
  },

  // Obter alertas por veículo
  getByVeiculo: async (veiculoId: string): Promise<Alerta[]> => {
    return api.get<Alerta[]>(`/api/alertas/veiculo/${veiculoId}`);
  },

  // Criar novo alerta
  create: async (data: CreateAlertaRequest): Promise<Alerta> => {
    return api.post<Alerta>('/api/alertas', data);
  },

  // Atualizar alerta
  update: async (id: string, data: Partial<CreateAlertaRequest>): Promise<Alerta> => {
    return api.put<Alerta>(`/api/alertas/${id}`, data);
  },

  // Marcar alerta como lido
  marcarComoLido: async (id: string): Promise<Alerta> => {
    return api.patch<Alerta>(`/api/alertas/${id}/lido`, { lido: true });
  },

  // Marcar múltiplos alertas como lidos
  marcarMultiplosComoLidos: async (ids: string[]): Promise<{ message: string }> => {
    return api.patch<{ message: string }>('/api/alertas/marcar-lidos', { ids });
  },

  // Resolver alerta
  resolver: async (id: string): Promise<Alerta> => {
    return api.patch<Alerta>(`/api/alertas/${id}/resolver`, { status: 'resolvido' });
  },

  // Ignorar alerta
  ignorar: async (id: string): Promise<Alerta> => {
    return api.patch<Alerta>(`/api/alertas/${id}/ignorar`, { status: 'ignorado' });
  },

  // Deletar alerta
  delete: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/api/alertas/${id}`);
  },

  // Obter resumo de alertas
  getSummary: async (): Promise<AlertaSummary> => {
    return api.get<AlertaSummary>('/api/alertas/summary');
  },

  // Verificar novos alertas
  verificarNovos: async (): Promise<{ novos_alertas: number; alertas: Alerta[] }> => {
    return api.get<{ novos_alertas: number; alertas: Alerta[] }>('/api/alertas/verificar-novos');
  },
};

import { api } from './api';

// Interfaces para Centro de Custo
export interface CentroCusto {
  id?: string; // Para compatibilidade com lista
  centro_custo_id?: number; // Para detalhes da API
  codigo: string;
  nome: string;
  descricao?: string;
  responsavel?: string;
  localizacao?: string;
  ativo: boolean;
  created_at: string;
  total_equipamentos?: number; // Adicionado para exibir total dinamicamente
}

// Interface para estatísticas do centro de custo
export interface EstatisticasCentroCusto {
  centro_custo: {
    centro_custo_id: number;
    nome: string;
    codigo: string;
    responsavel?: string;
  };
  equipamentos: {
    total: number;
    ativos: number;
    inativos: number;
  };
  abastecimentos: {
    total: number;
    total_litros: number;
    total_valor: number;
    periodo: string;
  };
}

// Interface para equipamentos de centro de custo
export interface EquipamentoCentroCusto {
  equipamento_id: number;
  nome: string;
  codigo_ativo: string;
  categoria_id: number;
  horimetro_atual: number;
  km_atual?: number;
  status_equipamento: string;
  observacoes?: string;
  created_at: string;
  categorias_equipamentos: {
    categoria_id: number;
    nome: string;
    descricao: string;
  };
}

export interface EquipamentosCentroCustoResponse {
  success: boolean;
  data: EquipamentoCentroCusto[];
  total: number;
}

// Interfaces para Abastecimento
export interface EquipamentoAbastecimento {
  equipamento: string;
  activo: string;
  matricula: string;
  quantidade: number;
  kmh?: number;
  assinatura: string;
}

export interface Abastecimento {
  id: string;
  centro_custo_id: string;
  data_abastecimento: string;
  existencia_inicio: number;
  entrada_combustivel: number;
  posto_abastecimento: string;
  matricula_ativo: string;
  operador: string;
  equipamentos: EquipamentoAbastecimento[];
  existencia_fim: number;
  responsavel_abastecimento: string;
  numero_protocolo?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAbastecimentoRequest {
  centro_custo_id: string;
  data_abastecimento: string;
  existencia_inicio: number;
  entrada_combustivel: number;
  posto_abastecimento: string;
  matricula_ativo: string;
  operador: string;
  equipamentos: EquipamentoAbastecimento[];
  existencia_fim: number;
  responsavel_abastecimento: string;
}

export interface UpdateAbastecimentoRequest extends Partial<CreateAbastecimentoRequest> {
  id: string;
}

// Serviço de Centro de Custo
export const centroCustoService = {
  // Listar todos os centros de custo
  getAll: async (): Promise<CentroCusto[]> => {
    return api.get<CentroCusto[]>('/api/centros-custo');
  },

  // Obter centros de custo ativos
  getAtivos: async (): Promise<CentroCusto[]> => {
    return api.get<CentroCusto[]>('/api/centros-custo?ativo=true');
  },

  // Obter centro de custo por ID
  getById: async (id: string): Promise<CentroCusto> => {
    return api.get<CentroCusto>(`/api/centros-custo/${id}`);
  },

  // Obter estatísticas de um centro de custo
  getEstatisticas: async (id: string): Promise<EstatisticasCentroCusto> => {
    return api.get<EstatisticasCentroCusto>(`/api/centros-custo/${id}/estatisticas`);
  },

  // Listar equipamentos de um centro de custo
  getEquipamentos: async (id: string): Promise<EquipamentosCentroCustoResponse> => {
    return api.get<EquipamentosCentroCustoResponse>(`/api/centros-custo/${id}/equipamentos`);
  },

  // Listar abastecimentos de um centro de custo
  getAbastecimentos: async (id: string) => {
    return api.get(`/api/centros-custo/${id}/abastecimentos`);
  },
};

// Serviço de Abastecimento
export const abastecimentoService = {
  // Listar todos os abastecimentos
  getAll: async (): Promise<Abastecimento[]> => {
    return api.get<Abastecimento[]>('/api/abastecimentos');
  },

  // Obter abastecimento por ID
  getById: async (id: string): Promise<Abastecimento> => {
    return api.get<Abastecimento>(`/api/abastecimentos/${id}`);
  },

  // Obter abastecimentos por centro de custo
  getByCentroCusto: async (centroCustoId: string): Promise<Abastecimento[]> => {
    return api.get<Abastecimento[]>(`/api/abastecimentos/centro-custo/${centroCustoId}`);
  },

  // Criar novo abastecimento
  create: async (data: CreateAbastecimentoRequest): Promise<Abastecimento> => {
    return api.post<Abastecimento>('/api/abastecimentos', data);
  },

  // Atualizar abastecimento
  update: async (id: string, data: Partial<CreateAbastecimentoRequest>): Promise<Abastecimento> => {
    return api.put<Abastecimento>(`/api/abastecimentos/${id}`, data);
  },

  // Deletar abastecimento
  delete: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/api/abastecimentos/${id}`);
  },

  // Obter relatório de consumo
  getRelatorioConsumo: async (centroCustoId?: string, periodo?: { inicio: string; fim: string }) => {
    const params = new URLSearchParams();
    if (centroCustoId) params.append('centro_custo_id', centroCustoId);
    if (periodo) {
      params.append('data_inicio', periodo.inicio);
      params.append('data_fim', periodo.fim);
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/abastecimentos/relatorio/consumo?${queryString}` : '/api/abastecimentos/relatorio/consumo';
    
    return api.get(endpoint);
  },
};

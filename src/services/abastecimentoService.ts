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
  id?: number;
  abastecimento_id?: number;
  equipamento: string;
  activo: string;
  matricula: string;
  quantidade: number;
  kmh?: number;
  assinatura: string;
  criado_em?: string;
}

export interface Abastecimento {
  id_abastecimento: number;
  centro_custo_id: string;
  data_abastecimento: string;
  existencia_inicio: number;
  entrada_combustivel: number;
  posto_abastecimento: string;
  matricula_ativo: string;
  operador: string;
  equipamentos_abastecimentos?: EquipamentoAbastecimento[];
  existencia_fim: number;
  responsavel_abastecimento: string;
  veiculo_id?: string | null;
  quilometragem?: number | null;
  horimetro?: number | null;
  quantidade_combustivel?: number | null;
  custo?: number | null;
  local_abastecimento?: string | null;
  responsavel?: string | null;
  numero_protocolo?: string;
  criado_por: string;
  criado_em: string;
  updated_at: string;
}

export interface CreateAbastecimentoRequest {
  // centro_custo_id removido, não deve ser enviado ao backend
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

// Interface para resposta paginada da API
export interface AbastecimentoResponse {
  data: Abastecimento[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
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
  getAll: async (): Promise<AbastecimentoResponse> => {
    return api.get<AbastecimentoResponse>('/api/abastecimentos');
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

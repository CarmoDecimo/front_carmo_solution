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
  updated_at?: string;
  criado_em?: string;
  orcamento_anual?: number;
  categorias?: Array<{
    categoria_id: number;
    nome: string;
    descricao: string;
    criado_em: string;
  }>;
  veiculos?: Array<{ count: number }>;
  abastecimentos?: Array<{ count: number }>;
  total_equipamentos?: number;
  equipamentos_com_alerta?: number;
  total_abastecimentos_mes?: number;
  custo_combustivel_mes?: number;
  equipamentos?: Array<{
    equipamento_id: number;
    nome: string;
    codigo_ativo: string;
    status_equipamento: string;
    alerta_manutencao: boolean;
    data_associacao: string;
  }>;
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
    const response = await api.get<{ success: boolean; data: CentroCusto }>(`/api/centros-custo/${id}`);
    return response.data;
  },
};

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

  // Obter abastecimentos por centro de custo
  getByCentroCusto: async (centroCustoId: string): Promise<Abastecimento[]> => {
    return api.get<Abastecimento[]>(`/api/abastecimento/centro-custo/${centroCustoId}`);
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
  getRelatorioConsumo: async (centroCustoId?: string, periodo?: { inicio: string; fim: string }) => {
    const params = new URLSearchParams();
    if (centroCustoId) params.append('centro_custo_id', centroCustoId);
    if (periodo) {
      params.append('data_inicio', periodo.inicio);
      params.append('data_fim', periodo.fim);
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/abastecimento/relatorio/consumo?${queryString}` : '/api/abastecimento/relatorio/consumo';
    
    return api.get(endpoint);
  },
};

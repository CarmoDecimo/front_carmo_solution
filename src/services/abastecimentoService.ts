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

  // Exportar horímetros de um centro de custo
  exportarHorimetros: async (id: string): Promise<Blob> => {
    const baseURL = 'http://localhost:3001';
    const url = `${baseURL}/api/abastecimentos/exportar-horimetros/${id}`;
    
    console.log('🔗 URL da requisição (Centro de Custo):', url);
    console.log('🔑 Token de autenticação:', localStorage.getItem('authToken') ? 'Presente' : 'Ausente');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status da resposta:', response.status);
      console.log('📡 Headers da resposta:', response.headers);

      if (!response.ok) {
        // Tentar obter mais detalhes do erro
        let errorMessage = `Erro ao exportar horímetros: ${response.status} ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          console.log('❌ Detalhes do erro do servidor:', errorText);
          
          // Tentar parsear como JSON para obter mais detalhes
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.message) {
              errorMessage += ` - ${errorJson.message}`;
            }
          } catch {
            // Se não for JSON válido, usar o texto completo
            if (errorText) {
              errorMessage += ` - ${errorText}`;
            }
          }
        } catch (textError) {
          console.log('❌ Erro ao ler detalhes do erro:', textError);
        }
        
        throw new Error(errorMessage);
      }

      return response.blob();
    } catch (fetchError) {
      console.error('❌ Erro na requisição fetch:', fetchError);
      throw fetchError;
    }
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

  // Download de um abastecimento
  downloadAbastecimento: async (id: string): Promise<Blob> => {
    const baseURL = 'http://localhost:3001';
    const url = `${baseURL}/api/abastecimentos/download/${id}`;
    
    console.log('🔗 URL da requisição (Abastecimento):', url);
    console.log('🆔 ID do abastecimento:', id);
    console.log('🔑 Token de autenticação:', localStorage.getItem('authToken') ? 'Presente' : 'Ausente');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status da resposta:', response.status);
      console.log('📡 Status text:', response.statusText);
      
      // Criar objeto com headers principais (compatível com versões antigas)
      const headersObj: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
      console.log('📡 Headers da resposta:', headersObj);

      if (!response.ok) {
        // Tentar obter mais detalhes do erro
        let errorMessage = `Erro ao fazer download do abastecimento: ${response.status} ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          console.log('❌ Detalhes do erro do servidor:', errorText);
          
          // Tentar parsear como JSON para obter mais detalhes
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.message) {
              errorMessage += ` - ${errorJson.message}`;
            }
          } catch {
            // Se não for JSON válido, usar o texto completo
            if (errorText) {
              errorMessage += ` - ${errorText}`;
            }
          }
        } catch (textError) {
          console.log('❌ Erro ao ler detalhes do erro:', textError);
        }
        
        throw new Error(errorMessage);
      }

      // Verificar o tipo de conteúdo da resposta
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      console.log('📄 Content-Type:', contentType);
      console.log('📏 Content-Length:', contentLength);

      const blob = await response.blob();
      console.log('📦 Blob criado:', {
        size: blob.size,
        type: blob.type
      });

      // Se o blob for muito pequeno, pode ser um erro
      if (blob.size < 100) {
        console.warn('⚠️ Blob muito pequeno, pode ser um erro');
        // Tentar ler o conteúdo para verificar se é um erro em JSON
        try {
          const text = await blob.text();
          console.log('📝 Conteúdo do blob pequeno:', text);
          
          // Se parecer um JSON de erro
          if (text.charAt(0) === '{' || text.charAt(0) === '[') {
            const errorData = JSON.parse(text);
            throw new Error(`Erro da API: ${errorData.message || 'Resposta inesperada'}`);
          }
        } catch (parseError) {
          console.log('📝 Não foi possível parsear o conteúdo como JSON');
        }
      }

      return blob;
    } catch (fetchError) {
      console.error('❌ Erro na requisição fetch:', fetchError);
      throw fetchError;
    }
  },
};

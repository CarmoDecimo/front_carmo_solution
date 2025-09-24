import { api } from './api';

// Interfaces para Equipamentos
export interface Equipamento {
  equipamento_id: number;
  nome: string;
  codigo_ativo: string;
  categoria: string;
  categoria_id: number;
  centro_custo_id?: number; // Campo direto do centro de custo
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
  centros_custo?: {
    centro_custo_id: number;
    nome: string;
    codigo?: string;
    data_associacao?: string;
    associacao_ativa?: boolean;
  } | Array<{
    centro_custo_id: number;
    nome: string;
    data_associacao: string;
    associacao_ativa?: boolean;
  }> | null;
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
    console.log('🔍 equipamentosService.getAll chamado com filtros:', filters);
    
    const params = new URLSearchParams();
    if (filters?.categoria_id) params.append('categoria_id', filters.categoria_id.toString());
    if (filters?.status_equipamento) params.append('status_equipamento', filters.status_equipamento);
    if (filters?.centro_custo_id) params.append('centro_custo_id', filters.centro_custo_id.toString());
    
    // CORREÇÃO: Só enviar o parâmetro alerta_manutencao quando for true
    // Quando for false, não enviar para mostrar todos os equipamentos
    if (filters?.alerta_manutencao === true) {
      params.append('alerta_manutencao', 'true');
      console.log('🚨 Filtro alerta_manutencao=true aplicado');
    } else {
      console.log('✅ Sem filtro de alerta_manutencao - carregando todos os equipamentos');
    }
    
    const queryString = params.toString();
    const url = queryString ? `/api/equipamentos?${queryString}` : '/api/equipamentos';
    
    console.log('🌐 URL da requisição:', url);
    
    const response = await api.get<EquipamentosResponse>(url);
    
    console.log('📡 Resposta da API equipamentos:', {
      success: response.success,
      total: response.total,
      dataLength: response.data?.length,
      data: response.data
    });
    
    return response.data;
  },

  // Buscar equipamento por ID
  getById: async (id: number): Promise<Equipamento> => {
    try {
      console.log('🔍 Fazendo requisição para equipamento ID:', id);
      console.log('🌐 URL completa:', `/api/equipamentos/${id}`);
      
      const response = await api.get<any>(`/api/equipamentos/${id}`);
      
      console.log('📡 Resposta recebida da API:', response);
      console.log('📊 Tipo da resposta:', typeof response);
      console.log('🔑 Chaves da resposta:', Object.keys(response || {}));
      
      // Verificar se a resposta tem o formato { success: true, data: ... }
      if (response && response.success && response.data) {
        console.log('✅ Formato com success/data detectado');
        return response.data;
      }
      // Verificar se a resposta é diretamente o equipamento
      else if (response && response.equipamento_id) {
        console.log('✅ Formato direto de equipamento detectado');
        return response;
      }
      // Se não conseguir determinar o formato
      else {
        console.error('❌ Formato de resposta não reconhecido:', response);
        throw new Error(`Formato de resposta inválido. Recebido: ${JSON.stringify(response)}`);
      }
    } catch (error) {
      console.error('💥 Erro no getById do equipamentosService:', error);
      console.error('🔍 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        id: id
      });
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
  },

  // FUNÇÃO DE DEBUG: Testar API diretamente
  debugAPI: async () => {
    try {
      console.log('🔬 TESTE DIRETO DA API - Iniciando...');
      
      // Teste 1: Chamada sem filtros
      console.log('📡 Teste 1: GET /api/equipamentos (sem filtros)');
      const response1 = await api.get<EquipamentosResponse>('/api/equipamentos');
      console.log('📊 Resposta sem filtros:', {
        success: response1.success,
        total: response1.total,
        equipamentos: response1.data?.length,
        data: response1.data
      });
      
      // Análise dos alertas na resposta
      if (response1.data) {
        const comAlerta = response1.data.filter(eq => eq.alerta_manutencao === true);
        const semAlerta = response1.data.filter(eq => eq.alerta_manutencao === false);
        console.log('🚨 API - Equipamentos COM alerta:', comAlerta.length);
        console.log('✅ API - Equipamentos SEM alerta:', semAlerta.length);
        
        if (comAlerta.length > 0) {
          console.log('🔍 Detalhes dos equipamentos com alerta:', comAlerta);
        }
      }
      
      // Teste 2: Chamada explícita para equipamentos com alerta
      console.log('📡 Teste 2: GET /api/equipamentos?alerta_manutencao=true');
      const response2 = await api.get<EquipamentosResponse>('/api/equipamentos?alerta_manutencao=true');
      console.log('📊 Resposta com filtro alerta=true:', {
        success: response2.success,
        total: response2.total,
        equipamentos: response2.data?.length,
        data: response2.data
      });
      
      // Teste 3: Chamada explícita para equipamentos sem alerta
      console.log('📡 Teste 3: GET /api/equipamentos?alerta_manutencao=false');
      const response3 = await api.get<EquipamentosResponse>('/api/equipamentos?alerta_manutencao=false');
      console.log('📊 Resposta com filtro alerta=false:', {
        success: response3.success,
        total: response3.total,
        equipamentos: response3.data?.length,
        data: response3.data
      });
      
      console.log('🔬 TESTE DIRETO DA API - Concluído!');
      
    } catch (error) {
      console.error('❌ Erro no teste da API:', error);
    }
  }
};
import { api } from './api';

// Interfaces para o sistema de turnos
export interface TurnoAbastecimento {
  id_abastecimento: number;
  data_abastecimento: string;
  existencia_inicio: number;
  entrada_combustivel?: number;
  posto_abastecimento?: string;
  operador?: string;
  responsavel_abastecimento: string;
  quantidade_combustivel?: number;
  existencia_fim?: number;
  status: 'aberto' | 'fechado';
  equipamentos_abastecimentos?: EquipamentoTurno[];
}

export interface EquipamentoTurno {
  id?: number;
  equipamento: string;
  activo: string;
  quantidade: number;
  kmh?: number;
  assinatura?: string;
}

export interface IniciarTurnoRequest {
  existencia_inicio: number;
  responsavel_abastecimento: string;
  posto_abastecimento?: string;
  operador?: string;
  entrada_combustivel?: number;
}

export interface AdicionarEquipamentosRequest {
  entrada_combustivel?: number;
  equipamentos: {
    equipamento_id: number;
    quantidade: number;
    horimetro?: number;
    responsavel?: string;
  }[];
}

export interface FecharTurnoRequest {
  existencia_fim: number;
  responsavel_abastecimento?: string;
}

export interface TurnoResponse {
  success: boolean;
  message: string;
  turno: TurnoAbastecimento;
}

export interface AdicionarEquipamentosResponse {
  success: boolean;
  message: string;
  turno_id: number;
  equipamentos_adicionados: number;
  resultado_detalhado?: {
    equipamentos_processados: Array<{
      equipamento_id: number;
      nome: string;
      codigo_ativo: string;
      quantidade_abastecida: number;
      horimetro_atualizado: boolean;
    }>;
    erros_validacao?: Array<{
      equipamento_id: number;
      erro: string;
    }>;
  };
}

export interface ConsultarTurnoResponse {
  success: boolean;
  abastecimento: TurnoAbastecimento;
}

// Serviço de Turnos de Abastecimento
export const turnoAbastecimentoService = {
  // 1. Iniciar turno diário
  iniciarTurno: async (dados: IniciarTurnoRequest): Promise<TurnoResponse> => {
    try {
      console.log('🚀 Iniciando turno com dados:', dados);
      const response = await api.post<TurnoResponse>('/api/abastecimentos/iniciar-turno', dados);
      
      // Salvar ID do turno ativo no localStorage
      if (response.success && response.turno?.id_abastecimento) {
        localStorage.setItem('turno_ativo_id', response.turno.id_abastecimento.toString());
        console.log('💾 Turno ativo salvo no localStorage:', response.turno.id_abastecimento);
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Erro ao iniciar turno:', error);
      
      // Tratamento específico para turno já existente
      if (error.response?.status === 400 && error.response?.data?.message?.includes('turno em aberto')) {
        // Extrair ID do turno da mensagem de erro
        const match = error.response.data.message.match(/ID:\s*(\d+)/);
        if (match) {
          const turnoId = match[1];
          localStorage.setItem('turno_ativo_id', turnoId);
          console.log('💾 Turno existente encontrado e salvo:', turnoId);
        }
      }
      
      throw error;
    }
  },

  // 2. Adicionar equipamentos ao turno
  adicionarEquipamentos: async (turnoId: number, dados: AdicionarEquipamentosRequest): Promise<AdicionarEquipamentosResponse> => {
    try {
      console.log('⛽ Adicionando equipamentos ao turno:', turnoId, dados);
      const response = await api.put<AdicionarEquipamentosResponse>(
        `/api/abastecimentos/${turnoId}/adicionar-equipamentos`,
        dados
      );
      
      return response;
    } catch (error: any) {
      console.error('❌ Erro ao adicionar equipamentos:', error);
      
      // Tratamento específico para nenhum turno em aberto
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Nenhum turno em aberto')) {
        localStorage.removeItem('turno_ativo_id');
        console.log('🗑️ Turno ativo removido do localStorage');
      }
      
      throw error;
    }
  },

  // 3. Fechar turno
  fecharTurno: async (dados: FecharTurnoRequest): Promise<TurnoResponse> => {
    try {
      console.log('🔒 Fechando turno com dados:', dados);
      const response = await api.put<TurnoResponse>('/api/abastecimentos/fechar-turno', dados);
      
      // Limpar turno ativo do localStorage
      localStorage.removeItem('turno_ativo_id');
      console.log('🗑️ Turno ativo removido do localStorage após fechamento');
      
      return response;
    } catch (error: any) {
      console.error('❌ Erro ao fechar turno:', error);
      throw error;
    }
  },

  // 4. Consultar turno atual
  consultarTurno: async (turnoId: number): Promise<ConsultarTurnoResponse> => {
    try {
      console.log('🔍 Consultando turno:', turnoId);
      const response = await api.get<ConsultarTurnoResponse>(`/api/abastecimentos/${turnoId}`);
      
      return response;
    } catch (error: any) {
      console.error('❌ Erro ao consultar turno:', error);
      
      // Se turno não encontrado, limpar localStorage
      if (error.response?.status === 404) {
        localStorage.removeItem('turno_ativo_id');
        console.log('🗑️ Turno não encontrado, removido do localStorage');
      }
      
      throw error;
    }
  },

  // Verificar se há turno ativo
  verificarTurnoAtivo: async (): Promise<TurnoAbastecimento | null> => {
    const turnoId = localStorage.getItem('turno_ativo_id');
    
    // Primeiro, tentar verificar pelo ID do localStorage
    if (turnoId) {
      try {
        const response = await turnoAbastecimentoService.consultarTurno(Number(turnoId));
        
        // Verificar se turno ainda está aberto
        if (response.abastecimento.existencia_fim === null || response.abastecimento.existencia_fim === undefined) {
          console.log('✅ Turno ativo encontrado via localStorage:', response.abastecimento);
          return response.abastecimento;
        } else {
          // Turno já foi fechado
          localStorage.removeItem('turno_ativo_id');
          console.log('🔒 Turno já foi fechado, removido do localStorage');
        }
      } catch (error) {
        // Erro ao consultar turno, limpar localStorage
        localStorage.removeItem('turno_ativo_id');
        console.log('❌ Erro ao consultar turno do localStorage, removido');
      }
    }
    
    // Se não encontrou via localStorage, tentar iniciar um turno "fake" para descobrir se existe um ativo
    try {
      console.log('🔍 Tentando descobrir turno ativo via API...');
      
      // Fazer uma requisição fake para iniciar turno - se falhar, pode nos dar o ID do turno ativo
      await turnoAbastecimentoService.iniciarTurno({
        existencia_inicio: 1,
        responsavel_abastecimento: 'verificacao'
      });
      
      // Se chegou aqui, não há turno ativo
      console.log('📭 Nenhum turno ativo encontrado');
      return null;
      
    } catch (error: any) {
      // Se o erro é "turno já existe", extrair o ID e consultar
      if (error.response?.status === 400 && error.response?.data?.message?.includes('turno em aberto')) {
        const turnoIdExtraido = turnoAbastecimentoService.extrairTurnoIdDaMensagem(error.response.data.message);
        
        if (turnoIdExtraido) {
          console.log('✅ Turno ativo descoberto via erro da API, ID:', turnoIdExtraido);
          
          // Salvar no localStorage para próximas consultas
          localStorage.setItem('turno_ativo_id', turnoIdExtraido);
          
          try {
            const response = await turnoAbastecimentoService.consultarTurno(Number(turnoIdExtraido));
            console.log('✅ Turno ativo carregado:', response.abastecimento);
            return response.abastecimento;
          } catch (consultaError) {
            console.error('❌ Erro ao consultar turno descoberto:', consultaError);
            localStorage.removeItem('turno_ativo_id');
          }
        }
      }
      
      console.log('📭 Nenhum turno ativo encontrado');
      return null;
    }
  },

  // Extrair ID do turno da mensagem de erro
  extrairTurnoIdDaMensagem: (mensagem: string): string | null => {
    // Buscar padrões: "ID: 18" ou "(ID: 18)"
    const match = mensagem.match(/\(?ID:\s*(\d+)\)?/);
    return match ? match[1] : null;
  },

  // Calcular existência final estimada
  calcularExistenciaFinalEstimada: (existenciaInicio: number, entradaCombustivel: number, totalAbastecido: number): number => {
    return existenciaInicio + entradaCombustivel - totalAbastecido;
  },

  // Calcular variação
  calcularVariacao: (existenciaFimInformada: number, existenciaFimCalculada: number): number => {
    return Math.abs(existenciaFimInformada - existenciaFimCalculada);
  }
};

export default turnoAbastecimentoService;

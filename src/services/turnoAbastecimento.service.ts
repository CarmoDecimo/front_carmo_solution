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
  matricula?: string;
  matricula_ativo?: string;
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
      console.log('⛽ Adicionando equipamentos ao turno:', turnoId);
      console.log('📋 Dados enviados:', JSON.stringify(dados, null, 2));
      console.log('🔗 URL da requisição:', `/api/abastecimentos/${turnoId}/adicionar-equipamentos`);
      
      // Validar turnoId
      if (!turnoId || turnoId <= 0) {
        throw new Error(`ID do turno inválido: ${turnoId}`);
      }
      
      // Validar dados antes de enviar
      if (!dados.equipamentos || dados.equipamentos.length === 0) {
        throw new Error('Nenhum equipamento fornecido para adicionar');
      }
      
      // Validar cada equipamento
      dados.equipamentos.forEach((eq, index) => {
        console.log(`🔍 Validando equipamento ${index + 1}:`, eq);
        
        if (!eq.equipamento_id || eq.equipamento_id <= 0) {
          throw new Error(`Equipamento ${index + 1}: ID do equipamento inválido (${eq.equipamento_id})`);
        }
        if (!eq.quantidade || eq.quantidade <= 0) {
          throw new Error(`Equipamento ${index + 1}: Quantidade inválida (${eq.quantidade})`);
        }
        
        // Validar tipos de dados
        if (typeof eq.equipamento_id !== 'number') {
          throw new Error(`Equipamento ${index + 1}: ID deve ser um número (recebido: ${typeof eq.equipamento_id})`);
        }
        if (typeof eq.quantidade !== 'number') {
          throw new Error(`Equipamento ${index + 1}: Quantidade deve ser um número (recebido: ${typeof eq.quantidade})`);
        }
      });
      
      // Verificar se o turno ainda está ativo antes de enviar
      console.log('🔍 Verificando se o turno ainda está ativo...');
      try {
        const turnoAtual = await turnoAbastecimentoService.consultarTurno(turnoId);
        if (turnoAtual.abastecimento.existencia_fim !== null && turnoAtual.abastecimento.existencia_fim !== undefined) {
          throw new Error('O turno já foi fechado e não pode receber novos equipamentos');
        }
        console.log('✅ Turno confirmado como ativo');
      } catch (consultError: any) {
        console.error('❌ Erro ao verificar status do turno:', consultError);
        if (consultError.status === 404) {
          throw new Error('Turno não encontrado. Pode ter sido removido ou não existe.');
        }
        // Se não conseguir consultar, continua com a tentativa (pode ser problema temporário)
        console.log('⚠️ Não foi possível verificar o status do turno, continuando...');
      }
      
      const response = await api.put<AdicionarEquipamentosResponse>(
        `/api/abastecimentos/${turnoId}/adicionar-equipamentos`,
        dados
      );
      
      console.log('✅ Resposta da API:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Erro ao adicionar equipamentos:', error);
      console.error('📊 Status do erro:', error.status);
      console.error('📝 Mensagem do erro:', error.message);
      console.error('📄 Dados do erro:', error.data);
      
      // Log detalhado do erro da API
      if (error.response) {
        console.error('🌐 Resposta HTTP:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      // Tratamento específico para erros de turno
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Nenhum turno em aberto')) {
        localStorage.removeItem('turno_ativo_id');
        console.log('🗑️ Turno ativo removido do localStorage (400 - Nenhum turno em aberto)');
      } else if (error.response?.status === 404) {
        // Turno não encontrado (ID inválido ou turno foi fechado)
        localStorage.removeItem('turno_ativo_id');
        console.log('🗑️ Turno ativo removido do localStorage (404 - Turno não encontrado)');
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
    
    // Se não encontrou via localStorage, não há turno ativo
    console.log('📭 Nenhum turno ativo encontrado (localStorage vazio)');
    return null;
  },

  // Extrair ID do turno da mensagem de erro
  extrairTurnoIdDaMensagem: (mensagem: string): string | null => {
    // Buscar múltiplos padrões para capturar o ID
    const patterns = [
      /ID:\s*(\d+)/,           // "ID: 36"
      /\(ID:\s*(\d+)\)/,       // "(ID: 36)"
      /turno\s+(\d+)/i,        // "turno 36"
      /ID\s+(\d+)/i            // "ID 36"
    ];
    
    for (const pattern of patterns) {
      const match = mensagem.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  },

  // Detectar e carregar turno ativo a partir de erro de inicialização
  detectarTurnoAtivoDoErro: async (errorMessage: string): Promise<TurnoAbastecimento | null> => {
    console.log('🔍 Tentando detectar turno ativo a partir do erro...');
    
    const turnoId = turnoAbastecimentoService.extrairTurnoIdDaMensagem(errorMessage);
    
    if (turnoId) {
      console.log('🎯 ID do turno detectado:', turnoId);
      localStorage.setItem('turno_ativo_id', turnoId);
      
      try {
        const response = await turnoAbastecimentoService.consultarTurno(Number(turnoId));
        console.log('✅ Turno ativo carregado:', response.abastecimento);
        return response.abastecimento;
      } catch (consultError) {
        console.log('❌ Erro ao consultar turno detectado:', consultError);
        localStorage.removeItem('turno_ativo_id');
        return null;
      }
    }
    
    return null;
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

import { api } from './api';

// Interfaces para tipagem
export interface FiltrosManutencao {
  data_inicio?: string;
  data_fim?: string;
  status?: 'planeada' | 'realizada' | 'atrasada' | 'cancelada';
  centro_custo_id?: number;
  equipamento_id?: number;
}

export interface ManutencaoCalendario {
  id: string;
  equipamento: {
    numero_patrimonio: string;
    marca: string;
    modelo: string;
  };
  data_prevista: string;
  horimetro_previsto?: number;
  status: 'pendente' | 'realizada' | 'atrasada' | 'cancelada';
  prioridade?: 'alta' | 'media' | 'baixa';
  centro_custo?: string;
  tipo_manutencao?: string;
}

export interface EquipamentoLote {
  equipamento_id: number;
  horimetro_atual?: number;
  km_atual?: number;
}

export interface ResultadoVerificacaoLote {
  total_verificados: number;
  necessitam_manutencao: number;
  manutencoes_geradas: number;
  equipamentos: Array<{
    equipamento_id: string;
    numero_patrimonio: string;
    necessita_manutencao: boolean;
    status_manutencao: string;
    manutencao_gerada: boolean;
  }>;
}

export interface ResultadoAtualizacaoAtrasadas {
  manutencoes_atualizadas: number;
  detalhes: Array<{
    id: number;
    equipamento_nome: string;
    data_programada: string;
  }>;
}

export interface ResultadoDownload {
  success: boolean;
  filename: string;
}

export interface ApiResponse<T = any> {
  data: T;
  headers: Record<string, string>;
}

export type StatusColor = 'success' | 'error' | 'warning' | 'default';

/**
 * Serviço para operações relacionadas a manutenções
 */
class ManutencaoService {
  /**
   * Listar manutenções em formato de calendário
   * @param filtros - Filtros para a consulta
   * @returns Promise com os dados das manutenções
   */
  async listarCalendario(filtros: FiltrosManutencao = {}): Promise<ManutencaoCalendario[]> {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros aos parâmetros se fornecidos
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.centro_custo_id) params.append('centro_custo_id', filtros.centro_custo_id.toString());
      if (filtros.equipamento_id) params.append('equipamento_id', filtros.equipamento_id.toString());

      const response = await api.get<ManutencaoCalendario[]>(`/manutencoes/calendario?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Erro ao listar manutenções do calendário:', error);
      throw error;
    }
  }

  /**
   * Forçar geração de manutenção preventiva para um equipamento
   * @param equipamentoId - ID do equipamento
   * @returns Promise com os dados da manutenção gerada
   */
  async gerarManutencaoPreventiva(equipamentoId: number): Promise<ManutencaoCalendario> {
    try {
      const response = await api.post<ManutencaoCalendario>(`/manutencoes/preventiva/${equipamentoId}`);
      return response;
    } catch (error) {
      console.error('Erro ao gerar manutenção preventiva:', error);
      throw error;
    }
  }

  /**
   * Verificar necessidade de manutenção para múltiplos equipamentos
   * @param equipamentoIds - Lista de IDs dos equipamentos
   * @returns Promise com o resultado da verificação
   */
  async verificarLote(equipamentoIds: string[]): Promise<ResultadoVerificacaoLote> {
    try {
      const response = await api.post<ResultadoVerificacaoLote>('/manutencoes/verificar-lote', {
        equipamentoIds
      });
      return response;
    } catch (error) {
      console.error('Erro ao verificar lote de equipamentos:', error);
      throw error;
    }
  }

  /**
   * Atualizar status de manutenções atrasadas
   * @returns Promise com o resultado da atualização
   */
  async atualizarAtrasadas(): Promise<ResultadoAtualizacaoAtrasadas> {
    try {
      const response = await api.post<ResultadoAtualizacaoAtrasadas>('/manutencoes/atualizar-atrasadas');
      return response;
    } catch (error) {
      console.error('Erro ao atualizar manutenções atrasadas:', error);
      throw error;
    }
  }

  /**
   * Baixar relatório de manutenções em Excel
   * @param filtros - Filtros para o relatório
   * @returns Promise que resolve com o resultado do download
   */
  async downloadRelatorio(filtros: FiltrosManutencao = {}): Promise<ResultadoDownload> {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros aos parâmetros se fornecidos
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      if (filtros.centro_custo_id) params.append('centro_custo_id', filtros.centro_custo_id.toString());
      if (filtros.status) params.append('status', filtros.status);

      // Para downloads de blob, usamos fetch diretamente
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3001/manutencoes/download?${params.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // Extrair nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'manutencoes_relatorio.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Obter o blob da resposta
      const blob = await response.blob();
      
      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      throw error;
    }
  }

  /**
   * Formatar data para o formato esperado pela API (YYYY-MM-DD)
   * @param date - Data a ser formatada
   * @returns Data formatada
   */
  formatarDataParaAPI(date: Date | null): string {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Obter cor do chip baseado no status
   * @param status - Status da manutenção
   * @returns Cor do chip
   */
  getStatusColor(status: string): StatusColor {
    switch (status) {
      case 'realizada':
        return 'success';
      case 'atrasada':
        return 'error';
      case 'cancelada':
        return 'default';
      case 'planeada':
      default:
        return 'warning';
    }
  }

  /**
   * Obter label traduzido do status
   * @param status - Status da manutenção
   * @returns Label traduzido
   */
  getStatusLabel(status: string): string {
    switch (status) {
      case 'planeada':
        return 'Planeada';
      case 'realizada':
        return 'Realizada';
      case 'atrasada':
        return 'Atrasada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  }
}

export default new ManutencaoService();

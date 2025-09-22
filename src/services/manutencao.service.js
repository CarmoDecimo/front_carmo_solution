import { api } from './api';

class ManutencaoService {
  // Listar manutenções em formato de calendário
  async listarCalendario(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.centro_custo_id) params.append('centro_custo_id', filtros.centro_custo_id.toString());
      if (filtros.equipamento_id) params.append('equipamento_id', filtros.equipamento_id.toString());

      const response = await api.get(`/api/manutencoes/calendario?${params.toString()}`);
      
      // A API retorna diretamente o formato esperado
      return {
        success: true,
        data: response.data.data || [],
        totalCount: response.data.totalCount || 0
      };
    } catch (error) {
      console.error('Erro ao listar manutenções:', error);
      return {
        success: false,
        data: [],
        totalCount: 0
      };
    }
  }

  // Forçar geração de manutenção preventiva
  async gerarManutencaoPreventiva(equipamentoId) {
    try {
      const response = await api.post(`/api/manutencoes/preventiva/${equipamentoId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erro ao gerar manutenção preventiva:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verificar necessidade de manutenção para múltiplos equipamentos
  async verificarLote(equipamentos) {
    try {
      const response = await api.post('/api/manutencoes/verificar-lote', {
        equipamentos
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erro na verificação em lote:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Atualizar status de manutenções atrasadas
  async atualizarAtrasadas() {
    try {
      const response = await api.post('/api/manutencoes/atualizar-atrasadas');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erro ao atualizar manutenções atrasadas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Baixar relatório de manutenções em Excel
  async downloadRelatorio(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.centro_custo_id) params.append('centro_custo_id', filtros.centro_custo_id.toString());

      const response = await api.get(`/api/manutencoes/download?${params.toString()}`, {
        responseType: 'blob'
      });

      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extrair nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'manutencoes_relatorio.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      throw error;
    }
  }

  // Funções utilitárias
  getStatusLabel(status) {
    const labels = {
      'planeada': 'Planeada',
      'realizada': 'Realizada',
      'atrasada': 'Atrasada',
      'cancelada': 'Cancelada'
    };
    return labels[status] || status;
  }

  getStatusColor(status) {
    const colors = {
      'planeada': 'warning',
      'realizada': 'success',
      'atrasada': 'error',
      'cancelada': 'default'
    };
    return colors[status] || 'default';
  }

  formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarDataHora(data) {
    return new Date(data).toLocaleString('pt-BR');
  }
}

const manutencaoService = new ManutencaoService();
export default manutencaoService;

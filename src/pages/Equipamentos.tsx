import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Typography, Container, Box, Chip, Alert, Snackbar, FormControlLabel, Switch,
  Select, MenuItem, FormControl, InputLabel, Tooltip
} from '@mui/material';
import { 
  Edit, Delete, Add, Visibility, Construction, Warning, 
  Speed, Link, LinkOff, Build 
} from '@mui/icons-material';

// Interface para Equipamento conforme API
interface Equipamento {
  equipamento_id: number;
  nome: string;
  codigo_ativo: string;
  categoria: string;
  categoria_id?: number;
  horimetro_atual: number;
  km_atual?: number;
  status_equipamento: 'ativo' | 'manutencao' | 'parado';
  horas_para_vencer: number;
  alerta_manutencao: boolean;
  ultima_revisao_horimetro?: number;
  proxima_revisao_horimetro?: number;
  data_ultima_leitura?: string;
  intervalo_manutencao?: number;
  observacoes?: string;
  centros_custo: Array<{
    centro_custo_id: number;
    nome: string;
    data_associacao: string;
  }>;
}

// Interface para Centro de Custo
interface CentroCusto {
  centro_custo_id: number;
  nome: string;
}

// Interface para Categoria
interface Categoria {
  categoria_id: number;
  nome: string;
}

const EquipamentosPage: React.FC = () => {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Estados do modal principal
  const [nome, setNome] = useState('');
  const [codigoAtivo, setCodigoAtivo] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [horimetroAtual, setHorimetroAtual] = useState<number | ''>('');
  const [kmAtual, setKmAtual] = useState<number | ''>('');
  const [statusEquipamento, setStatusEquipamento] = useState<'ativo' | 'manutencao' | 'parado'>('ativo');
  const [intervaloManutencao, setIntervaloManutencao] = useState<number | ''>('');
  const [observacoes, setObservacoes] = useState('');

  // Estados para modais de ações específicas
  const [horimetroModalOpen, setHorimetroModalOpen] = useState(false);
  const [manutencaoModalOpen, setManutencaoModalOpen] = useState(false);
  const [associacaoModalOpen, setAssociacaoModalOpen] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<Equipamento | null>(null);

  // Estados para ações específicas
  const [novoHorimetro, setNovoHorimetro] = useState<number | ''>('');
  const [dataLeitura, setDataLeitura] = useState(new Date().toISOString().split('T')[0]);
  const [observacoesHorimetro, setObservacoesHorimetro] = useState('');
  
  const [horimetroManutencao, setHorimetroManutencao] = useState<number | ''>('');
  const [dataManutencao, setDataManutencao] = useState(new Date().toISOString().split('T')[0]);
  const [tipoRevisao, setTipoRevisao] = useState('');
  const [observacoesManutencao, setObservacoesManutencao] = useState('');
  const [novoIntervalo, setNovoIntervalo] = useState<number | ''>('');

  const [centroCustoAssociacao, setCentroCustoAssociacao] = useState<number | ''>('');
  const [dataAssociacao, setDataAssociacao] = useState(new Date().toISOString().split('T')[0]);
  const [observacoesAssociacao, setObservacoesAssociacao] = useState('');

  // Estados de feedback
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    nome: '',
    categoria_id: '',
    status_equipamento: 'todos',
    centro_custo_id: '',
    alerta_manutencao: false
  });

  // Carregar dados ao montar componente
  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    // Carregar categorias primeiro (dados mockados)
    await carregarCategorias();
    
    // Tentar carregar dados reais, mas não falhar se houver erro
    try {
      await carregarCentrosCusto();
    } catch (error) {
      console.warn('Centros de custo não disponíveis:', error);
    }
    
    try {
      await carregarEquipamentos();
    } catch (error) {
      console.warn('Equipamentos não disponíveis:', error);
      setLoading(false);
    }
  };

  const carregarEquipamentos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      
      // Aplicar filtros
      if (filtros.nome) params.append('nome', filtros.nome);
      if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
      if (filtros.status_equipamento !== 'todos') params.append('status_equipamento', filtros.status_equipamento);
      if (filtros.centro_custo_id) params.append('centro_custo_id', filtros.centro_custo_id);
      if (filtros.alerta_manutencao) params.append('alerta_manutencao', 'true');

      const response = await fetch(`http://localhost:3001/api/equipamentos?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setEquipamentos(result.data);
      } else {
        setSnackbar({ open: true, message: 'Erro ao carregar equipamentos', severity: 'error' });
      }
    } catch (error) {
      console.warn('API de equipamentos não disponível, usando dados mockados');
      // Dados mockados para demonstração
      setEquipamentos([
        {
          equipamento_id: 1,
          nome: "TRATOR DE ESTEIRA CATERPILLER D6R",
          codigo_ativo: "01.01.0004",
          categoria: "Trator de Esteira",
          categoria_id: 1,
          horimetro_atual: 6662,
          km_atual: undefined,
          status_equipamento: "ativo" as const,
          horas_para_vencer: -231,
          alerta_manutencao: true,
          ultima_revisao_horimetro: 6893,
          proxima_revisao_horimetro: 7143,
          data_ultima_leitura: "2025-08-19",
          intervalo_manutencao: 250,
          observacoes: "Equipamento em operação",
          centros_custo: [
            {
              centro_custo_id: 1,
              nome: "Obra ABC",
              data_associacao: "2024-01-15"
            }
          ]
        },
        {
          equipamento_id: 2,
          nome: "ESCAVADEIRA CAT 320D",
          codigo_ativo: "02.01.0001",
          categoria: "Escavadeira",
          categoria_id: 2,
          horimetro_atual: 4500,
          km_atual: undefined,
          status_equipamento: "ativo" as const,
          horas_para_vencer: 100,
          alerta_manutencao: false,
          ultima_revisao_horimetro: 4400,
          proxima_revisao_horimetro: 4650,
          data_ultima_leitura: "2025-09-10",
          intervalo_manutencao: 250,
          observacoes: "Equipamento em bom estado",
          centros_custo: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const carregarCentrosCusto = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/centros-custo', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setCentrosCusto(result.data);
      }
    } catch (error) {
      console.warn('API de centros de custo não disponível, usando dados mockados');
      // Dados mockados para demonstração
      setCentrosCusto([
        { centro_custo_id: 1, nome: 'Obra ABC - Construção Civil' },
        { centro_custo_id: 2, nome: 'Obra DEF - Pavimentação' },
        { centro_custo_id: 3, nome: 'Obra GHI - Infraestrutura' }
      ]);
    }
  };

  const carregarCategorias = async () => {
    // Dados mockados para categorias até a API estar disponível
    setCategorias([
      { categoria_id: 1, nome: 'Trator de Esteira' },
      { categoria_id: 2, nome: 'Escavadeira' },
      { categoria_id: 3, nome: 'Caminhão' },
      { categoria_id: 4, nome: 'Retroescavadeira' },
      { categoria_id: 5, nome: 'Motoniveladora' },
      { categoria_id: 6, nome: 'Rolo Compactador' }
    ]);
  };

  const handleOpen = () => {
    setEditId(null);
    setNome('');
    setCodigoAtivo('');
    setCategoriaId('');
    setHorimetroAtual('');
    setKmAtual('');
    setStatusEquipamento('ativo');
    setIntervaloManutencao('');
    setObservacoes('');
    setOpen(true);
  };

  const handleEdit = (equipamento: Equipamento) => {
    setEditId(equipamento.equipamento_id);
    setNome(equipamento.nome);
    setCodigoAtivo(equipamento.codigo_ativo);
    setCategoriaId(equipamento.categoria_id || '');
    setHorimetroAtual(equipamento.horimetro_atual);
    setKmAtual(equipamento.km_atual || '');
    setStatusEquipamento(equipamento.status_equipamento);
    setIntervaloManutencao(equipamento.intervalo_manutencao || '');
    setObservacoes(equipamento.observacoes || '');
    setOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim() || !codigoAtivo.trim() || !categoriaId) {
      setSnackbar({ open: true, message: 'Campos obrigatórios: Nome, Código Ativo e Categoria', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const data = {
        nome: nome.trim(),
        codigo_ativo: codigoAtivo.trim(),
        categoria_id: categoriaId,
        horimetro_atual: horimetroAtual || 0,
        km_atual: kmAtual || undefined,
        status_equipamento: statusEquipamento,
        intervalo_manutencao: intervaloManutencao || 250,
        observacoes: observacoes.trim() || undefined
      };

      const url = editId ? `http://localhost:3001/api/equipamentos/${editId}` : 'http://localhost:3001/api/equipamentos';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        setSnackbar({ 
          open: true, 
          message: editId ? 'Equipamento atualizado!' : 'Equipamento criado!', 
          severity: 'success' 
        });
        setOpen(false);
        carregarEquipamentos();
      } else {
        setSnackbar({ open: true, message: result.message || 'Erro ao salvar', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro de conexão', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este equipamento?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/equipamentos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setSnackbar({ open: true, message: 'Equipamento excluído!', severity: 'success' });
        carregarEquipamentos();
      } else {
        setSnackbar({ open: true, message: result.message || 'Erro ao excluir', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro de conexão', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const abrirModalHorimetro = (equipamento: Equipamento) => {
    setEquipamentoSelecionado(equipamento);
    setNovoHorimetro(equipamento.horimetro_atual);
    setDataLeitura(new Date().toISOString().split('T')[0]);
    setObservacoesHorimetro('');
    setHorimetroModalOpen(true);
  };

  const atualizarHorimetro = async () => {
    if (!equipamentoSelecionado || !novoHorimetro) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const data = {
        horimetro_atual: novoHorimetro,
        data_leitura: dataLeitura,
        observacoes: observacoesHorimetro.trim() || undefined
      };

      const response = await fetch(`http://localhost:3001/api/equipamentos/${equipamentoSelecionado.equipamento_id}/horimetro`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        setSnackbar({ open: true, message: 'Horímetro atualizado!', severity: 'success' });
        setHorimetroModalOpen(false);
        carregarEquipamentos();
      } else {
        setSnackbar({ open: true, message: result.message || 'Erro ao atualizar horímetro', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro de conexão', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const abrirModalManutencao = (equipamento: Equipamento) => {
    setEquipamentoSelecionado(equipamento);
    setHorimetroManutencao(equipamento.horimetro_atual);
    setDataManutencao(new Date().toISOString().split('T')[0]);
    setTipoRevisao('Manutenção preventiva');
    setObservacoesManutencao('');
    setNovoIntervalo(equipamento.intervalo_manutencao || 250);
    setManutencaoModalOpen(true);
  };

  const registrarManutencao = async () => {
    if (!equipamentoSelecionado || !horimetroManutencao || !tipoRevisao) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const data = {
        horimetro_manutencao: horimetroManutencao,
        data_manutencao: dataManutencao,
        tipo_revisao: tipoRevisao,
        observacoes: observacoesManutencao.trim() || undefined,
        novo_intervalo: novoIntervalo || 250
      };

      const response = await fetch(`http://localhost:3001/api/equipamentos/${equipamentoSelecionado.equipamento_id}/manutencao`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        setSnackbar({ open: true, message: 'Manutenção registrada!', severity: 'success' });
        setManutencaoModalOpen(false);
        carregarEquipamentos();
      } else {
        setSnackbar({ open: true, message: result.message || 'Erro ao registrar manutenção', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro de conexão', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const abrirModalAssociacao = (equipamento: Equipamento) => {
    setEquipamentoSelecionado(equipamento);
    setCentroCustoAssociacao('');
    setDataAssociacao(new Date().toISOString().split('T')[0]);
    setObservacoesAssociacao('');
    setAssociacaoModalOpen(true);
  };

  const associarCentroCusto = async () => {
    if (!equipamentoSelecionado || !centroCustoAssociacao) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const data = {
        centro_custo_id: centroCustoAssociacao,
        data_associacao: dataAssociacao,
        observacoes: observacoesAssociacao.trim() || undefined
      };

      const response = await fetch(`http://localhost:3001/api/equipamentos/${equipamentoSelecionado.equipamento_id}/centro-custo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        setSnackbar({ open: true, message: 'Equipamento associado ao centro de custo!', severity: 'success' });
        setAssociacaoModalOpen(false);
        carregarEquipamentos();
      } else {
        setSnackbar({ open: true, message: result.message || 'Erro ao associar equipamento', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro de conexão', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const removerAssociacao = async (equipamentoId: number, centroCustoId: number) => {
    if (!window.confirm('Tem certeza que deseja remover esta associação?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/equipamentos/${equipamentoId}/centro-custo/${centroCustoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setSnackbar({ open: true, message: 'Associação removida!', severity: 'success' });
        carregarEquipamentos();
      } else {
        setSnackbar({ open: true, message: result.message || 'Erro ao remover associação', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro de conexão', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'success';
      case 'manutencao': return 'warning';
      case 'parado': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'manutencao': return 'Manutenção';
      case 'parado': return 'Parado';
      default: return status;
    }
  };

  const handleClose = () => setOpen(false);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Cabeçalho */}
      <Box sx={{ 
        mb: { xs: 3, md: 4 }, 
        display: 'flex', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Construction color="primary" sx={{ fontSize: { xs: 32, md: 40 } }} />
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Equipamentos
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={handleOpen}
          disabled={loading}
          size={window.innerWidth < 600 ? "small" : "medium"}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Novo Equipamento
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          Filtros
        </Typography>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)', 
            lg: 'repeat(4, 1fr)' 
          },
          gap: 2,
          alignItems: 'end'
        }}>
          <TextField
            label="Buscar por nome"
            value={filtros.nome}
            onChange={e => setFiltros(f => ({ ...f, nome: e.target.value }))}
            size="small"
            fullWidth
          />
          
          <FormControl size="small" fullWidth>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={filtros.categoria_id}
              label="Categoria"
              onChange={e => setFiltros(f => ({ ...f, categoria_id: e.target.value }))}
            >
              <MenuItem value="">Todas</MenuItem>
              {categorias.map(categoria => (
                <MenuItem key={categoria.categoria_id} value={categoria.categoria_id}>
                  {categoria.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filtros.status_equipamento}
              label="Status"
              onChange={e => setFiltros(f => ({ ...f, status_equipamento: e.target.value }))}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="manutencao">Manutenção</MenuItem>
              <MenuItem value="parado">Parado</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Centro de Custo</InputLabel>
            <Select
              value={filtros.centro_custo_id}
              label="Centro de Custo"
              onChange={e => setFiltros(f => ({ ...f, centro_custo_id: e.target.value }))}
            >
              <MenuItem value="">Todos</MenuItem>
              {centrosCusto.map(centro => (
                <MenuItem key={centro.centro_custo_id} value={centro.centro_custo_id}>
                  {centro.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={filtros.alerta_manutencao}
                onChange={e => setFiltros(f => ({ ...f, alerta_manutencao: e.target.checked }))}
                color="warning"
              />
            }
            label="Apenas com alerta de manutenção"
            sx={{ 
              '& .MuiFormControlLabel-label': { 
                fontSize: { xs: '0.875rem', md: '1rem' } 
              } 
            }}
          />
        </Box>
      </Paper>

      {/* Tabela */}
      <Paper sx={{ overflow: 'hidden', boxShadow: 3 }}>
        {/* Container com scroll horizontal para responsividade */}
        <Box sx={{ overflow: 'auto', width: '100%' }}>
          <Table sx={{ minWidth: { xs: 800, md: 1000 } }}>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '& .MuiTableCell-root': {
                  borderBottom: 'none',
                  position: 'relative'
                }
              }}>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '0.95rem',
                  backgroundColor: 'transparent',
                  py: 2,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  minWidth: { xs: 180, md: 200 }
                }}>
                  Nome do Equipamento
                </TableCell>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '0.95rem',
                  backgroundColor: 'transparent',
                  py: 2,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  minWidth: 120
                }}>
                  Código Ativo
                </TableCell>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '0.95rem',
                  backgroundColor: 'transparent',
                  py: 2,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  minWidth: 130
                }}>
                  Categoria
                </TableCell>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '0.95rem',
                  backgroundColor: 'transparent',
                  py: 2,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  minWidth: 120
                }}>
                  Horímetro Atual
                </TableCell>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '0.95rem',
                  backgroundColor: 'transparent',
                  py: 2,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  minWidth: 100
                }}>
                  Status
                </TableCell>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '0.95rem',
                  backgroundColor: 'transparent',
                  py: 2,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  minWidth: 140
                }}>
                  Próxima Manutenção
                </TableCell>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '0.95rem',
                  backgroundColor: 'transparent',
                  py: 2,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  minWidth: 160
                }}>
                  Centros de Custo
                </TableCell>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '0.95rem',
                  backgroundColor: 'transparent',
                  py: 2,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  minWidth: 200
                }} align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
          <TableBody>
            {equipamentos.map((equipamento) => (
              <TableRow key={equipamento.equipamento_id} hover>
                <TableCell sx={{ fontWeight: 'medium' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {equipamento.alerta_manutencao && (
                      <Tooltip title="Manutenção vencida ou próxima">
                        <Warning color="error" />
                      </Tooltip>
                    )}
                    {equipamento.nome}
                  </Box>
                </TableCell>
                <TableCell>{equipamento.codigo_ativo}</TableCell>
                <TableCell>{equipamento.categoria}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {equipamento.horimetro_atual.toLocaleString()}h
                    </Typography>
                    {equipamento.data_ultima_leitura && (
                      <Typography variant="caption" color="textSecondary">
                        {new Date(equipamento.data_ultima_leitura).toLocaleDateString('pt-BR')}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(equipamento.status_equipamento)} 
                    color={getStatusColor(equipamento.status_equipamento)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    color={equipamento.horas_para_vencer <= 0 ? 'error' : 'textPrimary'}
                    fontWeight={equipamento.horas_para_vencer <= 0 ? 'bold' : 'normal'}
                  >
                    {equipamento.horas_para_vencer > 0 ? `${equipamento.horas_para_vencer}h` : `Vencida há ${Math.abs(equipamento.horas_para_vencer)}h`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(equipamento.centros_custo || []).map(centro => (
                      <Chip 
                        key={centro.centro_custo_id}
                        label={centro.nome}
                        size="small"
                        variant="outlined"
                        onDelete={() => removerAssociacao(equipamento.equipamento_id, centro.centro_custo_id)}
                        deleteIcon={<LinkOff />}
                      />
                    ))}
                    {(!equipamento.centros_custo || equipamento.centros_custo.length === 0) && (
                      <Typography variant="caption" color="textSecondary">
                        Sem associações
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 0.25, md: 0.5 },
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }}>
                    <Tooltip title="Editar equipamento">
                      <IconButton onClick={() => handleEdit(equipamento)} color="primary" size="small">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Atualizar horímetro">
                      <IconButton onClick={() => abrirModalHorimetro(equipamento)} color="info" size="small">
                        <Speed />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Registrar manutenção">
                      <IconButton onClick={() => abrirModalManutencao(equipamento)} color="warning" size="small">
                        <Build />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Associar centro de custo">
                      <IconButton onClick={() => abrirModalAssociacao(equipamento)} color="success" size="small">
                        <Link />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Visualizar detalhes">
                      <IconButton onClick={() => {}} color="info" size="small">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Excluir equipamento">
                      <IconButton 
                        onClick={() => handleDelete(equipamento.equipamento_id)} 
                        color="error" 
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {equipamentos.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    Nenhum equipamento encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </Box>
      </Paper>

      {/* Modal de Criação/Edição de Equipamento */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            margin: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: '100%' },
            maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 64px)' }
          }
        }}
      >
        <DialogTitle sx={{ pb: { xs: 1, sm: 2 } }}>
          {editId ? 'Editar Equipamento' : 'Novo Equipamento'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2 } }}>
            <TextField
              label="Nome *"
              fullWidth
              value={nome}
              onChange={e => setNome(e.target.value)}
              error={!nome.trim()}
              helperText={!nome.trim() ? 'Nome é obrigatório' : ''}
              size={window.innerWidth < 600 ? "small" : "medium"}
            />
            
            <TextField
              label="Código Ativo *"
              fullWidth
              value={codigoAtivo}
              onChange={e => setCodigoAtivo(e.target.value)}
              error={!codigoAtivo.trim()}
              helperText={!codigoAtivo.trim() ? 'Código Ativo é obrigatório e único' : ''}
            />
            
            <FormControl fullWidth error={!categoriaId}>
              <InputLabel>Categoria *</InputLabel>
              <Select
                value={categoriaId}
                label="Categoria *"
                onChange={e => setCategoriaId(e.target.value as number)}
              >
                {categorias.map(categoria => (
                  <MenuItem key={categoria.categoria_id} value={categoria.categoria_id}>
                    {categoria.nome}
                  </MenuItem>
                ))}
              </Select>
              {!categoriaId && <Typography variant="caption" color="error" sx={{ ml: 2 }}>Categoria é obrigatória</Typography>}
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Horímetro Atual"
                type="number"
                value={horimetroAtual}
                onChange={e => setHorimetroAtual(e.target.value ? Number(e.target.value) : '')}
                helperText="Padrão: 0"
                sx={{ flex: 1 }}
              />
              
              <TextField
                label="KM Atual"
                type="number"
                value={kmAtual}
                onChange={e => setKmAtual(e.target.value ? Number(e.target.value) : '')}
                helperText="Opcional"
                sx={{ flex: 1 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusEquipamento}
                  label="Status"
                  onChange={e => setStatusEquipamento(e.target.value as 'ativo' | 'manutencao' | 'parado')}
                >
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="manutencao">Manutenção</MenuItem>
                  <MenuItem value="parado">Parado</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Intervalo Manutenção (horas)"
                type="number"
                value={intervaloManutencao}
                onChange={e => setIntervaloManutencao(e.target.value ? Number(e.target.value) : '')}
                helperText="Padrão: 250h"
                sx={{ flex: 1 }}
              />
            </Box>
            
            <TextField
              label="Observações"
              fullWidth
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              multiline
              minRows={2}
              helperText="Opcional"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={loading || !nome.trim() || !codigoAtivo.trim() || !categoriaId}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Atualização de Horímetro */}
      <Dialog open={horimetroModalOpen} onClose={() => setHorimetroModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Atualizar Horímetro</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Equipamento: {equipamentoSelecionado?.nome}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Horímetro atual: {equipamentoSelecionado?.horimetro_atual}h
            </Typography>
            
            <TextField
              label="Novo Horímetro *"
              type="number"
              fullWidth
              value={novoHorimetro}
              onChange={e => setNovoHorimetro(e.target.value ? Number(e.target.value) : '')}
              error={Number(novoHorimetro) < (equipamentoSelecionado?.horimetro_atual || 0)}
              helperText={Number(novoHorimetro) < (equipamentoSelecionado?.horimetro_atual || 0) ? 'Horímetro deve ser >= horímetro atual' : ''}
            />
            
            <TextField
              label="Data da Leitura"
              type="date"
              fullWidth
              value={dataLeitura}
              onChange={e => setDataLeitura(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Observações"
              fullWidth
              value={observacoesHorimetro}
              onChange={e => setObservacoesHorimetro(e.target.value)}
              multiline
              minRows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHorimetroModalOpen(false)}>Cancelar</Button>
          <Button 
            onClick={atualizarHorimetro} 
            variant="contained"
            disabled={loading || !novoHorimetro || Number(novoHorimetro) < (equipamentoSelecionado?.horimetro_atual || 0)}
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Registro de Manutenção */}
      <Dialog open={manutencaoModalOpen} onClose={() => setManutencaoModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Manutenção</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Equipamento: {equipamentoSelecionado?.nome}
            </Typography>
            
            <TextField
              label="Horímetro da Manutenção *"
              type="number"
              fullWidth
              value={horimetroManutencao}
              onChange={e => setHorimetroManutencao(e.target.value ? Number(e.target.value) : '')}
            />
            
            <TextField
              label="Data da Manutenção"
              type="date"
              fullWidth
              value={dataManutencao}
              onChange={e => setDataManutencao(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Tipo de Revisão *"
              fullWidth
              value={tipoRevisao}
              onChange={e => setTipoRevisao(e.target.value)}
              placeholder="Ex: Manutenção preventiva, Troca de óleo, etc."
            />
            
            <TextField
              label="Novo Intervalo (horas)"
              type="number"
              fullWidth
              value={novoIntervalo}
              onChange={e => setNovoIntervalo(e.target.value ? Number(e.target.value) : '')}
              helperText="Intervalo para próxima manutenção"
            />
            
            <TextField
              label="Observações"
              fullWidth
              value={observacoesManutencao}
              onChange={e => setObservacoesManutencao(e.target.value)}
              multiline
              minRows={2}
              placeholder="Descreva os serviços realizados..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManutencaoModalOpen(false)}>Cancelar</Button>
          <Button 
            onClick={registrarManutencao} 
            variant="contained"
            disabled={loading || !horimetroManutencao || !tipoRevisao.trim()}
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Associação com Centro de Custo */}
      <Dialog open={associacaoModalOpen} onClose={() => setAssociacaoModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Associar a Centro de Custo</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Equipamento: {equipamentoSelecionado?.nome}
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Centro de Custo *</InputLabel>
              <Select
                value={centroCustoAssociacao}
                label="Centro de Custo *"
                onChange={e => setCentroCustoAssociacao(e.target.value as number)}
              >
                {centrosCusto.map(centro => (
                  <MenuItem key={centro.centro_custo_id} value={centro.centro_custo_id}>
                    {centro.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Data de Associação"
              type="date"
              fullWidth
              value={dataAssociacao}
              onChange={e => setDataAssociacao(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Observações"
              fullWidth
              value={observacoesAssociacao}
              onChange={e => setObservacoesAssociacao(e.target.value)}
              multiline
              minRows={2}
              placeholder="Ex: Equipamento transferido para obra..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssociacaoModalOpen(false)}>Cancelar</Button>
          <Button 
            onClick={associarCentroCusto} 
            variant="contained"
            disabled={loading || !centroCustoAssociacao}
          >
            {loading ? 'Associando...' : 'Associar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EquipamentosPage;
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Typography, Container, Box, Chip, Alert, Snackbar, FormControlLabel, Switch,
  CircularProgress
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Business } from '@mui/icons-material';

// Interface para Centro de Custo conforme API
interface CentroCusto {
  centro_custo_id: number;
  nome: string;
  codigo?: string;
  responsavel?: string;
  localizacao?: string;
  ativo: boolean;
  observacao?: string;
  email_responsavel?: string;
  criado_em: string;
  total_equipamentos?: number;
  descricao?: string;
  orcamento_anual?: number;
  created_at?: string;
  updated_at?: string;
  veiculos?: Array<{ count: number }>;
  abastecimentos?: Array<{ count: number }>;
  equipamentos_com_alerta?: number;
  total_abastecimentos_mes?: number;
  custo_combustivel_mes?: number;
  categorias?: Array<{
    categoria_id: number;
    nome: string;
    descricao: string;
    criado_em: string;
  }>;
  equipamentos?: Array<{
    equipamento_id: number;
    nome: string;
    codigo_ativo: string;
    status_equipamento: string;
    alerta_manutencao: boolean;
    data_associacao: string;
  }>;
}

const CentroCustoPage: React.FC = () => {
  const [centros, setCentros] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Estados do modal de visualização
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewCentro, setViewCentro] = useState<CentroCusto | null>(null);
  
  // Estados do modal
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [observacao, setObservacao] = useState('');
  const [emailResponsavel, setEmailResponsavel] = useState('');
  const [criadoEm, setCriadoEm] = useState('');

  // Estados de feedback
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    nome: '',
    ativo: 'todos',
    responsavel: ''
  });

  // Carregar dados ao montar componente
  useEffect(() => {
    carregarCentros();
  }, [filtros]);

  const carregarCentros = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      
      // Aplicar filtros
      if (filtros.nome) params.append('nome', filtros.nome);
      if (filtros.ativo !== 'todos') params.append('ativo', filtros.ativo);
      if (filtros.responsavel) params.append('responsavel', filtros.responsavel);

      const response = await fetch(`http://localhost:3001/api/centros-custo?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setCentros(result.data);
        // Carregar total de equipamentos para cada centro
        await carregarTotalEquipamentos(result.data);
      } else {
        setSnackbar({ open: true, message: 'Erro ao carregar centros de custo', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro de conexão', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const carregarTotalEquipamentos = async (centrosList: CentroCusto[]) => {
    const token = localStorage.getItem('authToken');
    
    // Processar cada centro de custo
    const centrosComEquipamentos = await Promise.all(
      centrosList.map(async (centro) => {
        try {
          setLoadingEquipamentos(prev => new Set(prev).add(centro.centro_custo_id));
          
          const response = await fetch(`http://localhost:3001/api/centros-custo/${centro.centro_custo_id}/equipamentos`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const equipamentosResult = await response.json();
            return {
              ...centro,
              total_equipamentos: equipamentosResult.success ? equipamentosResult.total : 0
            };
          } else {
            return {
              ...centro,
              total_equipamentos: 0
            };
          }
        } catch (error) {
          console.error(`Erro ao carregar equipamentos do centro ${centro.centro_custo_id}:`, error);
          return {
            ...centro,
            total_equipamentos: 0
          };
        } finally {
          setLoadingEquipamentos(prev => {
            const newSet = new Set(prev);
            newSet.delete(centro.centro_custo_id);
            return newSet;
          });
        }
      })
    );

    setCentros(centrosComEquipamentos);
  };

  const handleOpen = () => {
    setEditId(null);
    setNome('');
    setCodigo('');
    setResponsavel('');
    setLocalizacao('');
    setAtivo(true);
    setObservacao('');
    setEmailResponsavel('');
    setCriadoEm('');
    setOpen(true);
  };

  const handleEdit = (centro: CentroCusto) => {
    setEditId(centro.centro_custo_id);
    setNome(centro.nome);
    setCodigo(centro.codigo || '');
    setResponsavel(centro.responsavel || '');
    setLocalizacao(centro.localizacao || '');
    setAtivo(centro.ativo);
    setObservacao(centro.observacao || '');
    setEmailResponsavel(centro.email_responsavel || '');
    setCriadoEm(centro.criado_em);
    setOpen(true);
  };

  const handleView = (centro: CentroCusto) => {
    setViewCentro(centro);
    setViewModalOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      setSnackbar({ open: true, message: 'Nome é obrigatório', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const data = {
        nome: nome.trim(),
        codigo: codigo.trim() || undefined,
        responsavel: responsavel.trim() || undefined,
        localizacao: localizacao.trim() || undefined,
        ativo,
        observacao: observacao.trim() || undefined,
        email_responsavel: emailResponsavel.trim() || undefined
      };

      const url = editId ? `http://localhost:3001/api/centros-custo/${editId}` : 'http://localhost:3001/api/centros-custo';
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
          message: editId ? 'Centro de custo atualizado!' : 'Centro de custo criado!', 
          severity: 'success' 
        });
        setOpen(false);
        carregarCentros();
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
    if (!window.confirm('Tem certeza que deseja excluir este centro de custo?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/centros-custo/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setSnackbar({ open: true, message: 'Centro de custo excluído!', severity: 'success' });
        carregarCentros();
      } else {
        setSnackbar({ open: true, message: result.message || 'Erro ao excluir', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro de conexão', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => setOpen(false);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Business color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Centros de Custo
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={handleOpen}
          disabled={loading}
        >
          Novo Centro de Custo
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Buscar por nome"
            value={filtros.nome}
            onChange={e => setFiltros(f => ({ ...f, nome: e.target.value }))}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Responsável"
            value={filtros.responsavel}
            onChange={e => setFiltros(f => ({ ...f, responsavel: e.target.value }))}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <Button
            variant={filtros.ativo === 'true' ? 'contained' : 'outlined'}
            color={filtros.ativo === 'true' ? 'success' : 'inherit'}
            onClick={() => setFiltros(f => ({ ...f, ativo: f.ativo === 'true' ? 'todos' : 'true' }))}
          >
            {filtros.ativo === 'true' ? 'Mostrando apenas ativos' : 'Mostrar apenas ativos'}
          </Button>
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
                  Nome
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
                  Código
                </TableCell>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '0.95rem',
                  backgroundColor: 'transparent',
                  py: 2,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  minWidth: 150
                }}>
                  Responsável
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
                  Localização
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
                  Total Equipamentos
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
                  Criado em
                </TableCell>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '0.95rem',
                  backgroundColor: 'transparent',
                  py: 2,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  minWidth: 160
                }} align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
          <TableBody>
            {centros.map((centro) => (
              <TableRow key={centro.centro_custo_id} hover>
                <TableCell sx={{ fontWeight: 'medium' }}>{centro.nome}</TableCell>
                <TableCell>{centro.codigo || '-'}</TableCell>
                <TableCell>{centro.responsavel || '-'}</TableCell>
                <TableCell>{centro.localizacao || '-'}</TableCell>
                <TableCell>
                  <Chip 
                    label={centro.ativo ? 'Ativo' : 'Inativo'} 
                    color={centro.ativo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {loadingEquipamentos.has(centro.centro_custo_id) ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="textSecondary">
                        Carregando...
                      </Typography>
                    </Box>
                  ) : (
                    <Chip 
                      label={centro.total_equipamentos ?? 0}
                      color={centro.total_equipamentos && centro.total_equipamentos > 0 ? 'primary' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {new Date(centro.criado_em).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleEdit(centro)} color="primary" size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleView(centro)} color="info" size="small">
                    <Visibility />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(centro.centro_custo_id)} 
                    color="error" 
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {centros.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    Nenhum centro de custo encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </Box>
      </Paper>

      {/* Modal de Criação/Edição */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editId ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nome *"
              fullWidth
              value={nome}
              onChange={e => setNome(e.target.value)}
              error={!nome.trim()}
              helperText={!nome.trim() ? 'Nome é obrigatório' : ''}
            />
            <TextField
              label="Código"
              fullWidth
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              helperText="Opcional, mas deve ser único se fornecido"
            />
            <TextField
              label="Responsável"
              fullWidth
              value={responsavel}
              onChange={e => setResponsavel(e.target.value)}
            />
            <TextField
              label="Localização"
              fullWidth
              value={localizacao}
              onChange={e => setLocalizacao(e.target.value)}
            />
            <TextField
              label="E-mail do responsável"
              fullWidth
              value={emailResponsavel}
              onChange={e => setEmailResponsavel(e.target.value)}
              type="email"
            />
            <TextField
              label="Observação"
              fullWidth
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              multiline
              minRows={2}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={ativo}
                  onChange={e => setAtivo(e.target.checked)}
                  color="primary"
                />
              }
              label="Centro de custo ativo"
            />
            {editId && criadoEm && (
              <TextField
                label="Criado em"
                fullWidth
                value={new Date(criadoEm).toLocaleString('pt-BR')}
                disabled
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={loading || !nome.trim()}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Visualização */}
      <Dialog 
        open={viewModalOpen} 
        onClose={() => setViewModalOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Business />
            <Typography variant="h6">Detalhes do Centro de Custo</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {viewCentro && (
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Informações Básicas */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Informações Básicas
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nome:
                    </Typography>
                    <Typography variant="body1">{viewCentro.nome}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Código:
                    </Typography>
                    <Typography variant="body1">{viewCentro.codigo || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Responsável:
                    </Typography>
                    <Typography variant="body1">{viewCentro.responsavel || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Localização:
                    </Typography>
                    <Typography variant="body1">{viewCentro.localizacao || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status:
                    </Typography>
                    <Chip 
                      label={viewCentro.ativo ? 'Ativo' : 'Inativo'} 
                      color={viewCentro.ativo ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Orçamento Anual:
                    </Typography>
                    <Typography variant="body1">
                      {viewCentro.orcamento_anual ? `€${viewCentro.orcamento_anual.toLocaleString()}` : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                
                {viewCentro.descricao && (
                  <Box sx={{ mt: 2, gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Descrição:
                    </Typography>
                    <Typography variant="body1">{viewCentro.descricao}</Typography>
                  </Box>
                )}
              </Paper>

              {/* Estatísticas Gerais */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Estatísticas Gerais
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total de Equipamentos:
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {viewCentro.total_equipamentos || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total de Veículos:
                    </Typography>
                    <Typography variant="h4" color="secondary">
                      {viewCentro.veiculos?.[0]?.count || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total de Abastecimentos:
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      {viewCentro.abastecimentos?.[0]?.count || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Equipamentos com Alerta:
                    </Typography>
                    <Typography variant="h4" color={(viewCentro.equipamentos_com_alerta || 0) > 0 ? "error" : "success"}>
                      {viewCentro.equipamentos_com_alerta || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Abastecimentos Este Mês:
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {viewCentro.total_abastecimentos_mes || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Custo Combustível (Mês):
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      €{(viewCentro.custo_combustivel_mes || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Categorias */}
              {viewCentro.categorias && viewCentro.categorias.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Categorias ({viewCentro.categorias.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {viewCentro.categorias.map((categoria) => (
                      <Chip
                        key={categoria.categoria_id}
                        label={categoria.nome}
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Equipamentos */}
              {viewCentro.equipamentos && viewCentro.equipamentos.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Equipamentos Associados ({viewCentro.equipamentos.length})
                  </Typography>
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {viewCentro.equipamentos.map((equipamento, index) => (
                      <Box key={equipamento.equipamento_id || index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 1,
                        mb: 1,
                        bgcolor: 'background.default',
                        borderRadius: 1
                      }}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {equipamento.nome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {equipamento.codigo_ativo} | {equipamento.status_equipamento}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {equipamento.alerta_manutencao && (
                            <Chip 
                              label="Alerta" 
                              color="error" 
                              size="small" 
                            />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Desde: {new Date(equipamento.data_associacao).toLocaleDateString('pt-BR')}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Informações de Sistema */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Informações do Sistema
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Data de Criação:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(viewCentro.criado_em || viewCentro.created_at || new Date()).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                  {viewCentro.updated_at && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Última Atualização:
                      </Typography>
                      <Typography variant="body1">
                        {new Date(viewCentro.updated_at).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      ID do Centro:
                    </Typography>
                    <Typography variant="body1">
                      {viewCentro.centro_custo_id}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)} variant="outlined">
            Fechar
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

export default CentroCustoPage;
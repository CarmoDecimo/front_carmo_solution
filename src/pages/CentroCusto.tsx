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
}

const CentroCustoPage: React.FC = () => {
  const [centros, setCentros] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
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
                  <IconButton onClick={() => {}} color="info" size="small">
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
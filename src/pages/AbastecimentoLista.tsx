import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button, Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Typography, Container, Box, Chip, Alert, Snackbar, CircularProgress,
  IconButton, TextField, Stack
} from '@mui/material';
import { Edit, Delete, Add, Visibility, LocalGasStation } from '@mui/icons-material';
import { abastecimentoService } from '../services/abastecimentoService';
import type { Abastecimento } from '../services/abastecimentoService';
import ConfirmDialog from '../components/common/ConfirmDialog';

const AbastecimentoListaPage: React.FC = () => {
  const navigate = useNavigate();
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Estados para modal de confirmação de exclusão
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    abastecimento: null as Abastecimento | null,
    loading: false
  });
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    operador: '',
    posto: '',
    dataInicio: '',
    dataFim: ''
  });

  // Carregar dados ao montar componente
  useEffect(() => {
    carregarAbastecimentos();
  }, []);

  const carregarAbastecimentos = async () => {
    setLoading(true);
    try {
      const response = await abastecimentoService.getAll();
      console.log('Dados recebidos da API:', response);
      
      // A API retorna { data: [...], page, pageSize, totalCount, totalPages }
      if (response && Array.isArray(response.data)) {
        setAbastecimentos(response.data);
      } else {
        console.warn('Formato de dados inesperado:', response);
        setAbastecimentos([]);
        setSnackbar({ open: true, message: 'Formato de dados inesperado da API', severity: 'error' });
      }
    } catch (error) {
      console.error('Erro ao carregar abastecimentos:', error);
      setAbastecimentos([]);
      setSnackbar({ open: true, message: 'Erro ao carregar abastecimentos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (abastecimento: Abastecimento) => {
    setDeleteDialog({
      open: true,
      abastecimento,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.abastecimento) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await abastecimentoService.delete(deleteDialog.abastecimento.id_abastecimento.toString());
      setSnackbar({ open: true, message: 'Abastecimento excluído com sucesso!', severity: 'success' });
      carregarAbastecimentos();
      setDeleteDialog({ open: false, abastecimento: null, loading: false });
    } catch (error) {
      console.error('Erro ao excluir abastecimento:', error);
      setSnackbar({ open: true, message: 'Erro ao excluir abastecimento', severity: 'error' });
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, abastecimento: null, loading: false });
  };

  const handleView = (abastecimento: Abastecimento) => {
    // TODO: Implementar modal de visualização ou página de detalhes
    console.log('Visualizar abastecimento:', abastecimento);
  };

  const handleEdit = (abastecimento: Abastecimento) => {
    // Navegar para a página de edição do abastecimento específico
    navigate(`/abastecimento/editar/${abastecimento.id_abastecimento}`);
  };


  // Filtrar abastecimentos
  const abastecimentosFiltrados = abastecimentos.filter(abastecimento => {
    const matchOperador = !filtros.operador || 
      abastecimento.operador.toLowerCase().includes(filtros.operador.toLowerCase());
    const matchPosto = !filtros.posto || 
      abastecimento.posto_abastecimento.toLowerCase().includes(filtros.posto.toLowerCase());
    
    let matchData = true;
    if (filtros.dataInicio || filtros.dataFim) {
      const dataAbastecimento = new Date(abastecimento.data_abastecimento);
      if (filtros.dataInicio) {
        matchData = matchData && dataAbastecimento >= new Date(filtros.dataInicio);
      }
      if (filtros.dataFim) {
        matchData = matchData && dataAbastecimento <= new Date(filtros.dataFim);
      }
    }
    
    return matchOperador && matchPosto && matchData;
  });


  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocalGasStation color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Centro de Abastecimento
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          component={Link}
          to="/abastecimento/adicionar"
          disabled={loading}
        >
          Adicionar Abastecimento
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Operador"
            value={filtros.operador}
            onChange={e => setFiltros(f => ({ ...f, operador: e.target.value }))}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Posto de Abastecimento"
            value={filtros.posto}
            onChange={e => setFiltros(f => ({ ...f, posto: e.target.value }))}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Data Início"
            type="date"
            value={filtros.dataInicio}
            onChange={e => setFiltros(f => ({ ...f, dataInicio: e.target.value }))}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Data Fim"
            type="date"
            value={filtros.dataFim}
            onChange={e => setFiltros(f => ({ ...f, dataFim: e.target.value }))}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="outlined"
            onClick={() => setFiltros({ operador: '', posto: '', dataInicio: '', dataFim: '' })}
          >
            Limpar Filtros
          </Button>
        </Stack>
      </Paper>

      {/* Tabela */}
      <Paper sx={{ overflow: 'hidden', boxShadow: 3 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        {!loading && (
          <Box sx={{ overflow: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: { xs: 800, md: 1200 } }}>
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
                    minWidth: 120
                  }}>
                    Data
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
                    Operador
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'white', 
                    fontWeight: 'bold', 
                    fontSize: '0.95rem',
                    backgroundColor: 'transparent',
                    py: 2,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    minWidth: 180
                  }}>
                    Posto de Abastecimento
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
                    Matrícula Ativo
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
                    Equipamentos
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
                    Total Litros
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
                    minWidth: 120
                  }}>
                    Protocolo
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
                {abastecimentosFiltrados.map((abastecimento) => (
                  <TableRow key={abastecimento.id_abastecimento} hover>
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {new Date(abastecimento.data_abastecimento).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{abastecimento.operador}</TableCell>
                    <TableCell>{abastecimento.posto_abastecimento}</TableCell>
                    <TableCell>{abastecimento.matricula_ativo}</TableCell>
                    <TableCell>
                      <Chip 
                        label={abastecimento.equipamentos_abastecimentos?.length || 0}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${abastecimento.quantidade_combustivel || 0} L`}
                        color="info"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{abastecimento.responsavel_abastecimento}</TableCell>
                    <TableCell>
                      {abastecimento.numero_protocolo ? (
                        <Chip 
                          label={abastecimento.numero_protocolo}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleEdit(abastecimento)} color="primary" size="small">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleView(abastecimento)} color="info" size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteClick(abastecimento)} 
                        color="error" 
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {abastecimentosFiltrados.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        {abastecimentos.length === 0 
                          ? 'Nenhum abastecimento encontrado' 
                          : 'Nenhum abastecimento corresponde aos filtros aplicados'
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

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

      {/* Modal de confirmação para exclusão */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Abastecimento"
        message="Tem certeza que deseja excluir este abastecimento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        severity="error"
        loading={deleteDialog.loading}
        destructive={true}
        itemDetails={deleteDialog.abastecimento ? [
          { label: 'Data', value: new Date(deleteDialog.abastecimento.data_abastecimento).toLocaleDateString('pt-BR') },
          { label: 'Operador', value: deleteDialog.abastecimento.operador },
          { label: 'Posto', value: deleteDialog.abastecimento.posto_abastecimento },
          { label: 'Matrícula', value: deleteDialog.abastecimento.matricula_ativo },
          { label: 'Responsável', value: deleteDialog.abastecimento.responsavel_abastecimento }
        ] : []}
        additionalInfo="Todos os dados relacionados a este abastecimento serão permanentemente removidos do sistema."
      />
    </Container>
  );
};

export default AbastecimentoListaPage;

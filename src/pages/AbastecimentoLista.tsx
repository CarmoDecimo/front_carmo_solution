import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button, Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Typography, Container, Box, Chip, Alert, Snackbar, CircularProgress,
  IconButton, TextField, Stack, useMediaQuery, Card, CardContent, Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Edit, Delete, Add, Download, LocalGasStation } from '@mui/icons-material';
import { abastecimentoService } from '../services/abastecimentoService';
import type { Abastecimento } from '../services/abastecimentoService';
import ConfirmDialog from '../components/common/ConfirmDialog';

const AbastecimentoListaPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  const handleDownload = async (abastecimento: Abastecimento) => {
    console.log('📥 === FUNÇÃO handleDownload EXECUTADA ===');
    console.log('📊 Abastecimento recebido:', abastecimento);
    console.log('🆔 ID do abastecimento:', abastecimento.id_abastecimento);
    
    try {
      // Fazer requisição para download do abastecimento usando a nova rota
      console.log('🔄 Iniciando requisição para download...');
      const blob = await abastecimentoService.downloadAbastecimento(abastecimento.id_abastecimento.toString());
      
      console.log('📦 Blob recebido:', blob);
      console.log('📏 Tamanho do blob:', blob.size, 'bytes');
      console.log('🏷️ Tipo do blob:', blob.type);
      
      // Verificar se o blob não está vazio
      if (blob.size === 0) {
        throw new Error('O arquivo baixado está vazio. Verifique se os dados do abastecimento existem na API.');
      }
      
      // Criar e baixar arquivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Definir nome do arquivo baseado na data e ID do abastecimento
      const dataFormatada = new Date(abastecimento.data_abastecimento).toISOString().split('T')[0];
      const nomeArquivo = `abastecimento_${abastecimento.id_abastecimento}_${dataFormatada}.xlsx`;
      link.download = nomeArquivo;
      
      console.log('💾 Nome do arquivo:', nomeArquivo);
      
      // Executar download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Download executado com sucesso!');
      
      setSnackbar({
        open: true,
        message: `Download do abastecimento ${abastecimento.id_abastecimento} realizado com sucesso!`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('❌ Erro ao fazer download do abastecimento:', error);
      
      // Extrair mensagem de erro mais detalhada
      let errorMessage = 'Erro ao fazer download do abastecimento';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('📝 Mensagem de erro detalhada:', errorMessage);
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
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

      {/* Conteúdo Responsivo */}
      {loading && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Carregando abastecimentos...</Typography>
        </Paper>
      )}
      
      {!loading && isMobile ? (
        // Layout Mobile - Cards
        <Grid container spacing={2}>
          {abastecimentosFiltrados.map((abastecimento) => (
            <Grid key={abastecimento.id_abastecimento} size={12}>
              <Card sx={{ mb: 2, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {new Date(abastecimento.data_abastecimento).toLocaleDateString('pt-BR')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton onClick={() => handleEdit(abastecimento)} color="primary" size="small">
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => setDeleteDialog({ open: true, abastecimento, loading: false })} 
                        color="error" 
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Operador</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{abastecimento.operador}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">Posto de Abastecimento</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{abastecimento.posto_abastecimento}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">Matrícula Ativo</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{abastecimento.matricula_ativo}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Equipamentos</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip 
                            label={abastecimento.equipamentos_abastecimentos?.length || 0}
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">Total Litros</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip 
                            label={`${abastecimento.quantidade_combustivel || 0} L`}
                            color="info"
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">Responsável</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{abastecimento.responsavel_abastecimento}</Typography>
                    </Box>
                    
                    {abastecimento.numero_protocolo && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">Protocolo</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip 
                            label={abastecimento.numero_protocolo}
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          {abastecimentosFiltrados.length === 0 && (
            <Grid size={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  {abastecimentos.length === 0 
                    ? 'Nenhum abastecimento encontrado' 
                    : 'Nenhum abastecimento corresponde aos filtros aplicados'
                  }
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        // Layout Desktop - Tabela
        <Paper sx={{ overflow: 'hidden', boxShadow: 3 }}>
          <Box sx={{ overflow: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: 1200 }}>
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
                      <IconButton onClick={() => handleDownload(abastecimento)} color="success" size="small">
                        <Download />
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
        </Paper>
      )}

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

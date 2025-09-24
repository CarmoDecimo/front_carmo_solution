import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button, Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Typography, Container, Box, Chip, Alert, Snackbar, CircularProgress,
  IconButton, TextField, Stack, useMediaQuery, Card, CardContent, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Edit, Add, Download, LocalGasStation, Visibility } from '@mui/icons-material';
import { abastecimentoService } from '../services/abastecimentoService';
import type { Abastecimento } from '../services/abastecimentoService';
import { userService } from '../services/userService';

const AbastecimentoListaPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Estados para modal de visualização
  const [viewDialog, setViewDialog] = useState({
    open: false,
    abastecimento: null as Abastecimento | null
  });
  
  // Estado para nome do criador
  const [criadorNome, setCriadorNome] = useState<string>('');
  
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

  const handleView = async (abastecimento: Abastecimento) => {
    setViewDialog({
      open: true,
      abastecimento
    });
    
    // Buscar nome do criador se tiver ID
    if (abastecimento.criado_por) {
      try {
        const user = await userService.getById(abastecimento.criado_por);
        setCriadorNome(user.nome);
      } catch (error) {
        console.error('Erro ao buscar dados do criador:', error);
        setCriadorNome('Usuário não encontrado');
      }
    } else {
      setCriadorNome('N/A');
    }
  };

  const handleViewClose = () => {
    setViewDialog({ open: false, abastecimento: null });
    setCriadorNome('');
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
          to="/abastecimento/turnos"
          disabled={loading}
        >
          ABRIR NOVO TURNO
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
                      <IconButton onClick={() => handleView(abastecimento)} color="info" size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(abastecimento)} color="primary" size="small">
                        <Edit />
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
                    <TableCell align="center">
                      <IconButton onClick={() => handleView(abastecimento)} color="info" size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(abastecimento)} color="primary" size="small">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDownload(abastecimento)} color="success" size="small">
                        <Download />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {abastecimentosFiltrados.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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

      {/* Modal de Visualização */}
      <Dialog 
        open={viewDialog.open} 
        onClose={handleViewClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Detalhes do Abastecimento - {viewDialog.abastecimento?.posto_abastecimento}
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {viewDialog.abastecimento && (
            <Stack spacing={3}>
              {/* Informações Gerais */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                  Informações Gerais
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Data do Abastecimento</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(viewDialog.abastecimento.data_abastecimento).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Operador</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {viewDialog.abastecimento.operador}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={12}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Posto de Abastecimento</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {viewDialog.abastecimento.posto_abastecimento}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Combustível e Custos */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                  Combustível e Custos
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={4}>
                    <Box sx={{ 
                      p: 2.5, 
                      bgcolor: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
                      borderRadius: 2, 
                      textAlign: 'center', 
                      border: 2, 
                      borderColor: '#1976d2',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}>
                      <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Existência Início
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0d47a1', mt: 0.5 }}>
                        {viewDialog.abastecimento.existencia_inicio} L
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={4}>
                    <Box sx={{ 
                      p: 2.5, 
                      bgcolor: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)', 
                      borderRadius: 2, 
                      textAlign: 'center', 
                      border: 2, 
                      borderColor: '#f57c00',
                      boxShadow: '0 2px 8px rgba(245, 124, 0, 0.2)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}>
                      <Typography variant="caption" sx={{ color: '#ef6c00', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Entrada Combustível
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#e65100', mt: 0.5 }}>
                        {viewDialog.abastecimento.entrada_combustivel} L
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={4}>
                    <Box sx={{ 
                      p: 2.5, 
                      bgcolor: 'linear-gradient(135deg, #e8f5e8 0%, #a5d6a7 100%)', 
                      borderRadius: 2, 
                      textAlign: 'center', 
                      border: 2, 
                      borderColor: '#388e3c',
                      boxShadow: '0 2px 8px rgba(56, 142, 60, 0.2)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}>
                      <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Existência Final
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1b5e20', mt: 0.5 }}>
                        {viewDialog.abastecimento.existencia_fim} L
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ 
                      p: 2.5, 
                      bgcolor: 'action.hover',
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': { 
                        transform: 'translateY(-1px)',
                        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.12)'
                      }
                    }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Quantidade Combustível
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', mt: 0.5 }}>
                        {viewDialog.abastecimento.quantidade_combustivel || 0} L
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Responsáveis */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                  Responsáveis
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Responsável Abastecimento</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {viewDialog.abastecimento.responsavel_abastecimento}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Criado Por</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {criadorNome || 'Carregando...'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Equipamentos */}
              {viewDialog.abastecimento.equipamentos_abastecimentos && viewDialog.abastecimento.equipamentos_abastecimentos.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                    Equipamentos ({viewDialog.abastecimento.equipamentos_abastecimentos.length})
                  </Typography>
                  <Stack spacing={2}>
                    {viewDialog.abastecimento.equipamentos_abastecimentos.map((equipamento, index) => (
                      <Paper key={equipamento.id || index} sx={{ p: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={3}>
                            <Typography variant="caption" color="text.secondary">Equipamento</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {equipamento.equipamento}
                            </Typography>
                          </Grid>
                          <Grid size={2}>
                            <Typography variant="caption" color="text.secondary">Ativo</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {equipamento.activo}
                            </Typography>
                          </Grid>
                          <Grid size={2}>
                            <Typography variant="caption" color="text.secondary">KM/H</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {equipamento.kmh || 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid size={2}>
                            <Typography variant="caption" color="text.secondary">Quantidade</Typography>
                            <Chip 
                              label={`${equipamento.quantidade} L`}
                              color="info"
                              size="small"
                            />
                          </Grid>
                          <Grid size={3}>
                            <Typography variant="caption" color="text.secondary">Assinatura</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {equipamento.assinatura}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}

              <Divider />

              {/* Informações de Sistema */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                  Informações do Sistema
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Criado em</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {new Date(viewDialog.abastecimento.criado_em).toLocaleString('pt-BR')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Última Atualização</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {new Date(viewDialog.abastecimento.updated_at).toLocaleString('pt-BR')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleViewClose} variant="contained" color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AbastecimentoListaPage;

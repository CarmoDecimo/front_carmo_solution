import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
} from '@mui/icons-material';
import { centroCustoService } from '../services';
import type { CentroCusto } from '../services';

const CentrosCustoPage: React.FC = () => {
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [centroCustoDetalhes, setCentroCustoDetalhes] = useState<CentroCusto | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    carregarCentrosCusto();
  }, []);

  // Debug do modal
  useEffect(() => {
    console.log('=== DEBUG: Modal state changed ===');
    console.log('viewModalOpen:', viewModalOpen);
    console.log('centroCustoDetalhes:', centroCustoDetalhes);
  }, [viewModalOpen, centroCustoDetalhes]);

  const carregarCentrosCusto = async () => {
    setLoading(true);
    try {
      const centros = await centroCustoService.getAll();
      console.log('=== DEBUG: Centros carregados ===');
      console.log('Centros:', centros);
      console.log('Primeiro centro:', centros[0]);
      setCentrosCusto(centros);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar centros de custo',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (centro: CentroCusto) => {
    console.log('📥 === FUNÇÃO handleDownload EXECUTADA ===');
    console.log('📊 Centro recebido:', centro);
    
    setLoading(true);
    
    try {
      // Use o ID disponível (pode ser 'id' para lista ou 'centro_custo_id' para detalhes)
      const centroId = centro.id || centro.centro_custo_id?.toString() || '';
      
      if (!centroId) {
        throw new Error('ID do centro de custo não encontrado');
      }
      
      // Fazer requisição para exportar horímetros usando a nova rota
      const blob = await centroCustoService.exportarHorimetros(centroId);
      
      // Criar e baixar arquivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Definir nome do arquivo baseado no código do centro
      link.download = `horimetros_centro_custo_${centro.codigo}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Executar download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Download de horímetros realizado com sucesso!',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Erro ao fazer download dos horímetros:', error);
      
      // Extrair mensagem de erro mais detalhada
      let errorMessage = 'Erro ao fazer download dos horímetros';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fecharModalVisualizacao = () => {
    console.log('=== DEBUG: Fechando modal ===');
    setViewModalOpen(false);
    setCentroCustoDetalhes(null);
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Centros de Custo
          </Typography>
        </Box>

        {/* Lista de Centros de Custo */}
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {centrosCusto.map((centro, index) => {
                      console.log(`🏢 Renderizando centro ${index}:`, centro);
                      return (
                      <TableRow key={centro.id || centro.centro_custo_id || centro.codigo}>
                        <TableCell>{centro.codigo}</TableCell>
                        <TableCell>{centro.nome}</TableCell>
                        <TableCell>{centro.descricao || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={centro.ativo ? 'Ativo' : 'Inativo'}
                            color={centro.ativo ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Baixar dados">
                            <IconButton 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🖱️ BOTÃO DOWNLOAD CLICADO');
                                console.log('📊 Centro para download:', centro);
                                handleDownload(centro);
                              }} 
                              color="success" 
                              size="small"
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Modal de Detalhes do Centro de Custo */}
        <Dialog
          open={viewModalOpen}
          onClose={fecharModalVisualizacao}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              Detalhes do Centro de Custo
            </Typography>
          </DialogTitle>
          <DialogContent>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : centroCustoDetalhes ? (
              <Box sx={{ pt: 2 }}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Informações Básicas
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Nome:
                        </Typography>
                        <Typography variant="body1">
                          {centroCustoDetalhes.nome || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Código:
                        </Typography>
                        <Typography variant="body1">
                          {centroCustoDetalhes.codigo || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Descrição:
                        </Typography>
                        <Typography variant="body1">
                          {centroCustoDetalhes.descricao || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Status:
                        </Typography>
                        <Chip 
                          label={centroCustoDetalhes.ativo ? 'Ativo' : 'Inativo'} 
                          color={centroCustoDetalhes.ativo ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                
                {/* Informações adicionais se existirem */}
                {(centroCustoDetalhes.created_at || (centroCustoDetalhes as any).updated_at) && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Histórico
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {centroCustoDetalhes.created_at && (
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Data de Criação:
                            </Typography>
                            <Typography variant="body1">
                              {new Date(centroCustoDetalhes.created_at).toLocaleDateString('pt-BR')}
                            </Typography>
                          </Box>
                        )}
                        {(centroCustoDetalhes as any).updated_at && (
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Última Atualização:
                            </Typography>
                            <Typography variant="body1">
                              {new Date((centroCustoDetalhes as any).updated_at).toLocaleDateString('pt-BR')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            ) : (
              <Typography color="text.secondary">
                Nenhum detalhe disponível
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={fecharModalVisualizacao} variant="outlined">
              Fechar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={closeSnackbar}
        >
          <Alert
            onClose={closeSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default CentrosCustoPage;
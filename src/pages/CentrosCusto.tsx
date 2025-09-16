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
  Visibility as ViewIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { centroCustoService } from '../services';
import type { CentroCusto } from '../services';

const CentrosCustoPage: React.FC = () => {
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState<Set<string>>(new Set());
  const [selectedCentro, setSelectedCentro] = useState<CentroCusto | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    carregarCentrosCusto();
  }, []);

  const carregarCentrosCusto = async () => {
    setLoading(true);
    try {
      const centros = await centroCustoService.getAll();
      setCentrosCusto(centros);
      
      // Carregar total de equipamentos para cada centro de custo
      await carregarTotalEquipamentos(centros);
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

  const carregarTotalEquipamentos = async (centros: CentroCusto[]) => {
    const promises = centros.map(async (centro) => {
      try {
        const centroId = centro.id || centro.centro_custo_id?.toString();
        if (!centroId) return centro;
        
        setLoadingEquipamentos(prev => new Set(prev).add(centroId));
        const equipamentosResponse = await centroCustoService.getEquipamentos(centroId);
        return {
          ...centro,
          total_equipamentos: equipamentosResponse.total
        };
      } catch (error) {
        console.error(`Erro ao carregar equipamentos do centro ${centro.id}:`, error);
        return {
          ...centro,
          total_equipamentos: 0
        };
      } finally {
        const centroId = centro.id || centro.centro_custo_id?.toString();
        if (centroId) {
          setLoadingEquipamentos(prev => {
            const newSet = new Set(prev);
            newSet.delete(centroId);
            return newSet;
          });
        }
      }
    });

    try {
      const centrosComEquipamentos = await Promise.all(promises);
      setCentrosCusto(centrosComEquipamentos);
    } catch (error) {
      console.error('Erro ao carregar totais de equipamentos:', error);
    }
  };

  const handleViewDetails = async (centro: CentroCusto) => {
    setSelectedCentro(centro);
  };

  const fecharModalVisualizacao = () => {
    setSelectedCentro(null);
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
                      <TableCell>Total Equipamentos</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {centrosCusto.map((centro) => (
                      <TableRow key={centro.id || centro.centro_custo_id || centro.codigo}>
                        <TableCell>{centro.codigo}</TableCell>
                        <TableCell>{centro.nome}</TableCell>
                        <TableCell>{centro.descricao || '-'}</TableCell>
                        <TableCell>
                          {(() => {
                            const centroId = centro.id || centro.centro_custo_id?.toString();
                            return loadingEquipamentos.has(centroId || '') ? (
                              <CircularProgress size={16} />
                            ) : (
                              <Chip 
                                label={centro.total_equipamentos ?? '-'}
                                color={centro.total_equipamentos && centro.total_equipamentos > 0 ? 'primary' : 'default'}
                                size="small"
                              />
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={centro.ativo ? 'Ativo' : 'Inativo'}
                            color={centro.ativo ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Visualizar detalhes">
                            <IconButton 
                              onClick={() => handleViewDetails(centro)} 
                              color="info" 
                              size="small"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Modal de Detalhes */}
        {selectedCentro && (
          <Dialog
            open={Boolean(selectedCentro)}
            onClose={() => setSelectedCentro(null)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon />
                Detalhes: {selectedCentro.nome}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Código:</strong> {selectedCentro.codigo}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Nome:</strong> {selectedCentro.nome}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Descrição:</strong> {selectedCentro.descricao || 'Não informado'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Total de Equipamentos:</strong> {selectedCentro.total_equipamentos ?? 'Carregando...'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Status:</strong> {selectedCentro.ativo ? 'Ativo' : 'Inativo'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Data de Criação:</strong> {new Date(selectedCentro.created_at).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
            </DialogContent>
          <DialogActions>
            <Button onClick={fecharModalVisualizacao}>Fechar</Button>
          </DialogActions>
        </Dialog>
        )}

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
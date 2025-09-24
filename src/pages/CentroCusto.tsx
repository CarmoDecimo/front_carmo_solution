import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Typography, Container, Box, Chip, Alert, Snackbar, FormControlLabel, Switch,
  CircularProgress
} from '@mui/material';
import { Edit, Delete, Add, Download, AccountBalance } from '@mui/icons-material';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { buildApiUrl, getAuthHeaders } from '../config/api';

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
  
  // Estados para modal de confirmação de exclusão
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    centro: null as CentroCusto | null,
    loading: false
  });
  
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
      const params = new URLSearchParams();
      
      // Aplicar filtros
      if (filtros.nome) params.append('nome', filtros.nome);
      if (filtros.ativo !== 'todos') params.append('ativo', filtros.ativo);
      if (filtros.responsavel) params.append('responsavel', filtros.responsavel);

      const response = await fetch(`${buildApiUrl('/api/centros-custo')}?${params}`, {
        headers: getAuthHeaders()
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
    
    // Processar cada centro de custo
    const centrosComEquipamentos = await Promise.all(
      centrosList.map(async (centro) => {
        try {
          setLoadingEquipamentos(prev => new Set(prev).add(centro.centro_custo_id));
          
          const response = await fetch(buildApiUrl(`/api/centros-custo/${centro.centro_custo_id}/equipamentos`), {
            headers: getAuthHeaders()
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

  const handleDownload = async (centro: CentroCusto) => {
    console.log('📥 === FUNÇÃO handleDownload EXECUTADA ===');
    console.log('📊 Centro recebido:', centro);
    
    setLoading(true);
    
    try {
      // Fazer requisição para exportar horímetros usando a nova rota
      const response = await fetch(buildApiUrl(`/api/abastecimentos/exportar-horimetros/${centro.centro_custo_id}`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('📡 Status da resposta:', response.status);
      console.log('📡 Headers da resposta:', response.headers);

      if (!response.ok) {
        // Tentar obter mais detalhes do erro
        let errorMessage = `Erro ao exportar horímetros: ${response.status} ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          console.log('❌ Detalhes do erro do servidor:', errorText);
          
          // Tentar parsear como JSON para obter mais detalhes
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.message) {
              errorMessage += ` - ${errorJson.message}`;
            }
          } catch {
            // Se não for JSON válido, usar o texto completo
            if (errorText) {
              errorMessage += ` - ${errorText}`;
            }
          }
        } catch (textError) {
          console.log('❌ Erro ao ler detalhes do erro:', textError);
        }
        
        throw new Error(errorMessage);
      }

      // Obter o blob da resposta
      const blob = await response.blob();
      
      // Criar e baixar arquivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Definir nome do arquivo baseado no código do centro
      link.download = `horimetros_centro_custo_${centro.codigo || centro.centro_custo_id}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
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

  const handleSave = async () => {
    if (!nome.trim()) {
      setSnackbar({ open: true, message: 'Nome é obrigatório', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const data = {
        nome: nome.trim(),
        codigo: codigo.trim() || undefined,
        responsavel: responsavel.trim() || undefined,
        localizacao: localizacao.trim() || undefined,
        ativo,
        observacao: observacao.trim() || undefined,
        email_responsavel: emailResponsavel.trim() || undefined
      };

      const url = editId ? buildApiUrl('/api/centros-custo', editId) : buildApiUrl('/api/centros-custo');
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
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

  const handleDeleteClick = (centro: CentroCusto) => {
    setDeleteDialog({
      open: true,
      centro,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.centro) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(buildApiUrl('/api/centros-custo', deleteDialog.centro.centro_custo_id), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const result = await response.json();
      if (result.success) {
        setSnackbar({ open: true, message: 'Centro de custo excluído com sucesso!', severity: 'success' });
        carregarCentros();
        setDeleteDialog({ open: false, centro: null, loading: false });
      } else {
        setSnackbar({ open: true, message: result.message || 'Erro ao excluir', severity: 'error' });
        setDeleteDialog(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro de conexão', severity: 'error' });
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, centro: null, loading: false });
  };

  const handleClose = () => setOpen(false);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountBalance color="primary" sx={{ fontSize: 40 }} />
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
                  <IconButton onClick={() => handleDownload(centro)} color="success" size="small">
                    <Download />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteClick(centro)} 
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

      {/* Modal de confirmação para exclusão */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Centro de Custo"
        message="Tem certeza que deseja excluir este centro de custo? Esta ação pode afetar equipamentos e abastecimentos associados."
        confirmText="Excluir"
        cancelText="Cancelar"
        severity="error"
        loading={deleteDialog.loading}
        destructive={true}
        itemDetails={deleteDialog.centro ? [
          { label: 'Nome', value: deleteDialog.centro.nome },
          { label: 'Código', value: deleteDialog.centro.codigo || 'N/A' },
          { label: 'Responsável', value: deleteDialog.centro.responsavel || 'N/A' },
          { label: 'Localização', value: deleteDialog.centro.localizacao || 'N/A' },
          { label: 'Total Equipamentos', value: deleteDialog.centro.total_equipamentos?.toString() || '0' }
        ] : []}
        additionalInfo="ATENÇÃO: Todos os equipamentos e dados associados a este centro de custo podem ser afetados. Verifique se não há dependências antes de prosseguir."
      />
    </Container>
  );
};

export default CentroCustoPage;
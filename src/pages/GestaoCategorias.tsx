import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  TablePagination,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { categoriaEquipamentoService } from '../services';
import type { Categoria, CreateCategoriaRequest, UpdateCategoriaRequest } from '../services';

interface FormData {
  nome: string;
  descricao: string;
}

const GestaoCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    descricao: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriaEquipamentoService.getAll();
      setCategorias(data);
    } catch (error) {
      showSnackbar('Erro ao carregar categorias', 'error');
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 3) {
      errors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (formData.descricao && formData.descricao.length > 500) {
      errors.descricao = 'Descrição não pode ter mais de 500 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (categoria?: Categoria) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        nome: categoria.nome,
        descricao: categoria.descricao || '',
      });
    } else {
      setEditingCategoria(null);
      setFormData({
        nome: '',
        descricao: '',
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategoria(null);
    setFormData({
      nome: '',
      descricao: '',
    });
    setFormErrors({});
  };

  const handleFormChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      if (editingCategoria) {
        const updateData: UpdateCategoriaRequest = {
          nome: formData.nome,
          descricao: formData.descricao || undefined,
        };
        await categoriaEquipamentoService.update(editingCategoria.categoria_id, updateData);
        showSnackbar('Categoria atualizada com sucesso!', 'success');
      } else {
        const createData: CreateCategoriaRequest = {
          nome: formData.nome,
          descricao: formData.descricao || undefined,
        };
        await categoriaEquipamentoService.create(createData);
        showSnackbar('Categoria criada com sucesso!', 'success');
      }
      
      handleCloseDialog();
      loadCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      showSnackbar(
        editingCategoria ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoria: Categoria) => {
    if (!window.confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await categoriaEquipamentoService.delete(categoria.categoria_id);
      showSnackbar('Categoria excluída com sucesso!', 'success');
      loadCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      showSnackbar('Erro ao excluir categoria', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar categorias baseado no termo de busca
  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categoria.descricao && categoria.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginação
  const paginatedCategorias = filteredCategorias.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Gestão de Categorias de Equipamentos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Nova Categoria
        </Button>
      </Box>

      {/* Filtros */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Tabela */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descrição</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data de Criação</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && paginatedCategorias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedCategorias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategorias.map((categoria) => (
                  <TableRow key={categoria.categoria_id} hover>
                    <TableCell>
                      <Chip
                        label={categoria.nome}
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell>
                      {categoria.descricao ? (
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {categoria.descricao}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Sem descrição
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(categoria.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Tooltip title="Editar categoria">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(categoria)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir categoria">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(categoria)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredCategorias.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </Paper>

      {/* Dialog para criar/editar categoria */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nome da Categoria"
              value={formData.nome}
              onChange={handleFormChange('nome')}
              error={!!formErrors.nome}
              helperText={formErrors.nome}
              required
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Descrição"
              value={formData.descricao}
              onChange={handleFormChange('descricao')}
              error={!!formErrors.descricao}
              helperText={formErrors.descricao}
              multiline
              rows={3}
              placeholder="Descrição opcional da categoria..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : (editingCategoria ? 'Atualizar' : 'Criar')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestaoCategorias;

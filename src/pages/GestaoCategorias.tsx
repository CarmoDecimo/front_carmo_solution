import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { categoriaEquipamentoService } from '../services';
import type { Categoria, CreateCategoriaRequest, UpdateCategoriaRequest } from '../services';

const GestaoCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });

  // Carregar categorias
  const carregarCategorias = async () => {
    setLoading(true);
    try {
      const response = await categoriaEquipamentoService.getAll();
      setCategorias(response);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar categorias',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar categorias por termo de busca
  const categoriasFiltradas = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categoria.descricao && categoria.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Abrir dialog para criar nova categoria
  const handleOpenCreateDialog = () => {
    setEditingCategoria(null);
    setFormData({ nome: '', descricao: '' });
    setOpenDialog(true);
  };

  // Abrir dialog para editar categoria
  const handleOpenEditDialog = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nome: categoria.nome,
      descricao: categoria.descricao || ''
    });
    setOpenDialog(true);
  };

  // Fechar dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategoria(null);
    setFormData({ nome: '', descricao: '' });
  };

  // Salvar categoria (criar ou atualizar)
  const handleSave = async () => {
    if (!formData.nome.trim()) {
      setSnackbar({
        open: true,
        message: 'Nome da categoria é obrigatório',
        severity: 'warning'
      });
      return;
    }

    try {
      if (editingCategoria) {
        // Atualizar categoria existente
        const updateData: UpdateCategoriaRequest = {
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim() || undefined
        };
        await categoriaEquipamentoService.update(editingCategoria.categoria_id, updateData);
        setSnackbar({
          open: true,
          message: 'Categoria atualizada com sucesso',
          severity: 'success'
        });
      } else {
        // Criar nova categoria
        const createData: CreateCategoriaRequest = {
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim() || undefined
        };
        await categoriaEquipamentoService.create(createData);
        setSnackbar({
          open: true,
          message: 'Categoria criada com sucesso',
          severity: 'success'
        });
      }

      handleCloseDialog();
      carregarCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      setSnackbar({
        open: true,
        message: editingCategoria ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria',
        severity: 'error'
      });
    }
  };

  // Deletar categoria
  const handleDelete = async (categoria: Categoria) => {
    if (!window.confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
      return;
    }

    try {
      await categoriaEquipamentoService.delete(categoria.categoria_id);
      setSnackbar({
        open: true,
        message: 'Categoria excluída com sucesso',
        severity: 'success'
      });
      carregarCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir categoria',
        severity: 'error'
      });
    }
  };

  // Carregar dados ao montar componente
  useEffect(() => {
    carregarCategorias();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CategoryIcon color="primary" />
        Gestão de Categorias de Equipamentos
      </Typography>

      {/* Cards de Estatísticas - Temporariamente removidos para compatibilidade */}
      {/* TODO: Reimplementar cards quando Grid for corrigido */}

      {/* Barra de Ações */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Buscar categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Nova Categoria
        </Button>
      </Box>

      {/* Tabela de Categorias */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Data de Criação</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : categoriasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              categoriasFiltradas.map((categoria) => (
                <TableRow key={categoria.categoria_id} hover>
                  <TableCell>{categoria.categoria_id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon color="action" />
                      {categoria.nome}
                    </Box>
                  </TableCell>
                  <TableCell>{categoria.descricao || '-'}</TableCell>
                  <TableCell>
                    {new Date(categoria.criado_em).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(categoria)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(categoria)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para Criar/Editar Categoria */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Categoria"
            fullWidth
            variant="outlined"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Descrição (opcional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingCategoria ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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

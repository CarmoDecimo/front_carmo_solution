import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  Stack,
  Pagination,
  InputAdornment,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { userService, type UserManagement } from '../services';

// Formulário de usuário
interface UserFormData {
  nome: string;
  email: string;
  password: string;
  funcao: 'Administrador' | 'Usuario';
  departamento: string;
  ativo: boolean;
}

function GestaoUsuarios() {
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Paginação e busca
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  
  // Modal states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    nome: '',
    email: '',
    password: '',
    funcao: 'Usuario',
    departamento: '',
    ativo: true,
  });

  // Carregar usuários
  const fetchUsers = async (currentPage = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const response = await userService.getAll(currentPage, 10, searchTerm);
      setUsers(response.users);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      // Por enquanto usar dados mockados
      setUsers([
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@empresa.com',
          funcao: 'Administrador',
          departamento: 'Operações',
          ativo: true,
          created_at: new Date().toISOString(),
          ultimo_login: new Date().toISOString(),
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@empresa.com',
          funcao: 'Usuario',
          departamento: 'Manutenção',
          ativo: true,
          created_at: new Date().toISOString(),
          ultimo_login: new Date().toISOString(),
        },
        {
          id: '3',
          nome: 'Pedro Costa',
          email: 'pedro@empresa.com',
          funcao: 'Usuario',
          departamento: 'Oficina',
          ativo: false,
          created_at: new Date().toISOString(),
        },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, search);
  }, []);

  // Busca com debounce
  const handleSearchChange = (value: string) => {
    setSearch(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setPage(1);
      fetchUsers(1, value);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  // Abrir modal para criar usuário
  const handleCreate = () => {
    setDialogMode('create');
    setSelectedUser(null);
    setFormData({
      nome: '',
      email: '',
      password: '',
      funcao: 'Usuario',
      departamento: '',
      ativo: true,
    });
    setOpenDialog(true);
  };

  // Abrir modal para editar usuário
  const handleEdit = (user: UserManagement) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      password: '', // Não carregar senha existente
      funcao: user.funcao || 'Usuario',
      departamento: user.departamento || '',
      ativo: user.ativo,
    });
    setOpenDialog(true);
  };

  // Abrir modal para visualizar usuário
  const handleView = (user: UserManagement) => {
    setDialogMode('view');
    setSelectedUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      password: '',
      funcao: user.funcao || 'Usuario',
      departamento: user.departamento || '',
      ativo: user.ativo,
    });
    setOpenDialog(true);
  };

  // Salvar usuário (criar ou editar)
  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        const createData = {
          ...formData,
          password: 'senha123' // Sempre usar senha padrão na criação
        };
        await userService.create(createData);
        setSuccess('Usuário criado com sucesso!');
      } else if (dialogMode === 'edit' && selectedUser) {
        let updateData: any = { ...formData };
        if (!updateData.password) {
          const { password, ...dataWithoutPassword } = updateData;
          updateData = dataWithoutPassword;
        }
        await userService.update(selectedUser.id, updateData);
        setSuccess('Usuário atualizado com sucesso!');
      }
      
      setOpenDialog(false);
      setOpenSnackbar(true);
      fetchUsers(page, search);
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      setError(error.message || 'Erro ao salvar usuário');
      setOpenSnackbar(true);
    }
  };

  // Deletar usuário
  const handleDelete = async (user: UserManagement) => {
    if (window.confirm(`Tem certeza que deseja deletar o usuário "${user.nome}"?`)) {
      try {
        await userService.delete(user.id);
        setSuccess('Usuário deletado com sucesso!');
        setOpenSnackbar(true);
        fetchUsers(page, search);
      } catch (error: any) {
        console.error('Erro ao deletar usuário:', error);
        setError(error.message || 'Erro ao deletar usuário');
        setOpenSnackbar(true);
      }
    }
  };

  // Toggle status do usuário
  const handleToggleStatus = async (user: UserManagement) => {
    try {
      if (user.ativo) {
        await userService.delete(user.id); // Desativar
        setSuccess('Usuário desativado com sucesso!');
      } else {
        await userService.reactivate(user.id); // Reativar
        setSuccess('Usuário reativado com sucesso!');
      }
      setOpenSnackbar(true);
      fetchUsers(page, search);
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      setError(error.message || 'Erro ao alterar status do usuário');
      setOpenSnackbar(true);
    }
  };

  // Resetar senha
  const handleResetPassword = async (user: UserManagement) => {
    if (window.confirm(`Resetar senha do usuário "${user.nome}"?`)) {
      try {
        const result = await userService.resetPassword(user.id);
        setSuccess(`Nova senha temporária: ${result.temporaryPassword}`);
        setOpenSnackbar(true);
      } catch (error: any) {
        console.error('Erro ao resetar senha:', error);
        setError(error.message || 'Erro ao resetar senha');
        setOpenSnackbar(true);
      }
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestão de Usuários
      </Typography>

      {/* Controles superiores */}
      <Card sx={{ marginBottom: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="Buscar usuários..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
              >
                Novo Usuário
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => fetchUsers(page, search)}
                disabled={loading}
              >
                Atualizar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabela de usuários */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Função</TableCell>
                      <TableCell>Departamento</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Último Login</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.nome}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.funcao || '-'}</TableCell>
                        <TableCell>{user.departamento || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.ativo ? 'Ativo' : 'Inativo'}
                            color={user.ativo ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.ultimo_login
                            ? new Date(user.ultimo_login).toLocaleDateString('pt-BR')
                            : 'Nunca'
                          }
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Visualizar">
                              <IconButton
                                size="small"
                                onClick={() => handleView(user)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(user)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title={user.ativo ? 'Desativar' : 'Reativar'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(user)}
                              >
                                {user.ativo ? <LockIcon /> : <LockOpenIcon />}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Resetar Senha">
                              <IconButton
                                size="small"
                                onClick={() => handleResetPassword(user)}
                                disabled={!user.ativo}
                              >
                                <RefreshIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Deletar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(user)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginação */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => {
                      setPage(newPage);
                      fetchUsers(newPage, search);
                    }}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar/editar/visualizar usuário */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' && 'Novo Usuário'}
          {dialogMode === 'edit' && 'Editar Usuário'}
          {dialogMode === 'view' && 'Visualizar Usuário'}
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nome *"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              fullWidth
              disabled={dialogMode === 'view'}
            />
            
            <TextField
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              disabled={dialogMode === 'view'}
            />
            
            {dialogMode !== 'view' && (
              <TextField
                label={dialogMode === 'create' ? 'Senha (Padrão) *' : 'Nova Senha (deixe vazio para manter)'}
                type="text"
                value={dialogMode === 'create' ? 'senha123' : formData.password}
                onChange={(e) => dialogMode === 'edit' && setFormData({ ...formData, password: e.target.value })}
                fullWidth
                disabled={dialogMode === 'create'}
                helperText={dialogMode === 'create' ? 'Senha padrão para novos usuários' : undefined}
              />
            )}
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Função *</InputLabel>
                <Select
                  value={formData.funcao}
                  label="Função *"
                  onChange={(e) => setFormData({ ...formData, funcao: e.target.value as 'Administrador' | 'Usuario' })}
                >
                  <MenuItem value="Administrador">Administrador</MenuItem>
                  <MenuItem value="Usuario">Usuario</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Departamento"
                value={formData.departamento}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                fullWidth
                disabled={dialogMode === 'view'}
              />
            </Stack>

            {dialogMode === 'view' && selectedUser && (
              <Stack spacing={2}>
                <Typography variant="body2">
                  <strong>Criado em:</strong> {new Date(selectedUser.created_at).toLocaleString('pt-BR')}
                </Typography>
                {selectedUser.updated_at && (
                  <Typography variant="body2">
                    <strong>Última atualização:</strong> {new Date(selectedUser.updated_at).toLocaleString('pt-BR')}
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedUser.ativo ? 'Ativo' : 'Inativo'}
                </Typography>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          
          {dialogMode !== 'view' && (
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!formData.nome || !formData.email || (dialogMode === 'create' && !formData.password)}
            >
              {dialogMode === 'create' ? 'Criar' : 'Salvar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GestaoUsuarios;

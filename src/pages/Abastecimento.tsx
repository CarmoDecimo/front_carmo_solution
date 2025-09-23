import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField, Stack, Alert, Snackbar,
  CircularProgress, Autocomplete, Table, TableBody, TableCell, TableHead, TableRow,
  Divider, IconButton, Paper, TableContainer, Dialog, DialogTitle, DialogContent, 
  DialogActions, DialogContentText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import CloseIcon from '@mui/icons-material/Close';
import { equipamentosService } from '../services';
import { abastecimentoService } from '../services/abastecimentoService';
import turnoAbastecimentoService, { 
  type TurnoAbastecimento, 
  type AdicionarEquipamentosRequest
} from '../services/turnoAbastecimento.service';
import type { Equipamento } from '../services';
import { useAuth } from '../contexts/auth/AuthContext';

// Interface para equipamento na lista local
interface EquipamentoLista {
  equipamento_id: number;
  nome: string;
  codigo_ativo: string;
  quantidade: number;
  horimetro?: number;
  responsavel?: string;
}

function Abastecimento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  
  // Estados principais
  const [turnoAtivo, setTurnoAtivo] = useState<TurnoAbastecimento | null>(null);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [equipamentosLista, setEquipamentosLista] = useState<EquipamentoLista[]>([]);
  
  // Estados para formulário de adicionar equipamento
  const [equipamentoAtual, setEquipamentoAtual] = useState<EquipamentoLista>({
    equipamento_id: 0,
    nome: '',
    codigo_ativo: '',
    quantidade: 0,
    horimetro: undefined,
    responsavel: ''
  });
  
  // Estados de entrada de combustível (editável)
  const [entradaCombustivel, setEntradaCombustivel] = useState<number>(0);
  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [loadingTurno, setLoadingTurno] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Estados para modal de fechar turno
  const [modalFecharTurno, setModalFecharTurno] = useState(false);
  const [loadingFecharTurno, setLoadingFecharTurno] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (id && isAuthenticated) {
      carregarTurno(Number(id));
    } else if (isAuthenticated) {
      // Se não há ID, redirecionar para a lista
      navigate('/abastecimento');
    }
  }, [id, navigate]);

  // Carregar equipamentos disponíveis
  const carregarEquipamentos = async () => {
    try {
      const response = await equipamentosService.getAll();
      setEquipamentos(response || []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      setEquipamentos([]);
    }
  };

  // Carregar dados do turno
  const carregarTurno = async (turnoId: number) => {
    setLoadingTurno(true);
    try {
      // Carregar equipamentos primeiro
      await carregarEquipamentos();
      
      // Carregar dados do abastecimento usando o serviço correto
      const abastecimento = await abastecimentoService.buscarPorId(turnoId);
      console.log('📋 Dados do abastecimento carregados:', abastecimento);
      
      // Converter Abastecimento para TurnoAbastecimento
      const turno: TurnoAbastecimento = {
        id_abastecimento: abastecimento.id_abastecimento,
        data_abastecimento: abastecimento.data_abastecimento,
        existencia_inicio: abastecimento.existencia_inicio ?? 0,
        entrada_combustivel: abastecimento.entrada_combustivel ?? 0,
        posto_abastecimento: abastecimento.posto_abastecimento,
        operador: abastecimento.operador,
        responsavel_abastecimento: abastecimento.responsavel_abastecimento,
        quantidade_combustivel: abastecimento.quantidade_combustivel ?? 0,
        existencia_fim: abastecimento.existencia_fim ?? 0,
        status: (abastecimento.existencia_fim && abastecimento.existencia_fim > 0) ? 'fechado' : 'aberto',
        equipamentos_abastecimentos: abastecimento.equipamentos_abastecimentos?.map(eq => ({
          id: eq.id,
          equipamento: eq.equipamento,
          activo: eq.activo,
          quantidade: eq.quantidade,
          kmh: eq.kmh,
          assinatura: eq.assinatura
        }))
      };
      
      setTurnoAtivo(turno);
      setEntradaCombustivel(turno.entrada_combustivel || 0);
      
      // Carregar equipamentos já abastecidos neste turno
      if (turno.equipamentos_abastecimentos && turno.equipamentos_abastecimentos.length > 0) {
        const equipamentosFormatados = turno.equipamentos_abastecimentos.map((eq, index) => ({
          equipamento_id: index + 1, // Temporário - o backend deveria retornar o ID real
          nome: eq.equipamento,
          codigo_ativo: eq.activo,
          quantidade: eq.quantidade,
          horimetro: eq.kmh,
          responsavel: eq.assinatura || ''
        }));
        setEquipamentosLista(equipamentosFormatados);
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar turno:', error);
      setError(error.response?.data?.message || 'Erro ao carregar dados do turno');
      setOpenSnackbar(true);
      
      // Em caso de erro, voltar para a lista após 3 segundos
      setTimeout(() => {
        navigate('/abastecimento');
      }, 3000);
    } finally {
      setLoadingTurno(false);
    }
  };

  // Adicionar equipamento à lista local (sem enviar para API)
  const handleAdicionarEquipamento = () => {
    if (!equipamentoAtual.equipamento_id || equipamentoAtual.equipamento_id === 0) {
      setError('Selecione um equipamento');
      setOpenSnackbar(true);
      return;
    }

    if (!equipamentoAtual.quantidade || equipamentoAtual.quantidade <= 0) {
      setError('Quantidade deve ser maior que zero');
      setOpenSnackbar(true);
      return;
    }

    // Verificar se o equipamento já está na lista
    const equipamentoJaExiste = equipamentosLista.some(eq => eq.equipamento_id === equipamentoAtual.equipamento_id);
    if (equipamentoJaExiste) {
      setError('Este equipamento já foi adicionado à lista');
      setOpenSnackbar(true);
      return;
    }

    // Adicionar à lista local
    setEquipamentosLista([...equipamentosLista, equipamentoAtual]);
    
    // Limpar formulário
    setEquipamentoAtual({
      equipamento_id: 0,
      nome: '',
      codigo_ativo: '',
      quantidade: 0,
      horimetro: undefined,
      responsavel: ''
    });

    setSuccess('Equipamento adicionado à lista!');
    setOpenSnackbar(true);
  };

  // Enviar todos os equipamentos para a API
  const handleEnviarEquipamentos = async () => {
    if (equipamentosLista.length === 0) {
      setError('Adicione pelo menos um equipamento à lista antes de enviar');
      setOpenSnackbar(true);
      return;
    }

    if (!turnoAtivo?.id_abastecimento) {
      setError('Turno não encontrado');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const dados: AdicionarEquipamentosRequest = {
        entrada_combustivel: entradaCombustivel,
        equipamentos: equipamentosLista.map(eq => ({
          equipamento_id: eq.equipamento_id,
          quantidade: eq.quantidade,
          horimetro: eq.horimetro,
          responsavel: eq.responsavel
        }))
      };

      console.log('⛽ Enviando todos os equipamentos para API:', dados);
      console.log('📋 Total de equipamentos a enviar:', equipamentosLista.length);
      
      await turnoAbastecimentoService.adicionarEquipamentos(turnoAtivo.id_abastecimento, dados);
      
      // Atualizar entrada de combustível no turno
      setTurnoAtivo({
        ...turnoAtivo,
        entrada_combustivel: entradaCombustivel
      });

      setSuccess('Todos os equipamentos foram enviados com sucesso!');
      setOpenSnackbar(true);
      
      // Opcional: Redirecionar para a lista após sucesso
      setTimeout(() => {
        navigate('/abastecimento');
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Erro ao enviar equipamentos:', error);
      setError(error.response?.data?.message || 'Erro ao enviar equipamentos');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Fechar turno de abastecimento
  const handleFecharTurno = async () => {
    if (!turnoAtivo) {
      setError('Turno não encontrado');
      setOpenSnackbar(true);
      return;
    }

    setLoadingFecharTurno(true);
    try {
      const { totalAbastecido } = calcularTotais();
      const existenciaFim = turnoAtivo.existencia_inicio + entradaCombustivel - totalAbastecido;

      const dados = {
        existencia_fim: existenciaFim,
        responsavel_abastecimento: turnoAtivo.responsavel_abastecimento
      };

      console.log('🔒 Fechando turno com dados:', dados);
      console.log('📊 Cálculo: existência_fim =', turnoAtivo.existencia_inicio, '+', entradaCombustivel, '-', totalAbastecido, '=', existenciaFim);

      await turnoAbastecimentoService.fecharTurno(dados);

      setSuccess('Turno fechado com sucesso!');
      setOpenSnackbar(true);
      setModalFecharTurno(false);

      // Redirecionar para a lista após sucesso
      setTimeout(() => {
        navigate('/abastecimento');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erro ao fechar turno:', error);
      setError(error.response?.data?.message || 'Erro ao fechar turno');
      setOpenSnackbar(true);
      setModalFecharTurno(false);
    } finally {
      setLoadingFecharTurno(false);
    }
  };

  // Remover equipamento da lista (apenas local)
  const handleRemoverEquipamento = (index: number) => {
    const novosEquipamentos = equipamentosLista.filter((_, i) => i !== index);
    setEquipamentosLista(novosEquipamentos);
    setSuccess('Equipamento removido da lista');
    setOpenSnackbar(true);
  };

  // Calcular totais
  const calcularTotais = () => {
    const totalAbastecido = equipamentosLista.reduce((total, eq) => total + eq.quantidade, 0);
    const existenciaCalculada = turnoAtivo 
      ? (turnoAtivo.existencia_inicio + entradaCombustivel - totalAbastecido)
      : 0;
    
    return { totalAbastecido, existenciaCalculada };
  };

  // Voltar para a lista
  const handleVoltar = () => {
    navigate('/abastecimento');
  };

  // Estado de carregamento de autenticação
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Verificando autenticação...
        </Typography>
      </Box>
    );
  }

  // Estado de carregamento
  if (loadingTurno) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Carregando dados do turno...
        </Typography>
      </Box>
    );
  }

  // Se não há turno carregado, mostrar erro
  if (!turnoAtivo) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Turno não encontrado. Você será redirecionado para a lista.
        </Alert>
      </Box>
    );
  }

  const { totalAbastecido, existenciaCalculada } = calcularTotais();

  return (
    <Box sx={{ padding: 3 }}>
      {/* Header com botão voltar e fechar turno */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleVoltar}
          >
            Voltar
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4">
              Editar Abastecimento - Turno #{turnoAtivo.id_abastecimento}
            </Typography>
          </Box>
        </Box>
        
        {/* Botão Fechar Turno */}
        <Button
          variant="contained"
          color="error"
          startIcon={<CloseIcon />}
          onClick={() => setModalFecharTurno(true)}
          disabled={loadingFecharTurno}
          sx={{ 
            bgcolor: 'error.main',
            '&:hover': { bgcolor: 'error.dark' }
          }}
        >
          Fechar Turno
        </Button>
      </Box>

      <Stack spacing={3}>
        {/* Informações do Turno (Somente Leitura) */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
             Informações do Turno
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">Data do Abastecimento</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {new Date(turnoAtivo.data_abastecimento).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">Responsável</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {turnoAtivo.responsavel_abastecimento}
                </Typography>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 150 }}>
                <Typography variant="body2" color="text.secondary">Existência Inicial</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {turnoAtivo.existencia_inicio} L
                </Typography>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 150 }}>
                <Typography variant="body2" color="text.secondary">Posto de Abastecimento</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {turnoAtivo.posto_abastecimento || 'Não informado'}
                </Typography>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 150 }}>
                <Typography variant="body2" color="text.secondary">Operador</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {turnoAtivo.operador || 'Não informado'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Resumo de Totais */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 22%' }, minWidth: 150 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="info.contrastText">Entrada de Combustível</Typography>
                  <Typography variant="h6" color="info.contrastText">{entradaCombustivel} L</Typography>
                </Box>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 22%' }, minWidth: 150 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="warning.contrastText">Total Abastecido</Typography>
                  <Typography variant="h6" color="warning.contrastText">{totalAbastecido} L</Typography>
                </Box>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 22%' }, minWidth: 150 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.contrastText">Existência Calculada</Typography>
                  <Typography variant="h6" color="success.contrastText">{existenciaCalculada} L</Typography>
                </Box>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 22%' }, minWidth: 150 }}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1565c0' : 'grey.300',
                  borderRadius: 1 
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary 
                    }}
                  >
                    Equipamentos
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary 
                    }}
                  >
                    {equipamentosLista.length}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Formulário para Adicionar Equipamentos */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Adicionar Equipamento ao Turno
            </Typography>
            
            {/* Campo de entrada de combustível editável */}
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Entrada de Combustível (L)"
                type="number"
                value={entradaCombustivel || ''}
                onChange={(e) => setEntradaCombustivel(Number(e.target.value))}
                helperText="Este valor será atualizado quando adicionar equipamentos"
                sx={{ maxWidth: 250 }}
              />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Formulário de equipamento */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'end' }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 200 }}>
                <Autocomplete
                  options={equipamentos}
                  getOptionLabel={(option) => `${option.nome} (${option.codigo_ativo})`}
                  value={equipamentos.find(eq => eq.equipamento_id === equipamentoAtual.equipamento_id) || null}
                  onChange={(_, newValue) => {
                    setEquipamentoAtual({
                      ...equipamentoAtual,
                      equipamento_id: newValue?.equipamento_id || 0,
                      nome: newValue?.nome || '',
                      codigo_ativo: newValue?.codigo_ativo || ''
                    });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Selecionar Equipamento" required />
                  )}
                  fullWidth
                />
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 15%' }, minWidth: 120 }}>
                <TextField
                  label="Quantidade (L)"
                  type="number"
                  value={equipamentoAtual.quantidade || ''}
                  onChange={(e) => setEquipamentoAtual({
                    ...equipamentoAtual,
                    quantidade: Number(e.target.value)
                  })}
                  fullWidth
                  required
                />
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 15%' }, minWidth: 120 }}>
                <TextField
                  label="Horímetro"
                  type="number"
                  value={equipamentoAtual.horimetro || ''}
                  onChange={(e) => setEquipamentoAtual({
                    ...equipamentoAtual,
                    horimetro: Number(e.target.value) || undefined
                  })}
                  fullWidth
                />
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 25%' }, minWidth: 150 }}>
                <TextField
                  label="Responsável"
                  value={equipamentoAtual.responsavel || ''}
                  onChange={(e) => setEquipamentoAtual({
                    ...equipamentoAtual,
                    responsavel: e.target.value
                  })}
                  fullWidth
                />
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 10%' }, minWidth: 100 }}>
                <Button
                  variant="contained"
                  onClick={handleAdicionarEquipamento}
                  startIcon={<AddIcon />}
                  disabled={!equipamentoAtual.equipamento_id || !equipamentoAtual.quantidade}
                  fullWidth
                  sx={{ height: 56 }}
                >
                  Adicionar à Lista
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Lista de Equipamentos Abastecidos */}
        {equipamentosLista.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Equipamentos Abastecidos ({equipamentosLista.length})
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1565c0' : 'grey.300',
                      '& .MuiTableCell-root': {
                        color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                        borderBottom: 'none'
                      }
                    }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Equipamento</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Quantidade (L)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Horímetro</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Responsável</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equipamentosLista.map((equipamento, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{equipamento.nome}</TableCell>
                        <TableCell>{equipamento.codigo_ativo}</TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>{equipamento.quantidade}</TableCell>
                        <TableCell>{equipamento.horimetro || '-'}</TableCell>
                        <TableCell>{equipamento.responsavel || '-'}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleRemoverEquipamento(index)}
                            color="error"
                            size="small"
                            sx={{ '&:hover': { bgcolor: 'error.light' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              
              
              {/* Botão para enviar todos os equipamentos */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleEnviarEquipamentos}
                  disabled={loading || equipamentosLista.length === 0}
                  
                  sx={{ 
                    minWidth: 200,
                    py: 1.5,
                    fontSize: '1.1rem',
                    bgcolor: 'success.main',
                    '&:hover': { bgcolor: 'success.dark' }
                  }}
                >
                  {loading ? 'Enviando...' : `Salvar`}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Mensagem se não há equipamentos */}
        {equipamentosLista.length === 0 && (
          <Alert severity="info">
            Nenhum equipamento foi abastecido neste turno ainda. Use o formulário acima para adicionar equipamentos.
          </Alert>
        )}
      </Stack>

      {/* Snackbar para notificações */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>

      {/* Modal de confirmação para fechar turno */}
      <Dialog
        open={modalFecharTurno}
        onClose={() => setModalFecharTurno(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'error.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CloseIcon />
          Confirmar Fechamento do Turno
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ mb: 3 }}>
            Tem certeza que deseja fechar o turno? 
            Esta ação não pode ser desfeita.
          </DialogContentText>
          
          {/* Resumo dos cálculos */}
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Resumo dos Cálculos
            </Typography>
            
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Existência Início:</strong> {turnoAtivo?.existencia_inicio} L
              </Typography>
              <Typography variant="body2">
                <strong>Entrada Combustível:</strong> {entradaCombustivel} L
              </Typography>
              <Typography variant="body2">
                <strong>Total Abastecido:</strong> {calcularTotais().totalAbastecido} L
              </Typography>
              <Divider />
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                <strong>Existência Final:</strong> {calcularTotais().existenciaCalculada} L
              </Typography>
              
            </Stack>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            <strong>Responsável:</strong> {turnoAtivo?.responsavel_abastecimento}
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setModalFecharTurno(false)}
            disabled={loadingFecharTurno}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained"
            color="error"
            onClick={handleFecharTurno}
            disabled={loadingFecharTurno}
            startIcon={loadingFecharTurno ? <CircularProgress size={20} color="inherit" /> : <CloseIcon />}
          >
            {loadingFecharTurno ? 'Fechando...' : 'Confirmar Fechamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Abastecimento;

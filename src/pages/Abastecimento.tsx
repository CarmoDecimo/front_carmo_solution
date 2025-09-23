import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField, Stack, Alert, Snackbar,
  CircularProgress, Autocomplete, Table, TableBody, TableCell, TableHead, TableRow,
  Divider, IconButton, Paper, TableContainer
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { equipamentosService } from '../services';
import { abastecimentoService } from '../services/abastecimentoService';
import turnoAbastecimentoService, { 
  type TurnoAbastecimento, 
  type AdicionarEquipamentosRequest
} from '../services/turnoAbastecimento.service';
import type { Equipamento } from '../services';

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

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (id) {
      carregarTurno(Number(id));
    } else {
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

  // Adicionar equipamento ao turno
  const handleAdicionarEquipamento = async () => {
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

    if (!turnoAtivo?.id_abastecimento) {
      setError('Turno não encontrado');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const dados: AdicionarEquipamentosRequest = {
        entrada_combustivel: entradaCombustivel,
        equipamentos: [{
          equipamento_id: equipamentoAtual.equipamento_id,
          quantidade: equipamentoAtual.quantidade,
          horimetro: equipamentoAtual.horimetro,
          responsavel: equipamentoAtual.responsavel
        }]
      };

      console.log('� Enviando dados para API:', dados);
      
      await turnoAbastecimentoService.adicionarEquipamentos(turnoAtivo.id_abastecimento, dados);
      
      // Adicionar à lista local
      setEquipamentosLista([...equipamentosLista, equipamentoAtual]);
      
      // Atualizar entrada de combustível no turno
      setTurnoAtivo({
        ...turnoAtivo,
        entrada_combustivel: entradaCombustivel
      });
      
      // Limpar formulário
      setEquipamentoAtual({
        equipamento_id: 0,
        nome: '',
        codigo_ativo: '',
        quantidade: 0,
        horimetro: undefined,
        responsavel: ''
      });

      setSuccess('Equipamento adicionado com sucesso!');
      setOpenSnackbar(true);
      
    } catch (error: any) {
      console.error('❌ Erro ao adicionar equipamento:', error);
      setError(error.response?.data?.message || 'Erro ao adicionar equipamento');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
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
      {/* Header com botão voltar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleVoltar}
        >
          Voltar
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocalGasStationIcon color="primary" />
          <Typography variant="h4">
            Editar Abastecimento - Turno #{turnoAtivo.id_abastecimento}
          </Typography>
        </Box>
      </Box>

      <Stack spacing={3}>
        {/* Informações do Turno (Somente Leitura) */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              📊 Informações do Turno (Somente Leitura)
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
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.300', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.primary">Equipamentos</Typography>
                  <Typography variant="h6" color="text.primary">{equipamentosLista.length}</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Formulário para Adicionar Equipamentos */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              ⛽ Adicionar Equipamento ao Turno
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
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                  disabled={loading || !equipamentoAtual.equipamento_id || !equipamentoAtual.quantidade}
                  fullWidth
                  sx={{ height: 56 }}
                >
                  {loading ? '' : 'Adicionar'}
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
                📋 Equipamentos Abastecidos ({equipamentosLista.length})
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
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
    </Box>
  );
}

export default Abastecimento;

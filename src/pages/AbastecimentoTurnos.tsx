import { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Box,
  Stack
} from '@mui/material';
import {
  PlayArrow as StartIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import { turnoAbastecimentoService } from '../services/turnoAbastecimento.service';
import type {
  TurnoAbastecimento,
  IniciarTurnoRequest
} from '../services/turnoAbastecimento.service';

function AbastecimentoTurnos() {
  // Estados principais
  const [turnoAtivo, setTurnoAtivo] = useState<TurnoAbastecimento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Estados para iniciar turno
  const [dadosIniciarTurno, setDadosIniciarTurno] = useState<IniciarTurnoRequest>({
    existencia_inicio: 0,
    responsavel_abastecimento: ''
  });

  // Verificar turno ativo ao carregar componente
  useEffect(() => {
    verificarTurnoAtivo();
  }, []);

  // Verificar se há turno ativo
  const verificarTurnoAtivo = async () => {
    try {
      const turno = await turnoAbastecimentoService.verificarTurnoAtivo();
      if (turno) {
        setTurnoAtivo(turno);
        console.log('✅ Turno ativo encontrado:', turno);
      } else {
        console.log('📭 Nenhum turno ativo');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar turno ativo:', error);
    }
  };

  // Iniciar novo turno
  const iniciarTurno = async () => {
    // Validações
    if (!dadosIniciarTurno.existencia_inicio || dadosIniciarTurno.existencia_inicio <= 0) {
      setError('Existência inicial deve ser maior que zero');
      setOpenSnackbar(true);
      return;
    }

    if (!dadosIniciarTurno.responsavel_abastecimento?.trim()) {
      setError('Responsável pelo abastecimento é obrigatório');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const response = await turnoAbastecimentoService.iniciarTurno(dadosIniciarTurno);
      setTurnoAtivo(response.turno);
      setSuccess(`Turno iniciado com sucesso! ID: ${response.turno.id_abastecimento}`);
      setOpenSnackbar(true);
      
      // Limpar formulário
      setDadosIniciarTurno({
        existencia_inicio: 0,
        responsavel_abastecimento: ''
      });
    } catch (error: any) {
      console.error('❌ Erro ao iniciar turno:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('turno em aberto')) {
        setError(`${error.response.data.message}`);
        // Recarregar para mostrar turno existente
        await verificarTurnoAtivo();
      } else {
        setError(`Erro ao iniciar turno: ${error.response?.data?.message || error.message}`);
      }
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Sistema de Turnos de Abastecimento
        </Typography>

        {!turnoAtivo ? (
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <StartIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h5" component="h2">
                    Iniciar Turno de Abastecimento
                  </Typography>
                </Box>
                
                <Alert severity="info">
                  Inicie um novo turno diário para começar a registrar abastecimentos. 
                  Cada usuário pode ter apenas um turno ativo por dia.
                </Alert>

                <Stack spacing={3}>
                  <TextField
                    label="Existência Inicial (L) *"
                    type="number"
                    value={dadosIniciarTurno.existencia_inicio || ''}
                    onChange={(e) => setDadosIniciarTurno({
                      ...dadosIniciarTurno,
                      existencia_inicio: Number(e.target.value)
                    })}
                    fullWidth
                    required
                    helperText="Quantidade de combustível no início do turno"
                  />
                  <TextField
                    label="Responsável pelo Abastecimento *"
                    value={dadosIniciarTurno.responsavel_abastecimento}
                    onChange={(e) => setDadosIniciarTurno({
                      ...dadosIniciarTurno,
                      responsavel_abastecimento: e.target.value
                    })}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Posto de Abastecimento"
                    value={dadosIniciarTurno.posto_abastecimento || ''}
                    onChange={(e) => setDadosIniciarTurno({
                      ...dadosIniciarTurno,
                      posto_abastecimento: e.target.value
                    })}
                    fullWidth
                  />
                  <TextField
                    label="Operador"
                    value={dadosIniciarTurno.operador || ''}
                    onChange={(e) => setDadosIniciarTurno({
                      ...dadosIniciarTurno,
                      operador: e.target.value
                    })}
                    fullWidth
                  />
                  <TextField
                    label="Entrada de Combustível (L)"
                    type="number"
                    value={dadosIniciarTurno.entrada_combustivel || ''}
                    onChange={(e) => setDadosIniciarTurno({
                      ...dadosIniciarTurno,
                      entrada_combustivel: Number(e.target.value)
                    })}
                    fullWidth
                    helperText="Combustível adicionado ao tanque"
                  />
                </Stack>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={iniciarTurno}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <StartIcon />}
                  disabled={loading}
                  size="large"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {loading ? 'Iniciando...' : 'Iniciar Turno'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Turno Ativo - ID: {turnoAtivo.id_abastecimento}
              </Typography>
              <Typography variant="body1">
                Data: {turnoAtivo.data_abastecimento}
              </Typography>
              <Typography variant="body1">
                Responsável: {turnoAtivo.responsavel_abastecimento}
              </Typography>
              <Typography variant="body1">
                Existência Inicial: {turnoAtivo.existencia_inicio}L
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                Turno ativo! Funcionalidades de adicionar equipamentos e fechar turno serão implementadas em breve.
              </Alert>
            </CardContent>
          </Card>
        )}

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
    </LocalizationProvider>
  );
}

export default AbastecimentoTurnos;

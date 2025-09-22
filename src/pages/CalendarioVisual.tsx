import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
  IconButton,
  Paper
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Event as EventIcon,
  Build as BuildIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  EventAvailable as EventAvailableIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import manutencaoService from '../services/manutencao.service';

// Configurar moment para português
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

// Interfaces
interface ManutencaoEvento {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    id_manutencao: number;
    equipamento: {
      equipamento_id: number;
      nome: string;
      codigo_ativo: string;
    };
    centro_custo: {
      centro_custo_id: number;
      nome: string;
    };
    tipo_manutencao: string;
    status: 'planeada' | 'realizada' | 'atrasada' | 'cancelada';
    data_prevista: string;
  };
}

interface FiltrosCalendario {
  data_inicio: string;
  data_fim: string;
  status: 'planeada' | 'realizada' | 'atrasada' | 'cancelada' | '';
  centro_custo_id?: number;
  equipamento_id?: number;
}

const CalendarioVisual: React.FC = () => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState<ManutencaoEvento[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<ManutencaoEvento | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosCalendario>({
    data_inicio: moment().startOf('month').format('YYYY-MM-DD'),
    data_fim: moment().endOf('month').add(2, 'months').format('YYYY-MM-DD'),
    status: '',
  });
  const [notificacao, setNotificacao] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info'
  });

  // Carregar manutenções
  const carregarManutencoes = useCallback(async () => {
    try {
      setLoading(true);
      const filtrosAPI = {
        ...filtros,
        status: filtros.status === '' ? undefined : filtros.status
      };
      const response = await manutencaoService.listarCalendario(filtrosAPI);
      
      if ((response as any).success) {
        const manutencoes = (response as any).data || [];
        
        // Converter para eventos do calendário
        const eventosCalendario: ManutencaoEvento[] = manutencoes.map((manutencao: any) => {
          const dataEvento = new Date(manutencao.data_prevista);
          
          return {
            id: manutencao.id_manutencao,
            title: `${manutencao.equipamento.nome} - ${manutencao.tipo_manutencao}`,
            start: dataEvento,
            end: dataEvento,
            resource: manutencao
          };
        });
        
        setEventos(eventosCalendario);
        setNotificacao({
          open: true,
          message: `${eventosCalendario.length} manutenções carregadas`,
          severity: 'success'
        });
      } else {
        setNotificacao({
          open: true,
          message: 'Erro ao carregar manutenções',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar manutenções:', error);
      setNotificacao({
        open: true,
        message: 'Erro ao carregar manutenções',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Carregar dados ao montar componente
  useEffect(() => {
    carregarManutencoes();
  }, [carregarManutencoes]);

  // Função para definir cores dos eventos baseado no status
  const eventStyleGetter = (event: ManutencaoEvento) => {
    const status = event.resource.status;
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';
    
    switch (status) {
      case 'planeada':
        backgroundColor = '#60a5fa';
        borderColor = '#3b82f6';
        break;
      case 'realizada':
        backgroundColor = '#4ade80';
        borderColor = '#22c55e';
        break;
      case 'atrasada':
        backgroundColor = '#f87171';
        borderColor = '#ef4444';
        break;
      case 'cancelada':
        backgroundColor = '#94a3b8';
        borderColor = '#64748b';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
      }
    };
  };

  // Clique em evento
  const handleEventoClick = (evento: ManutencaoEvento) => {
    setEventoSelecionado(evento);
    setDialogAberto(true);
  };

  // Fechar diálogo
  const fecharDialog = () => {
    setDialogAberto(false);
    setEventoSelecionado(null);
  };

  // Atualizar filtros
  const handleFiltroChange = (campo: keyof FiltrosCalendario, valor: any) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Obter chip de status
  const getStatusChip = (status: string) => {
    const configs = {
      planeada: { color: 'primary' as const, label: 'Planeada' },
      realizada: { color: 'success' as const, label: 'Realizada' },
      atrasada: { color: 'error' as const, label: 'Atrasada' },
      cancelada: { color: 'default' as const, label: 'Cancelada' }
    };

    const config = configs[status as keyof typeof configs] || configs.planeada;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // Mensagens do calendário em português
  const messages = {
    allDay: 'Dia inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há manutenções neste período',
    showMore: (total: number) => `+ ${total} mais`
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/calendario')}
            >
              Voltar ao Dashboard
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="Atualizar calendário">
              <IconButton onClick={carregarManutencoes} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          
          <Typography variant="h4" component="h1" gutterBottom>
            <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Calendário de Manutenções
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Visualize todas as manutenções em formato de calendário interativo.
          </Typography>
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <FilterIcon />
            <Typography variant="h6">Filtros</Typography>
          </Stack>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Data Início"
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => handleFiltroChange('data_inicio', e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Data Fim"
                type="date"
                value={filtros.data_fim}
                onChange={(e) => handleFiltroChange('data_fim', e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtros.status}
                  label="Status"
                  onChange={(e) => handleFiltroChange('status', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="planeada">Planeada</MenuItem>
                  <MenuItem value="realizada">Realizada</MenuItem>
                  <MenuItem value="atrasada">Atrasada</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                variant="contained"
                onClick={carregarManutencoes}
                disabled={loading}
                fullWidth
                sx={{ height: '40px' }}
              >
                Aplicar Filtros
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Legenda de Cores */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Legenda</Typography>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: '#60a5fa', borderRadius: 1 }} />
              <Typography variant="body2">Planeada</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: '#4ade80', borderRadius: 1 }} />
              <Typography variant="body2">Realizada</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: '#f87171', borderRadius: 1 }} />
              <Typography variant="body2">Atrasada</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: '#94a3b8', borderRadius: 1 }} />
              <Typography variant="body2">Cancelada</Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Calendário */}
        <Paper sx={{ p: 2, height: 600 }}>
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleEventoClick}
            eventPropGetter={eventStyleGetter}
            messages={messages}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            defaultView={Views.MONTH}
            popup
            showMultiDayTimes
            step={60}
            showAllEvents
          />
        </Paper>

        {/* Resumo */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 40, color: '#60a5fa', mb: 1 }} />
                <Typography variant="h4">
                  {eventos.filter(e => e.resource.status === 'planeada').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Planeadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <EventAvailableIcon sx={{ fontSize: 40, color: '#4ade80', mb: 1 }} />
                <Typography variant="h4">
                  {eventos.filter(e => e.resource.status === 'realizada').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Realizadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 40, color: '#f87171', mb: 1 }} />
                <Typography variant="h4">
                  {eventos.filter(e => e.resource.status === 'atrasada').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Atrasadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                <Typography variant="h4">
                  {eventos.filter(e => e.resource.status === 'cancelada').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Canceladas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      {/* Dialog de Detalhes do Evento */}
      <Dialog open={dialogAberto} onClose={fecharDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <BuildIcon />
            <Typography variant="h6">Detalhes da Manutenção</Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          {eventoSelecionado && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Equipamento
                </Typography>
                <Typography variant="body1">
                  {eventoSelecionado.resource.equipamento.nome}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Código: {eventoSelecionado.resource.equipamento.codigo_ativo}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Centro de Custo
                </Typography>
                <Typography variant="body1">
                  {eventoSelecionado.resource.centro_custo.nome}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tipo de Manutenção
                </Typography>
                <Typography variant="body1">
                  {eventoSelecionado.resource.tipo_manutencao}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Data Prevista
                </Typography>
                <Typography variant="body1">
                  {moment(eventoSelecionado.resource.data_prevista).format('DD/MM/YYYY')}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                {getStatusChip(eventoSelecionado.resource.status)}
              </Box>
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={fecharDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de Notificações */}
      <Snackbar
        open={notificacao.open}
        autoHideDuration={4000}
        onClose={() => setNotificacao(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={notificacao.severity} onClose={() => setNotificacao(prev => ({ ...prev, open: false }))}>
          {notificacao.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CalendarioVisual;

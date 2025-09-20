import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Grid, Stack, Paper,
  Chip, Avatar, Button, useMediaQuery, IconButton, LinearProgress, Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Warning as WarningIcon,
  Build as BuildIcon,
  Speed as SpeedIcon,
  LocalGasStation as LocalGasStationIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

interface AlertaData {
  id: number;
  equipamento_id: number;
  equipamento_nome: string;
  codigo_ativo: string;
  categoria: string;
  tipo_alerta: 'manutencao' | 'combustivel' | 'horimetro' | 'sistema';
  prioridade: 'alta' | 'media' | 'baixa';
  titulo: string;
  descricao: string;
  horas_para_vencer: number;
  horimetro_atual: number;
  proxima_manutencao: number;
  data_criacao: string;
  status: 'ativo' | 'resolvido' | 'ignorado';
  centro_custo?: string;
}

const AlertasPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [alertas, setAlertas] = useState<AlertaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  // Buscar alertas da API
  const fetchAlertas = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/equipamentos/alertas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const alertasData = result.success ? result.data : [];
        
        // Transformar dados da API para o formato esperado
        const alertasFormatados: AlertaData[] = alertasData.map((item: any, index: number) => ({
          id: index + 1,
          equipamento_id: item.equipamento_id,
          equipamento_nome: item.equipamento_nome || item.nome,
          codigo_ativo: item.codigo_ativo,
          categoria: item.categoria,
          tipo_alerta: item.horas_para_vencer <= 0 ? 'manutencao' : 'horimetro',
          prioridade: item.horas_para_vencer <= 0 ? 'alta' : item.horas_para_vencer <= 50 ? 'media' : 'baixa',
          titulo: item.horas_para_vencer <= 0 ? 'Manutenção Atrasada' : 'Manutenção Próxima',
          descricao: `${item.equipamento_nome || item.nome} precisa de manutenção. ${item.horas_para_vencer <= 0 ? 'ATRASADA!' : `Faltam ${item.horas_para_vencer}h`}`,
          horas_para_vencer: item.horas_para_vencer,
          horimetro_atual: item.horimetro_atual,
          proxima_manutencao: item.proxima_revisao_horimetro,
          data_criacao: new Date().toISOString(),
          status: 'ativo',
          centro_custo: item.centro_custo
        }));

        setAlertas(alertasFormatados);
      }
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      // Dados mock para desenvolvimento
      setAlertas([
        {
          id: 1,
          equipamento_id: 1,
          equipamento_nome: 'Escavadeira CAT 320',
          codigo_ativo: 'ESC001',
          categoria: 'Escavadeira',
          tipo_alerta: 'manutencao',
          prioridade: 'alta',
          titulo: 'Manutenção Atrasada',
          descricao: 'Manutenção preventiva atrasada há 50 horas',
          horas_para_vencer: -50,
          horimetro_atual: 1250,
          proxima_manutencao: 1200,
          data_criacao: new Date().toISOString(),
          status: 'ativo',
          centro_custo: 'Obras Públicas'
        },
        {
          id: 2,
          equipamento_id: 2,
          equipamento_nome: 'Caminhão Basculante',
          codigo_ativo: 'CAM002',
          categoria: 'Caminhão',
          tipo_alerta: 'horimetro',
          prioridade: 'media',
          titulo: 'Manutenção Próxima',
          descricao: 'Manutenção preventiva em 25 horas',
          horas_para_vencer: 25,
          horimetro_atual: 975,
          proxima_manutencao: 1000,
          data_criacao: new Date().toISOString(),
          status: 'ativo',
          centro_custo: 'Transporte'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  // Filtrar alertas
  const alertasFiltrados = alertas.filter(alerta => {
    const filtroTipoOk = filtroTipo === 'todos' || alerta.tipo_alerta === filtroTipo;
    return filtroTipoOk && alerta.status === 'ativo';
  });

  // Estatísticas
  const stats = {
    total: alertas.filter(a => a.status === 'ativo').length,
    alta: alertas.filter(a => a.prioridade === 'alta' && a.status === 'ativo').length,
    media: alertas.filter(a => a.prioridade === 'media' && a.status === 'ativo').length,
    baixa: alertas.filter(a => a.prioridade === 'baixa' && a.status === 'ativo').length
  };

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'manutencao': return <BuildIcon />;
      case 'combustivel': return <LocalGasStationIcon />;
      case 'horimetro': return <SpeedIcon />;
      default: return <WarningIcon />;
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baixa': return '#2196f3';
      default: return '#757575';
    }
  };

  const getPriorityIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'media': return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'baixa': return <CheckCircleIcon sx={{ color: '#2196f3' }} />;
      default: return <WarningIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={{ xs: 3, md: 4 }}>
        {/* Header */}
        <Box>
          <Typography variant={isMobile ? "h4" : "h3"} component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Alertas e Notificações
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitore alertas de manutenção, combustível e sistema em tempo real
          </Typography>
        </Box>

        {/* Estatísticas */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #37474f 0%, #546e7a 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total de Alertas
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <WarningIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.alta}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Prioridade Alta
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <ErrorIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.media}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Prioridade Média
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <WarningIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.baixa}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Prioridade Baixa
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <CheckCircleIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros e Ações */}
        <Paper sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant={filtroTipo === 'todos' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('todos')}
                size="small"
              >
                Todos
              </Button>
              <Button
                variant={filtroTipo === 'manutencao' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('manutencao')}
                startIcon={<BuildIcon />}
                size="small"
              >
                Manutenção
              </Button>
              <Button
                variant={filtroTipo === 'horimetro' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('horimetro')}
                startIcon={<SpeedIcon />}
                size="small"
              >
                Horímetro
              </Button>
            </Stack>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAlertas}
              disabled={loading}
            >
              Atualizar
            </Button>
          </Stack>
        </Paper>

        {/* Lista de Alertas */}
        {loading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
            <Typography sx={{ mt: 2, textAlign: 'center' }}>Carregando alertas...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {alertasFiltrados.map((alerta) => (
              <Grid key={alerta.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderLeft: `4px solid ${getPriorityColor(alerta.prioridade)}`,
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getAlertIcon(alerta.tipo_alerta)}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {alerta.titulo}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getPriorityIcon(alerta.prioridade)}
                        <Tooltip title="Ver detalhes">
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Equipamento
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {alerta.equipamento_nome}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {alerta.codigo_ativo} • {alerta.categoria}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Descrição
                        </Typography>
                        <Typography variant="body2">
                          {alerta.descricao}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Horímetro Atual
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {alerta.horimetro_atual}h
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Próxima Manutenção
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {alerta.proxima_manutencao}h
                          </Typography>
                        </Box>
                      </Box>

                      {alerta.centro_custo && (
                        <Chip 
                          label={alerta.centro_custo}
                          size="small"
                          variant="outlined"
                          sx={{ alignSelf: 'flex-start' }}
                        />
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(alerta.data_criacao).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {alertasFiltrados.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Nenhum alerta encontrado
                  </Typography>
                  <Typography color="text.secondary">
                    {filtroTipo === 'todos' 
                      ? 'Todos os equipamentos estão funcionando normalmente'
                      : `Nenhum alerta do tipo "${filtroTipo}" encontrado`
                    }
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </Container>
  );
};

export default AlertasPage;

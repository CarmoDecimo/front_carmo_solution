import { useState } from 'react';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BuildIcon from '@mui/icons-material/Build';
import SpeedIcon from '@mui/icons-material/Speed';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ConstructionIcon from '@mui/icons-material/Construction';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const IconWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: 48,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}));

const ModuleCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  },
}));

function Dashboard() {
  const [proximasManutencoes] = useState([
    { id: 1, veiculo: 'JCB 3CX', tipo: 'Troca de Óleo', data: '2025-09-20', kmPrev: '15000', status: 'pendente' },
    { id: 2, veiculo: 'Toyota Hilux', tipo: 'Revisão Geral', data: '2025-09-25', kmPrev: '10000', status: 'pendente' },
    { id: 3, veiculo: 'Caterpillar', tipo: 'Troca de Filtros', data: '2025-09-12', kmPrev: '5000', status: 'atrasado' },
  ]);

  // No futuro, estes dados virão da API
  const estatisticas = {
    totalAbastecimentos: 125,
    totalCombustivel: 2350,
    totalManutencoes: 28,
    equipamentosAtivos: 12,
    alertasAtivos: 5,
    servicosAbertos: 8
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        {/* Alertas Section */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Alertas
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Alert severity="warning" sx={{ height: '100%' }}>
                <AlertTitle>Alertas de Manutenção</AlertTitle>
                {proximasManutencoes.filter(m => m.status === 'atrasado').length > 0 ? (
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      As seguintes manutenções estão <strong>atrasadas</strong>:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {proximasManutencoes.filter(m => m.status === 'atrasado').map((manutencao) => (
                        <li key={manutencao.id}>
                          <Typography variant="body2">
                            {manutencao.veiculo} - {manutencao.tipo} - Data prevista: {manutencao.data}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  </Stack>
                ) : (
                  <Typography variant="body2">
                    Não há manutenções atrasadas.
                  </Typography>
                )}
              </Alert>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Alert severity="info" sx={{ height: '100%' }}>
                <AlertTitle>Manutenções Próximas</AlertTitle>
                {proximasManutencoes.filter(m => m.status === 'pendente').length > 0 ? (
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      As seguintes manutenções estão programadas para os próximos dias:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {proximasManutencoes.filter(m => m.status === 'pendente').map((manutencao) => (
                        <li key={manutencao.id}>
                          <Typography variant="body2">
                            {manutencao.veiculo} - {manutencao.tipo} - Data prevista: {manutencao.data}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  </Stack>
                ) : (
                  <Typography variant="body2">
                    Não há manutenções agendadas para os próximos dias.
                  </Typography>
                )}
              </Alert>
            </Grid>
          </Grid>
        </Box>

        {/* Estatísticas Section */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Estatísticas
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <IconWrapper>
                    <LocalGasStationIcon fontSize="inherit" />
                  </IconWrapper>
                  <Typography variant="h4" component="div" gutterBottom>
                    {estatisticas.totalAbastecimentos}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Abastecimentos
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <IconWrapper>
                    <LocalGasStationIcon fontSize="inherit" />
                  </IconWrapper>
                  <Typography variant="h4" component="div" gutterBottom>
                    {estatisticas.totalCombustivel}L
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Combustível Total
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <IconWrapper>
                    <BuildIcon fontSize="inherit" />
                  </IconWrapper>
                  <Typography variant="h4" component="div" gutterBottom>
                    {estatisticas.totalManutencoes}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Manutenções
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <IconWrapper>
                    <SpeedIcon fontSize="inherit" />
                  </IconWrapper>
                  <Typography variant="h4" component="div" gutterBottom>
                    {estatisticas.equipamentosAtivos}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Equipamentos
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <IconWrapper>
                    <NotificationsIcon fontSize="inherit" />
                  </IconWrapper>
                  <Typography variant="h4" component="div" gutterBottom>
                    {estatisticas.alertasAtivos}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Alertas
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <IconWrapper>
                    <ConstructionIcon fontSize="inherit" />
                  </IconWrapper>
                  <Typography variant="h4" component="div" gutterBottom>
                    {estatisticas.servicosAbertos}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Serviços Abertos
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Box>

        {/* Módulos Section */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Acesso Rápido aos Módulos
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ModuleCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ConstructionIcon color="primary" />
                      <Typography variant="h6" component="div">
                        Oficina
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Gerencie inspeções, serviços e comunicação da oficina.
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ pt: 0 }}>
                  <Button component={Link} to="/oficina" variant="contained" size="small" fullWidth>
                    Acessar
                  </Button>
                </CardActions>
              </ModuleCard>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ModuleCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalGasStationIcon color="primary" />
                      <Typography variant="h6" component="div">
                        Abastecimento
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Controle de abastecimentos e atualização automática de horímetros.
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ pt: 0 }}>
                  <Button component={Link} to="/abastecimento" variant="contained" size="small" fullWidth>
                    Acessar
                  </Button>
                </CardActions>
              </ModuleCard>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ModuleCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NotificationsIcon color="primary" />
                      <Typography variant="h6" component="div">
                        Alertas
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Visualize todos os alertas automáticos e manuais de manutenção.
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ pt: 0 }}>
                  <Button component={Link} to="/alertas" variant="contained" size="small" fullWidth>
                    Acessar
                  </Button>
                </CardActions>
              </ModuleCard>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ModuleCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonthIcon color="primary" />
                      <Typography variant="h6" component="div">
                        Calendário
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Visualize o mapa de manutenções e gere relatórios de manutenções.
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ pt: 0 }}>
                  <Button component={Link} to="/calendario" variant="contained" size="small" fullWidth>
                    Acessar
                  </Button>
                </CardActions>
              </ModuleCard>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Container>
  );
}

export default Dashboard;

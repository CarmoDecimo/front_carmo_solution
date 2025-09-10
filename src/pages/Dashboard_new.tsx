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
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BuildIcon from '@mui/icons-material/Build';
import SpeedIcon from '@mui/icons-material/Speed';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ConstructionIcon from '@mui/icons-material/Construction';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const IconWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  fontSize: 40,
  padding: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const ModuleCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
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
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        p: 3,
        overflowY: 'auto',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {/* Alertas */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Alert severity="warning" sx={{ width: '100%' }}>
            <AlertTitle>Alertas de Manutenção</AlertTitle>
            {proximasManutencoes.filter(m => m.status === 'atrasado').length > 0 ? (
              <>
                <Typography variant="body2">
                  As seguintes manutenções estão <strong>atrasadas</strong>:
                </Typography>
                <ul>
                  {proximasManutencoes.filter(m => m.status === 'atrasado').map((manutencao) => (
                    <li key={manutencao.id}>
                      {manutencao.veiculo} - {manutencao.tipo} - Data prevista: {manutencao.data}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Typography variant="body2">
                Não há manutenções atrasadas.
              </Typography>
            )}
          </Alert>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info">
            <AlertTitle>Manutenções Próximas</AlertTitle>
            {proximasManutencoes.filter(m => m.status === 'pendente').length > 0 ? (
              <>
                <Typography variant="body2">
                  As seguintes manutenções estão programadas para os próximos dias:
                </Typography>
                <ul>
                  {proximasManutencoes.filter(m => m.status === 'pendente').map((manutencao) => (
                    <li key={manutencao.id}>
                      {manutencao.veiculo} - {manutencao.tipo} - Data prevista: {manutencao.data}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Typography variant="body2">
                Não há manutenções agendadas para os próximos dias.
              </Typography>
            )}
          </Alert>
        </Grid>

        {/* Cards estatísticos */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Estatísticas
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StyledCard>
            <CardContent>
              <IconWrapper>
                <LocalGasStationIcon fontSize="inherit" />
              </IconWrapper>
              <Typography variant="h5" component="div">
                {estatisticas.totalAbastecimentos}
              </Typography>
              <Typography color="text.secondary">
                Abastecimentos
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StyledCard>
            <CardContent>
              <IconWrapper>
                <LocalGasStationIcon fontSize="inherit" />
              </IconWrapper>
              <Typography variant="h5" component="div">
                {estatisticas.totalCombustivel} Lts
              </Typography>
              <Typography color="text.secondary">
                Combustível Total
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StyledCard>
            <CardContent>
              <IconWrapper>
                <BuildIcon fontSize="inherit" />
              </IconWrapper>
              <Typography variant="h5" component="div">
                {estatisticas.totalManutencoes}
              </Typography>
              <Typography color="text.secondary">
                Manutenções
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StyledCard>
            <CardContent>
              <IconWrapper>
                <SpeedIcon fontSize="inherit" />
              </IconWrapper>
              <Typography variant="h5" component="div">
                {estatisticas.equipamentosAtivos}
              </Typography>
              <Typography color="text.secondary">
                Equipamentos
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StyledCard>
            <CardContent>
              <IconWrapper>
                <NotificationsIcon fontSize="inherit" />
              </IconWrapper>
              <Typography variant="h5" component="div">
                {estatisticas.alertasAtivos}
              </Typography>
              <Typography color="text.secondary">
                Alertas
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StyledCard>
            <CardContent>
              <IconWrapper>
                <ConstructionIcon fontSize="inherit" />
              </IconWrapper>
              <Typography variant="h5" component="div">
                {estatisticas.servicosAbertos}
              </Typography>
              <Typography color="text.secondary">
                Serviços Abertos
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Módulos principais */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Acesso Rápido aos Módulos
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ModuleCard>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <ConstructionIcon sx={{ mr: 1 }} /> Oficina
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie inspeções, serviços e comunicação da oficina.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/oficina" size="small">Acessar</Button>
            </CardActions>
          </ModuleCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ModuleCard>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalGasStationIcon sx={{ mr: 1 }} /> Abastecimento
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Controle de abastecimentos e atualização automática de horímetros.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/abastecimento" size="small">Acessar</Button>
            </CardActions>
          </ModuleCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ModuleCard>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1 }} /> Alertas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualize todos os alertas automáticos e manuais de manutenção.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/alertas" size="small">Acessar</Button>
            </CardActions>
          </ModuleCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ModuleCard>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarMonthIcon sx={{ mr: 1 }} /> Calendário
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualize o mapa de manutenções e gere relatórios de manutenções.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/calendario" size="small">Acessar</Button>
            </CardActions>
          </ModuleCard>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;

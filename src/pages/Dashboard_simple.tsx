import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  AlertTitle,
  Box,
} from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BuildIcon from '@mui/icons-material/Build';
import SpeedIcon from '@mui/icons-material/Speed';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ConstructionIcon from '@mui/icons-material/Construction';

function Dashboard() {
  const [proximasManutencoes] = useState([
    { id: 1, veiculo: 'JCB 3CX', tipo: 'Troca de Óleo', data: '2025-09-20', kmPrev: '15000', status: 'pendente' },
    { id: 2, veiculo: 'Toyota Hilux', tipo: 'Revisão Geral', data: '2025-09-25', kmPrev: '10000', status: 'pendente' },
    { id: 3, veiculo: 'Caterpillar', tipo: 'Troca de Filtros', data: '2025-09-12', kmPrev: '5000', status: 'atrasado' },
  ]);

  const [alertas] = useState([
    { id: 1, tipo: 'Manutenção', equipamento: 'Caterpillar', mensagem: 'Manutenção Preventiva Atrasada', data: '2025-09-12' },
    { id: 2, tipo: 'Horímetro', equipamento: 'JCB 3CX', mensagem: 'Limite de horas próximo', data: '2025-09-15' },
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
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
        </Grid>

        {/* Alertas */}
        <Grid item xs={12}>
          <Alert severity="warning">
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
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}>
                <LocalGasStationIcon fontSize="inherit" />
              </Box>
              <Typography variant="h5" component="div">
                {estatisticas.totalAbastecimentos}
              </Typography>
              <Typography color="text.secondary">
                Abastecimentos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}>
                <SpeedIcon fontSize="inherit" />
              </Box>
              <Typography variant="h5" component="div">
                {estatisticas.totalCombustivel} L
              </Typography>
              <Typography color="text.secondary">
                Combustível Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}>
                <BuildIcon fontSize="inherit" />
              </Box>
              <Typography variant="h5" component="div">
                {estatisticas.totalManutencoes}
              </Typography>
              <Typography color="text.secondary">
                Manutenções
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}>
                <ConstructionIcon fontSize="inherit" />
              </Box>
              <Typography variant="h5" component="div">
                {estatisticas.equipamentosAtivos}
              </Typography>
              <Typography color="text.secondary">
                Equipamentos Ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}>
                <NotificationsIcon fontSize="inherit" />
              </Box>
              <Typography variant="h5" component="div">
                {estatisticas.alertasAtivos}
              </Typography>
              <Typography color="text.secondary">
                Alertas Ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}>
                <BuildIcon fontSize="inherit" />
              </Box>
              <Typography variant="h5" component="div">
                {estatisticas.servicosAbertos}
              </Typography>
              <Typography color="text.secondary">
                Serviços Abertos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Módulos */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Módulos
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 4,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
            }
          }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <ConstructionIcon sx={{ mr: 1 }} /> Oficina
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie inspeções, serviços, e manutenções na oficina.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/oficina" size="small">Acessar</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 4,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
            }
          }}>
            <CardContent sx={{ flexGrow: 1 }}>
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
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 4,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
            }
          }}>
            <CardContent sx={{ flexGrow: 1 }}>
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
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 4,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
            }
          }}>
            <CardContent sx={{ flexGrow: 1 }}>
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
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;

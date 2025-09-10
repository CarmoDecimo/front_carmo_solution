import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';

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

const AlertCard = styled(Card)(() => ({
  transition: 'transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
}));

function AlertasPage() {
  const funcionalidades = [
    {
      title: 'Todos os Alertas',
      description: 'Visualize todos os alertas criados no sistema, independentemente da origem.',
      icon: <NotificationsIcon fontSize="large" />,
      path: '/alertas/todos'
    },
    {
      title: 'Alertas Automáticos',
      description: 'Alertas gerados automaticamente com base em horímetros e quilometragens.',
      icon: <NotificationsActiveIcon fontSize="large" />,
      path: '/alertas/automaticos'
    }
  ];

  // Exemplos de alertas para exibição rápida
  const alertasRecentes = [
    { id: 1, tipo: 'Manutenção', equipamento: 'JCB 3CX', mensagem: 'Manutenção preventiva necessária', status: 'warning' },
    { id: 2, tipo: 'Horímetro', equipamento: 'Caterpillar 320', mensagem: 'Troca de óleo necessária', status: 'danger' },
    { id: 3, tipo: 'Combustível', equipamento: 'Toyota Hilux', mensagem: 'Consumo acima da média', status: 'info' },
  ];

  // Função para renderizar o ícone conforme o status
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'danger':
        return <WarningIcon fontSize="small" sx={{ color: '#f87171' }} />;
      case 'warning':
        return <WarningIcon fontSize="small" sx={{ color: '#fdba74' }} />;
      case 'info':
        return <NotificationsIcon fontSize="small" sx={{ color: '#60a5fa' }} />;
      case 'success':
        return <CheckCircleIcon fontSize="small" sx={{ color: '#4ade80' }} />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Alertas
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Módulo de visualização e gestão de todos os alertas do sistema.
          </Typography>
        </Box>

        {/* Alertas Recentes */}
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Alertas Recentes
          </Typography>
          <Grid container spacing={3}>
            {alertasRecentes.map((alerta) => (
              <Grid key={alerta.id} size={{ xs: 12 }}>
                <AlertCard sx={{ 
                  borderLeft: `4px solid ${
                    alerta.status === 'danger' ? '#f87171' : 
                    alerta.status === 'warning' ? '#fdba74' : 
                    alerta.status === 'info' ? '#60a5fa' : '#4ade80'
                  }`
                }}>
                  <CardContent sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 2 }}>
                        {renderStatusIcon(alerta.status)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">
                          {alerta.equipamento} - {alerta.tipo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {alerta.mensagem}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </AlertCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Funcionalidades do Módulo */}
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Funcionalidades do Módulo
          </Typography>
          <Grid container spacing={3}>
            {funcionalidades.map((item, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 6 }}>
                <ModuleCard>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ mr: 2, color: 'primary.main' }}>
                        {item.icon}
                      </Box>
                      <Typography variant="h6" component="h2">
                        {item.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button 
                      component={Link} 
                      to={item.path} 
                      variant="contained" 
                      fullWidth
                      sx={{ mx: 2 }}
                    >
                      Acessar
                    </Button>
                  </CardActions>
                </ModuleCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Container>
  );
}

export default AlertasPage;

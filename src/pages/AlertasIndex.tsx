import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Alertas
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 4 }}>
        Módulo de visualização e gestão de todos os alertas do sistema.
      </Typography>

      {/* Alerta rápidos */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Alertas Recentes
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {alertasRecentes.map((alerta) => (
          <Grid item xs={12} key={alerta.id}>
            <Card sx={{ borderLeft: `4px solid ${
              alerta.status === 'danger' ? '#f87171' : 
              alerta.status === 'warning' ? '#fdba74' : 
              alerta.status === 'info' ? '#60a5fa' : '#4ade80'
            }` }}>
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
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Funcionalidades */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Funcionalidades do Módulo
      </Typography>
      <Grid container spacing={3}>
        {funcionalidades.map((item, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
              }
            }}>
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
              <CardActions>
                <Button 
                  component={Link} 
                  to={item.path} 
                  variant="contained" 
                  size="small"
                >
                  Acessar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default AlertasPage;

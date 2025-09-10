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
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SpeedIcon from '@mui/icons-material/Speed';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import BugReportIcon from '@mui/icons-material/BugReport';
import { styled } from '@mui/material/styles';
import { testarAbastecimento } from '../templates/abastecimento/test-abastecimento';

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

function AbastecimentoPage() {
  const funcionalidades = [
    {
      title: 'Controle de Abastecimento',
      description: 'Registre o abastecimento de combustível em veículos e equipamentos.',
      icon: <LocalGasStationIcon fontSize="large" />,
      path: '/abastecimento/controle'
    },
    {
      title: 'Horímetros',
      description: 'Acompanhe e gerencie horímetros e quilometragens dos equipamentos.',
      icon: <SpeedIcon fontSize="large" />,
      path: '/horimetros'
    },
    {
      title: 'Alertas de Manutenção',
      description: 'Visualize alertas automáticos gerados com base no consumo de combustível.',
      icon: <NotificationsActiveIcon fontSize="large" />,
      path: '/alertas/automaticos'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Abastecimento
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Módulo de controle de combustível, atualização de horímetros e geração de alertas.
          </Typography>
          
          {/* Botão de Teste - Apenas para desenvolvimento */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<BugReportIcon />}
              onClick={async () => {
                console.log('🧪 Iniciando teste...');
                await testarAbastecimento();
              }}
            >
              Testar Template Excel
            </Button>
          </Box>
        </Box>

        {/* Funcionalidades Section */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Funcionalidades Disponíveis
          </Typography>
          <Grid container spacing={3}>
            {funcionalidades.map((item, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <ModuleCard>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ color: 'primary.main' }}>
                          {item.icon}
                        </Box>
                        <Typography variant="h6" component="h2">
                          {item.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ pt: 0 }}>
                    <Button 
                      component={Link} 
                      to={item.path} 
                      variant="contained" 
                      size="small"
                      fullWidth
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

export default AbastecimentoPage;

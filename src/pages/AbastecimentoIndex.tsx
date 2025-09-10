import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SpeedIcon from '@mui/icons-material/Speed';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { Box } from '@mui/material';

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
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Abastecimento
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 4 }}>
        Módulo de controle de combustível, atualização de horímetros e geração de alertas.
      </Typography>

      <Grid container spacing={3}>
        {funcionalidades.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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

export default AbastecimentoPage;

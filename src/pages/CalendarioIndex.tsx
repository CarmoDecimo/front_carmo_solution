import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SummarizeIcon from '@mui/icons-material/Summarize';
import EventIcon from '@mui/icons-material/Event';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

function CalendarioPage() {
  const funcionalidades = [
    {
      title: 'Mapa de Manutenções',
      description: 'Visualize todas as manutenções agendadas e realizadas em formato de calendário.',
      icon: <CalendarMonthIcon fontSize="large" />,
      path: '/calendario/mapa'
    },
    {
      title: 'Relatório de Manutenções',
      description: 'Gere relatórios e exporte listagens de todas as manutenções concluídas.',
      icon: <SummarizeIcon fontSize="large" />,
      path: '/calendario/relatorios'
    }
  ];

  // Exemplos de próximos eventos para exibição rápida
  const proximosEventos = [
    { id: 1, data: '12/09/2025', equipamento: 'Caterpillar 320', tipo: 'Revisão geral' },
    { id: 2, data: '15/09/2025', equipamento: 'Toyota Hilux', tipo: 'Troca de óleo' },
    { id: 3, data: '18/09/2025', equipamento: 'JCB 3CX', tipo: 'Inspeção de sistema hidráulico' },
  ];

  // Resumo mensal
  const resumoMensal = {
    agendadas: 12,
    concluidas: 8,
    atrasadas: 2,
    canceladas: 1,
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Calendário de Manutenção
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 4 }}>
        Visualize e gerencie o calendário de manutenções e relatórios.
      </Typography>

      {/* Resumo mensal */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Resumo do Mês (Setembro 2025)
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3} md={3}>
          <Card sx={{ 
            backgroundColor: 'rgba(96, 165, 250, 0.1)', 
            borderTop: '4px solid #60a5fa'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventIcon sx={{ color: '#60a5fa', mb: 1 }} />
              <Typography variant="h4" component="div">
                {resumoMensal.agendadas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agendadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3} md={3}>
          <Card sx={{ 
            backgroundColor: 'rgba(74, 222, 128, 0.1)', 
            borderTop: '4px solid #4ade80'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventAvailableIcon sx={{ color: '#4ade80', mb: 1 }} />
              <Typography variant="h4" component="div">
                {resumoMensal.concluidas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Concluídas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3} md={3}>
          <Card sx={{ 
            backgroundColor: 'rgba(248, 113, 113, 0.1)', 
            borderTop: '4px solid #f87171'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventIcon sx={{ color: '#f87171', mb: 1 }} />
              <Typography variant="h4" component="div">
                {resumoMensal.atrasadas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Atrasadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3} md={3}>
          <Card sx={{ 
            backgroundColor: 'rgba(148, 163, 184, 0.1)', 
            borderTop: '4px solid #94a3b8'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventIcon sx={{ color: '#94a3b8', mb: 1 }} />
              <Typography variant="h4" component="div">
                {resumoMensal.canceladas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Canceladas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Próximos eventos */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Próximas Manutenções Programadas
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {proximosEventos.map((evento) => (
          <Grid item xs={12} sm={4} key={evento.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {evento.data}
                  </Typography>
                  <EventIcon sx={{ color: 'primary.main' }} />
                </Box>
                <Typography variant="body1">
                  {evento.equipamento}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {evento.tipo}
                </Typography>
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
          <Grid item xs={12} sm={6} key={index}>
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

export default CalendarioPage;

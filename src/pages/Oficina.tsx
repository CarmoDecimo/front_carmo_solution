import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';
import ForumIcon from '@mui/icons-material/Forum';
import SummarizeIcon from '@mui/icons-material/Summarize';

function OficinaPage() {
  const funcionalidades = [
    {
      title: 'Ficha de Inspeção',
      description: 'Preencha manualmente as fichas de inspeção de equipamentos e veículos.',
      icon: <AssignmentIcon fontSize="large" />,
      path: '/oficina/inspecao'
    },
    {
      title: 'Ficha de Serviços',
      description: 'Registre os serviços de manutenção realizados nos equipamentos e veículos.',
      icon: <BuildIcon fontSize="large" />,
      path: '/oficina/servicos'
    },
    {
      title: 'Ficha de Comunicação',
      description: 'Comunique problemas, requisições ou informações relacionadas à manutenção.',
      icon: <ForumIcon fontSize="large" />,
      path: '/oficina/comunicacao'
    },
    {
      title: 'Relatório de Manutenção',
      description: 'Gere e visualize relatórios detalhados de manutenções realizadas.',
      icon: <SummarizeIcon fontSize="large" />,
      path: '/oficina/relatorio'
    }
  ];

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Oficina
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 4 }}>
        Módulo de gestão de manutenção com fichas de controle e relatórios.
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
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ marginRight: '16px', color: '#60a5fa' }}>
                    {item.icon}
                  </div>
                  <Typography variant="h6" component="h2">
                    {item.title}
                  </Typography>
                </div>
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
    </div>
  );
}

export default OficinaPage;

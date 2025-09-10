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
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';
import ForumIcon from '@mui/icons-material/Forum';
import SummarizeIcon from '@mui/icons-material/Summarize';
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Oficina
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Módulo de gestão de manutenção com fichas de controle e relatórios.
          </Typography>
        </Box>

        {/* Funcionalidades Section */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Funcionalidades Disponíveis
          </Typography>
          <Grid container spacing={3}>
            {funcionalidades.map((item, index) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
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

export default OficinaPage;

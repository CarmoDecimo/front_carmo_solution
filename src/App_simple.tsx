import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Abastecimento from './pages/Abastecimento';
import Manutencao from './pages/Manutencao';
import Horimetros from './pages/Horimetros';
import OficinaPage from './pages/Oficina';
import AbastecimentoIndex from './pages/AbastecimentoIndex';
import AlertasIndex from './pages/AlertasIndex';
import CalendarioIndex from './pages/CalendarioIndex';
import './App.css';

function App() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Largura da sidebar, definida em pixels para maior precisão
  const DRAWER_WIDTH = 240;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <Sidebar open={drawerOpen} onClose={toggleDrawer} />
      
      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 8, // Espaço para o header
          width: { xs: '100%', sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { xs: 0, sm: `${DRAWER_WIDTH}px` },
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'background.default',
        }}
      >
        <Header toggleDrawer={toggleDrawer} />
        
        <Box sx={{ mt: 2 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Autenticação */}
            <Route path="/auth" element={<div>Login/Cadastro</div>} />
            
            {/* Módulo 1: Oficina */}
            <Route path="/oficina" element={<OficinaPage />} />
            <Route path="/oficina/inspecao" element={<div>Ficha de Inspeção</div>} />
            <Route path="/oficina/servicos" element={<div>Ficha de Serviços</div>} />
            <Route path="/oficina/comunicacao" element={<div>Ficha de Comunicação</div>} />
            <Route path="/oficina/relatorio" element={<div>Relatório de Manutenção</div>} />
            
            {/* Módulo 2: Abastecimento */}
            <Route path="/abastecimento" element={<AbastecimentoIndex />} />
            <Route path="/abastecimento/controle" element={<Abastecimento />} />
            <Route path="/horimetros" element={<Horimetros />} />
            
            {/* Módulo 3: Alertas */}
            <Route path="/alertas" element={<AlertasIndex />} />
            <Route path="/alertas/todos" element={<div>Todos os Alertas</div>} />
            <Route path="/alertas/automaticos" element={<div>Alertas Automáticos</div>} />
            
            {/* Módulo 4: Calendário de Manutenção */}
            <Route path="/calendario" element={<CalendarioIndex />} />
            <Route path="/calendario/mapa" element={<Manutencao />} />
            <Route path="/calendario/relatorios" element={<div>Relatórios de Manutenção</div>} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default App;

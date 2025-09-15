import { useState } from 'react';
import CentroCustoPage from './pages/CentroCusto';
import EquipamentosPage from './pages/Equipamentos';
import GestaoCategorias from './pages/GestaoCategorias';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
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
import GestaoUsuarios from './pages/GestaoUsuarios';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import { AuthProvider } from './contexts/auth/AuthContext';
import { ProtectedRoute, PublicRoute } from './contexts/auth/ProtectedRoute';
import './App.css';

// Componente de layout protegido com cabeçalho e sidebar
const ProtectedLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <Sidebar open={drawerOpen} onClose={toggleDrawer} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Header toggleDrawer={toggleDrawer} />
        <Box
          sx={{
            flexGrow: 1,
            pt: 8,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rota padrão - redireciona para login se não autenticado, ou dashboard se autenticado */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rotas públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/esqueci-senha" element={<ForgotPasswordPage />} />
        </Route>
        
        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            {/* Página inicial */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Módulo 1: Oficina */}
            <Route path="/oficina" element={<OficinaPage />} />
            <Route path="/oficina/inspecao" element={
              <Box sx={{ p: 3 }}>
                <h2 className="text-2xl font-semibold mb-4">Ficha de Inspeção</h2>
                <p className="text-gray-600">Gerenciamento de inspeções de veículos e equipamentos</p>
              </Box>
            } />
            <Route path="/oficina/servicos" element={
              <Box sx={{ p: 3 }}>
                <h2 className="text-2xl font-semibold mb-4">Ficha de Serviços</h2>
                <p className="text-gray-600">Controle de serviços realizados na oficina</p>
              </Box>
            } />
            <Route path="/oficina/comunicacao" element={
              <Box sx={{ p: 3 }}>
                <h2 className="text-2xl font-semibold mb-4">Ficha de Comunicação</h2>
                <p className="text-gray-600">Registro de comunicações entre equipes</p>
              </Box>
            } />
            <Route path="/oficina/relatorio" element={
              <Box sx={{ p: 3 }}>
                <h2 className="text-2xl font-semibold mb-4">Relatório de Manutenção</h2>
                <p className="text-gray-600">Relatórios detalhados de manutenções realizadas</p>
              </Box>
            } />
            
            {/* Módulo 2: Abastecimento */}
            <Route path="/abastecimento" element={<AbastecimentoIndex />} />
            <Route path="/abastecimento/controle" element={<Abastecimento />} />
            <Route path="/horimetros" element={<Horimetros />} />
            
            {/* Módulo 3: Alertas */}
            <Route path="/alertas" element={<AlertasIndex />} />
            <Route path="/alertas/todos" element={
              <Box sx={{ p: 3 }}>
                <h2 className="text-2xl font-semibold mb-4">Todos os Alertas</h2>
                <p className="text-gray-600">Listagem de todos os alertas do sistema</p>
              </Box>
            } />
            <Route path="/alertas/automaticos" element={
              <Box sx={{ p: 3 }}>
                <h2 className="text-2xl font-semibold mb-4">Alertas Automáticos</h2>
                <p className="text-gray-600">Alertas gerados automaticamente pelo sistema</p>
              </Box>
            } />
            
            {/* Módulo 4: Calendário de Manutenção */}
            <Route path="/calendario" element={<CalendarioIndex />} />
            <Route path="/calendario/mapa" element={<Manutencao />} />
            <Route path="/calendario/relatorios" element={
              <Box sx={{ p: 3 }}>
                <h2 className="text-2xl font-semibold mb-4">Relatórios de Manutenção</h2>
                <p className="text-gray-600">Relatórios programados de manutenções futuras</p>
              </Box>
            } />
            
            {/* Módulo 5: Gestão de Usuários */}
            <Route path="/usuarios" element={<GestaoUsuarios />} />

            {/* Módulo 6: Centro de custo */}
            <Route path="/centro-custo" element={<CentroCustoPage />} />
            
            {/* Módulo 7: Equipamentos */}
            <Route path="/equipamentos" element={<EquipamentosPage />} />
            
            {/* Módulo 8: Gestão de Categorias */}
            <Route path="/categorias" element={<GestaoCategorias />} />
          </Route>
        </Route>
        
        {/* Rota coringa para qualquer outro caminho não definido */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Abastecimento from './pages/Abastecimento'
import Manutencao from './pages/Manutencao'
import Horimetros from './pages/Horimetros'
import OficinaPage from './pages/Oficina'
import AbastecimentoIndex from './pages/AbastecimentoIndex'
import AlertasIndex from './pages/AlertasIndex'
import CalendarioIndex from './pages/CalendarioIndex'
import './App.css'

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header toggleDrawer={toggleDrawer} />
      <Sidebar open={drawerOpen} onClose={toggleDrawer} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // Para ficar abaixo do AppBar
          px: 3,
          pb: 3,
          width: { sm: `calc(100% - 240px)` }
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Routes>
            {/* Página inicial */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Autenticação */}
            <Route path="/auth" element={<div>Página de Login/Cadastro</div>} />
            
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
        </Container>
      </Box>
    </Box>
  )
}

export default App

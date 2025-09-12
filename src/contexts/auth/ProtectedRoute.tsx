import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import { Box, CircularProgress } from '@mui/material';

// Componente que redireciona para o login se o usuário não estiver autenticado
export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Se não estiver autenticado, redireciona para a página de login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Componente que redireciona para o dashboard se o usuário já estiver autenticado
export const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Se estiver autenticado, redireciona para a página inicial
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

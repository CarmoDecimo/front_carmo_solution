import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthErrorHandler } from '../services/api';
import { useAuth } from '../contexts/auth/AuthContext';

/**
 * Hook para interceptar erros de autenticação e redirecionar para login
 * Deve ser usado no componente raiz da aplicação
 */
export const useAuthInterceptor = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Configura o handler de erro de autenticação
    const handleAuthError = () => {
      // Faz logout limpo
      logout();
      
      // Redireciona para login
      navigate('/login', { replace: true });
    };

    // Registra o handler na API
    setAuthErrorHandler(handleAuthError);

    // Cleanup: remove o handler quando o componente for desmontado
    return () => {
      setAuthErrorHandler(() => {});
    };
  }, [navigate, logout]);
};
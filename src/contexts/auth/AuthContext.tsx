import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../../services';

// Interface local para o usuário no contexto (pode ser mais flexível)
interface User {
  id: string;
  email: string;
  nome?: string;
  funcao?: string;
  departamento?: string;
  created_at?: string;
}

// Define o tipo para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Cria o contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Props para o provedor de autenticação
interface AuthProviderProps {
  children: ReactNode;
}

// Provedor de autenticação
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Usa o serviço de autenticação para verificar o usuário
        const userData = await authService.me();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('authToken', response.session.token);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    setLoading(true);
    
    // Chama o endpoint de logout usando o serviço
    const token = localStorage.getItem('authToken');
    if (token) {
      authService.logout().catch(error => console.error('Erro no logout:', error));
    }
    
    // Remove o token e limpa o estado do usuário
    localStorage.removeItem('authToken');
    setUser(null);
    setLoading(false);
  };

  // Valor do contexto
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

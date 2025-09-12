# 📝 Documentação da API de Autenticação

Este documento descreve como utilizar as rotas de autenticação para integração com o frontend.

## 🌐 Configuração Base

- **URL Base**: `http://localhost:3001` (desenvolvimento)
- **Prefixo da API**: `/api`
- **Content-Type**: `application/json`

## 🔐 Rotas de Autenticação

### 1. Registro de Usuário

Cria uma nova conta de usuário no sistema.

```
POST /api/auth/register
```

#### Parâmetros de Requisição:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| email | string | Sim | Email do usuário |
| password | string | Sim | Senha do usuário |
| nome | string | Não | Nome completo do usuário |
| funcao | string | Não | Função/cargo do usuário |
| departamento | string | Não | Departamento do usuário |

#### Exemplo de Requisição:

```javascript
fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    password: 'senha123',
    nome: 'João Silva',
    funcao: 'Operador',
    departamento: 'Manutenção'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error));
```

#### Resposta de Sucesso (201 Created):

```json
{
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
    "email": "usuario@exemplo.com",
    "nome": "João Silva",
    "funcao": "Operador",
    "departamento": "Manutenção"
  }
}
```

#### Respostas de Erro:

- **400 Bad Request**: Parâmetros inválidos ou ausentes
- **409 Conflict**: Email já está em uso
- **500 Internal Server Error**: Erro no servidor

---

### 2. Login

Autentica um usuário e retorna um token JWT para acesso.

```
POST /api/auth/login
```

#### Parâmetros de Requisição:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| email | string | Sim | Email do usuário |
| password | string | Sim | Senha do usuário |

#### Exemplo de Requisição:

```javascript
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    password: 'senha123'
  })
})
.then(response => response.json())
.then(data => {
  // Armazenar o token para uso futuro
  localStorage.setItem('authToken', data.session.token);
  console.log(data);
})
.catch(error => console.error('Erro:', error));
```

#### Resposta de Sucesso (200 OK):

```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
    "email": "usuario@exemplo.com",
    "nome": "João Silva",
    "funcao": "Operador",
    "departamento": "Manutenção"
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2025-09-15T14:30:00.000Z"
  }
}
```

#### Respostas de Erro:

- **400 Bad Request**: Parâmetros inválidos ou ausentes
- **401 Unauthorized**: Credenciais inválidas
- **500 Internal Server Error**: Erro no servidor

---

### 3. Obter Dados do Usuário Atual

Recupera informações do usuário autenticado.

```
GET /api/auth/me
```

#### Cabeçalhos:

| Campo | Valor | Descrição |
|-------|-------|-----------|
| Authorization | Bearer {token} | Token JWT obtido no login |

#### Exemplo de Requisição:

```javascript
// Recuperar o token armazenado
const token = localStorage.getItem('authToken');

fetch('http://localhost:3001/api/auth/me', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error));
```

#### Resposta de Sucesso (200 OK):

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  "email": "usuario@exemplo.com",
  "nome": "João Silva",
  "funcao": "Operador",
  "departamento": "Manutenção",
  "created_at": "2025-09-01T10:00:00.000Z"
}
```

#### Respostas de Erro:

- **401 Unauthorized**: Token ausente ou inválido
- **500 Internal Server Error**: Erro no servidor

---

### 4. Logout

Encerra a sessão do usuário atual.

```
POST /api/auth/logout
```

#### Cabeçalhos:

| Campo | Valor | Descrição |
|-------|-------|-----------|
| Authorization | Bearer {token} | Token JWT obtido no login |

#### Exemplo de Requisição:

```javascript
// Recuperar o token armazenado
const token = localStorage.getItem('authToken');

fetch('http://localhost:3001/api/auth/logout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  // Limpar o token armazenado
  localStorage.removeItem('authToken');
  console.log(data);
})
.catch(error => console.error('Erro:', error));
```

#### Resposta de Sucesso (200 OK):

```json
{
  "message": "Logout realizado com sucesso"
}
```

#### Respostas de Erro:

- **401 Unauthorized**: Token ausente ou inválido
- **500 Internal Server Error**: Erro no servidor

---

## 🛠️ Implementação no React

### Exemplo de Serviço de Autenticação:

```javascript
// src/services/authService.js
const API_URL = 'http://localhost:3001/api';

export const authService = {
  async register(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao registrar usuário');
    }
    
    return response.json();
  },
  
  async login(credentials) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao fazer login');
    }
    
    const data = await response.json();
    // Armazenar token e dados do usuário
    localStorage.setItem('authToken', data.session.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },
  
  async getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        return null;
      }
      
      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  },
  
  async logout() {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Sempre limpar dados de autenticação locais
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
};
```

### Hook de Contexto de Autenticação:

```javascript
// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUser();
  }, []);

  async function login(credentials) {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  }

  async function register(userData) {
    const response = await authService.register(userData);
    return response;
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Componente de Rota Protegida:

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

### Utilização nas Rotas:

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          {/* Outras rotas protegidas */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

## 🔍 Tratamento de Erros

É recomendável implementar tratamento de erros para lidar com situações como:

- Token expirado
- Servidor indisponível
- Erro de rede
- Validação de formulários no frontend

Exemplo de interceptor para tratamento global de erros:

```javascript
// src/services/api.js
import { authService } from './authService';

export const api = {
  async fetch(url, options = {}) {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    try {
      const response = await fetch(url, options);
      
      if (response.status === 401) {
        // Token inválido ou expirado
        authService.logout();
        window.location.href = '/login?expired=true';
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro na requisição');
      }
      
      return response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }
};
```

## 📱 Boas Práticas

1. **Sempre verifique a autenticação** antes de realizar operações sensíveis
2. **Nunca armazene senhas** no localStorage ou em estados do React
3. **Implemente logout automático** quando o token expirar
4. **Use HTTPS** em ambientes de produção
5. **Sanitize todas as entradas** de usuários para evitar ataques XSS
6. **Implemente validação de formulários** tanto no frontend quanto no backend
7. **Adicione indicadores de carregamento** durante operações de autenticação

---

## 📚 Recursos Adicionais

- [Documentação do Supabase Auth](https://supabase.io/docs/guides/auth)
- [Estratégias de autenticação em SPAs](https://auth0.com/blog/complete-guide-to-react-user-authentication/)
- [Boas práticas de segurança para React](https://reactjs.org/docs/security.html)

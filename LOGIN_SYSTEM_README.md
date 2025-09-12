# 🔐 Sistema de Autenticação - Frontend

Este documento descreve o sistema de autenticação implementado no frontend da aplicação Carmo Control.

## 📋 Funcionalidades Implementadas

### ✅ Página de Login
- Interface responsiva com Material-UI
- Validação de campos obrigatórios
- Alternância de visibilidade da senha
- Mensagens de erro e carregamento
- Redirecionamento automático após login bem-sucedido

### ✅ Sistema de Rotas Protegidas
- Rotas públicas (apenas para usuários não autenticados)
- Rotas protegidas (apenas para usuários autenticados)
- Redirecionamento automático baseado no status de autenticação
- Loading state durante verificação de autenticação

### ✅ Contexto de Autenticação
- Gerenciamento global do estado de autenticação
- Verificação automática de token ao carregar a aplicação
- Persistência do token no localStorage
- Funções de login e logout

### ✅ Header com Logout
- Exibição do nome/email do usuário logado
- Botão de logout responsivo
- Limpeza automática da sessão

### ✅ Página de Recuperação de Senha
- Interface para solicitação de recuperação
- Validação de email
- Feedback visual para o usuário

## 🚀 Como Funciona

### Fluxo de Autenticação

1. **Acesso Inicial**: Usuário acessa qualquer URL
2. **Verificação**: Sistema verifica se há token válido no localStorage
3. **Redirecionamento**:
   - Se **não autenticado** → Redireciona para `/login`
   - Se **autenticado** → Permite acesso às rotas protegidas

### Estrutura de Rotas

```
/ (raiz)
├── /login (pública)
├── /auth/esqueci-senha (pública)
└── /dashboard (protegida - página inicial)
    ├── /oficina/* (protegidas)
    ├── /abastecimento/* (protegidas)
    ├── /alertas/* (protegidas)
    └── /calendario/* (protegidas)
```

## 🔧 Arquivos Criados/Modificados

### Novos Arquivos
- `src/contexts/auth/AuthContext.tsx` - Contexto de autenticação
- `src/contexts/auth/ProtectedRoute.tsx` - Componentes de proteção de rotas
- `src/pages/auth/LoginPage.tsx` - Página de login
- `src/pages/auth/LoginPage.css` - Estilos da página de login
- `src/pages/auth/ForgotPasswordPage.tsx` - Página de recuperação de senha

### Arquivos Modificados
- `src/App.tsx` - Estrutura de rotas com autenticação
- `src/components/layout/Header.tsx` - Adicionado botão de logout
- `src/main.tsx` - Já estava configurado com BrowserRouter

## 🎨 Interface da Página de Login

### Design
- Layout centralizado e responsivo
- Card com elevação e bordas arredondadas
- Logo da empresa
- Campos de email e senha
- Botão de login com loading state
- Links para recuperação de senha
- Footer com copyright

### Responsividade
- Funciona em dispositivos móveis e desktop
- Botões adaptativos (texto em desktop, ícone em mobile)
- Campos de entrada otimizados para touch

## 🔒 Segurança

### Token JWT
- Armazenado no localStorage
- Enviado no header Authorization como Bearer token
- Verificação automática da validade
- Remoção automática em caso de erro

### Validações
- Campos obrigatórios
- Formato de email
- Mensagens de erro específicas
- Prevenção de múltiplos envios

## 🌐 Integração com Backend

### Endpoints Utilizados
- `POST /api/auth/login` - Autenticação
- `GET /api/auth/me` - Verificação do usuário
- `POST /api/auth/logout` - Encerramento de sessão

### Headers Padrão
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}'
}
```

## 📱 Uso da Aplicação

### Para Usuários
1. **Acesso**: Vá para qualquer URL da aplicação
2. **Login**: Se não autenticado, será redirecionado para `/login`
3. **Credenciais**: Digite email e senha
4. **Dashboard**: Após login, acesso completo ao sistema
5. **Logout**: Clique no botão "Sair" no cabeçalho

### Para Desenvolvedores
1. **Contexto**: Use `useAuth()` em qualquer componente para acessar:
   - `user`: Dados do usuário logado
   - `loading`: Estado de carregamento
   - `login(email, password)`: Função de login
   - `logout()`: Função de logout
   - `isAuthenticated`: Boolean do status de autenticação

2. **Proteção de Rotas**: Envolva rotas com:
   - `<ProtectedRoute>` para rotas que precisam de autenticação
   - `<PublicRoute>` para rotas apenas para não autenticados

## 🔄 Estados da Aplicação

### Loading
- Exibido durante verificação inicial de autenticação
- Mostrado durante processo de login
- Spinner centralizado na tela

### Authenticated
- Usuário tem acesso a todas as rotas protegidas
- Header mostra nome/email do usuário
- Botão de logout disponível

### Unauthenticated
- Redirecionamento automático para `/login`
- Acesso apenas a rotas públicas
- Interface de login disponível

## 🚀 Próximos Passos Sugeridos

1. **Refresh Token**: Implementar renovação automática de tokens
2. **Roles/Permissions**: Sistema de permissões baseado em funções
3. **Two-Factor Auth**: Autenticação de dois fatores
4. **Remember Me**: Opção de lembrar credenciais
5. **Social Login**: Login com Google, Microsoft, etc.
6. **Password Strength**: Indicador de força da senha
7. **Account Lockout**: Bloqueio após tentativas falhadas

## 🎯 Conclusão

O sistema de autenticação está **totalmente funcional** e implementa as melhores práticas de segurança para aplicações React. A página de login é agora a **primeira tela** mostrada aos usuários, garantindo que apenas usuários autenticados tenham acesso ao sistema.

A implementação é **escalável** e **mantível**, permitindo fácil adição de novas funcionalidades de autenticação no futuro.

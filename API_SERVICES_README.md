# 🌐 Serviços de API - Frontend

Este documento descreve como usar os serviços de API criados para comunicação com o backend.

## 📁 Estrutura dos Serviços

```
src/services/
├── api.ts                    # Configuração base da API
├── authService.ts           # Serviços de autenticação
├── abastecimentoService.ts  # Serviços de abastecimento
├── oficinaService.ts        # Serviços de oficina/manutenção
├── alertasService.ts        # Serviços de alertas
├── veiculosService.ts       # Serviços de veículos e horímetros
└── index.ts                 # Exportações centralizadas
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```bash
# URL do Backend
VITE_API_BASE_URL=http://localhost:3001

# Outras configurações
VITE_APP_NAME=Carmo Control
VITE_APP_VERSION=1.0.0
```

### Arquivo api.ts

O arquivo `api.ts` contém:
- **Configuração base**: URL do backend e headers padrão
- **Autenticação automática**: Adiciona token JWT automaticamente
- **Tratamento de erros**: Classe `ApiException` para erros customizados
- **Métodos HTTP**: GET, POST, PUT, PATCH, DELETE, UPLOAD

## 🔧 Como Usar

### Importação

```typescript
import { authService, veiculosService, api } from '../services';
// ou importações específicas
import { authService } from '../services/authService';
```

### Exemplos de Uso

#### 1. Autenticação

```typescript
import { authService } from '../services';

// Login
try {
  const response = await authService.login({
    email: 'usuario@email.com',
    password: 'senha123'
  });
  console.log('Login realizado:', response.user);
} catch (error) {
  console.error('Erro no login:', error);
}

// Obter usuário atual
try {
  const user = await authService.me();
  console.log('Usuário logado:', user);
} catch (error) {
  console.error('Usuário não autenticado');
}

// Logout
await authService.logout();
```

#### 2. Veículos

```typescript
import { veiculosService } from '../services';

// Listar veículos
const veiculos = await veiculosService.getAll();

// Criar novo veículo
const novoVeiculo = await veiculosService.create({
  placa: 'ABC-1234',
  modelo: 'Civic',
  marca: 'Honda',
  ano: 2020,
  cor: 'Prata',
  combustivel: 'flex',
  km_atual: 50000
});

// Atualizar quilometragem
await veiculosService.updateKm('veiculo-id', 51000);
```

#### 3. Abastecimento

```typescript
import { abastecimentoService } from '../services';

// Registrar abastecimento
const abastecimento = await abastecimentoService.create({
  veiculo_id: 'veiculo-id',
  data_abastecimento: '2025-09-12',
  km_atual: 51000,
  litros_abastecidos: 40,
  valor_total: 280.00,
  valor_por_litro: 7.00,
  posto: 'Posto XYZ',
  motorista: 'João Silva'
});

// Obter relatório de consumo
const relatorio = await abastecimentoService.getRelatorioConsumo('veiculo-id', {
  inicio: '2025-09-01',
  fim: '2025-09-30'
});
```

#### 4. Alertas

```typescript
import { alertasService } from '../services';

// Obter alertas ativos
const alertasAtivos = await alertasService.getAtivos();

// Criar novo alerta
const alerta = await alertasService.create({
  tipo: 'manutencao',
  prioridade: 'alta',
  titulo: 'Revisão Programada',
  descricao: 'Veículo ABC-1234 precisa de revisão',
  veiculo_id: 'veiculo-id',
  data_vencimento: '2025-09-20'
});

// Marcar como lido
await alertasService.marcarComoLido('alerta-id');

// Resolver alerta
await alertasService.resolver('alerta-id');
```

#### 5. Oficina/Manutenção

```typescript
import { oficinaService } from '../services';

// Registrar manutenção
const manutencao = await oficinaService.createManutencao({
  veiculo_id: 'veiculo-id',
  tipo_manutencao: 'preventiva',
  data_manutencao: '2025-09-12',
  km_manutencao: 51000,
  descricao: 'Troca de óleo e filtros',
  servicos_realizados: ['Troca de óleo', 'Troca de filtro'],
  pecas_utilizadas: [
    {
      nome: 'Óleo 5W30',
      quantidade: 4,
      valor_unitario: 25.00,
      valor_total: 100.00
    }
  ],
  valor_mao_obra: 50.00,
  valor_pecas: 100.00,
  oficina: 'Oficina ABC',
  responsavel: 'Mecânico João'
});

// Obter relatório de manutenções
const relatorio = await oficinaService.getRelatorioManutencoes({
  inicio: '2025-09-01',
  fim: '2025-09-30'
});
```

#### 6. Horímetros

```typescript
import { horimetroService } from '../services';

// Registrar horímetro
const horimetro = await horimetroService.create({
  veiculo_id: 'veiculo-id',
  data_registro: '2025-09-12',
  horas_atual: 1250,
  horas_trabalhadas: 8,
  operador: 'Operador Silva'
});

// Obter último registro
const ultimo = await horimetroService.getUltimoByVeiculo('veiculo-id');
```

## 🚨 Tratamento de Erros

### Classe ApiException

```typescript
import { ApiException } from '../services';

try {
  const data = await veiculosService.getById('id-invalido');
} catch (error) {
  if (error instanceof ApiException) {
    console.log('Status:', error.status);
    console.log('Mensagem:', error.message);
    console.log('Dados:', error.data);
    
    switch (error.status) {
      case 401:
        // Usuário não autenticado
        break;
      case 403:
        // Sem permissão
        break;
      case 404:
        // Não encontrado
        break;
      case 500:
        // Erro interno do servidor
        break;
    }
  }
}
```

### Padrão de Tratamento

```typescript
const handleApiCall = async () => {
  try {
    setLoading(true);
    const result = await someApiService.someMethod();
    setData(result);
  } catch (error) {
    if (error instanceof ApiException) {
      setError(error.message);
    } else {
      setError('Erro inesperado');
    }
  } finally {
    setLoading(false);
  }
};
```

## 🔐 Autenticação Automática

Os serviços gerenciam automaticamente:
- **Token JWT**: Adicionado em todas as requisições autenticadas
- **Headers**: Content-Type e Authorization configurados automaticamente
- **Renovação**: Remove token automaticamente se inválido

## 📊 Tipos TypeScript

Todos os serviços são tipados com TypeScript:

```typescript
// Tipos de requisição e resposta
import type {
  LoginRequest,
  LoginResponse,
  User,
  Veiculo,
  CreateVeiculoRequest,
  Abastecimento,
  Manutencao
} from '../services';

// Uso com tipos
const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return authService.login(credentials);
};
```

## 🌍 Configuração de Ambiente

### Desenvolvimento
```bash
VITE_API_BASE_URL=http://localhost:3001
```

### Produção
```bash
VITE_API_BASE_URL=https://api.carmocontrol.com
```

### Teste
```bash
VITE_API_BASE_URL=https://api-test.carmocontrol.com
```

## 📝 Boas Práticas

### 1. Sempre usar try/catch
```typescript
try {
  const data = await apiService.getData();
  // sucesso
} catch (error) {
  // tratar erro
}
```

### 2. Loading states
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await apiService.getData();
    setData(data);
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
};
```

### 3. Validação de dados
```typescript
// Validar antes de enviar
if (!email || !password) {
  throw new Error('Campos obrigatórios');
}

const result = await authService.login({ email, password });
```

### 4. Cache quando apropriado
```typescript
// Para dados que não mudam frequentemente
const [veiculos, setVeiculos] = useState([]);

useEffect(() => {
  if (veiculos.length === 0) {
    fetchVeiculos();
  }
}, []);
```

## 🚀 Extensibilidade

### Adicionando Novos Serviços

1. Criar arquivo do serviço (ex: `equipamentosService.ts`)
2. Definir interfaces
3. Implementar métodos usando `api.get()`, `api.post()`, etc.
4. Exportar no `index.ts`

```typescript
// equipamentosService.ts
import { api } from './api';

export interface Equipamento {
  id: string;
  nome: string;
  // ...
}

export const equipamentosService = {
  getAll: () => api.get<Equipamento[]>('/api/equipamentos'),
  create: (data: CreateEquipamentoRequest) => api.post('/api/equipamentos', data),
  // ...
};
```

## 🎯 Conclusão

O sistema de serviços de API fornece:
- **Centralização**: Todas as chamadas de API em um local
- **Consistência**: Padrão uniforme para todas as requisições
- **Tipo Safety**: TypeScript em todos os serviços
- **Tratamento de Erros**: Sistema robusto de erro
- **Autenticação**: Gerenciamento automático de tokens
- **Flexibilidade**: Fácil de estender e modificar

Este sistema facilita o desenvolvimento e manutenção da aplicação, garantindo que todas as comunicações com o backend sejam feitas de forma padronizada e confiável.

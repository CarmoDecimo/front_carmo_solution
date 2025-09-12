# 📋 API Backend - Formulário de Abastecimento

Este documento especifica os dados que o backend deve esperar na requisição do formulário de abastecimento.

## 🌐 Endpoint

```
POST /api/abastecimento
```

## 📝 Estrutura da Requisição

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {jwt_token}"
}
```

### Body da Requisição

```json
{
  "centro_custo_id": "string",
  "data_abastecimento": "2025-09-12",
  "existencia_inicio": 1500.5,
  "entrada_combustivel": 500.0,
  "posto_abastecimento": "Posto Shell Central",
  "matricula_ativo": "12345",
  "operador": "João Silva",
  "equipamentos": [
    {
      "equipamento": "Escavadeira",
      "activo": "ESC001",
      "matricula": "ABC-1234",
      "quantidade": 50.5,
      "kmh": 120.5,
      "assinatura": "João Operador"
    },
    {
      "equipamento": "Caminhão",
      "activo": "CAM002", 
      "matricula": "XYZ-5678",
      "quantidade": 80.0,
      "kmh": 45000,
      "assinatura": "Maria Silva"
    }
  ],
  "existencia_fim": 1370.0,
  "responsavel_abastecimento": "Carlos Supervisor"
}
```

## 📊 Especificação dos Campos

### **Dados Principais**

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `centro_custo_id` | string | ✅ Sim | ID do centro de custo que será alimentado | "cc_001" |
| `data_abastecimento` | string (ISO date) | ✅ Sim | Data do abastecimento | "2025-09-12" |
| `existencia_inicio` | number | ✅ Sim | Quantidade de combustível no início (litros) | 1500.5 |
| `entrada_combustivel` | number | ✅ Sim | Quantidade de combustível adicionada (litros) | 500.0 |
| `posto_abastecimento` | string | ✅ Sim | Nome do posto de abastecimento | "Posto Shell Central" |
| `matricula_ativo` | string | ✅ Sim | Matrícula do ativo principal | "12345" |
| `operador` | string | ✅ Sim | Nome do operador responsável | "João Silva" |
| `existencia_fim` | number | ✅ Sim | Quantidade final de combustível (litros) | 1370.0 |
| `responsavel_abastecimento` | string | ✅ Sim | Nome do responsável final | "Carlos Supervisor" |

### **Array de Equipamentos**

Cada item no array `equipamentos` deve conter:

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `equipamento` | string | ✅ Sim | Tipo/nome do equipamento | "Escavadeira" |
| `activo` | string | ✅ Sim | Código do ativo | "ESC001" |
| `matricula` | string | ✅ Sim | Matrícula do equipamento | "ABC-1234" |
| `quantidade` | number | ✅ Sim | Quantidade de combustível abastecida (litros) | 50.5 |
| `kmh` | number | ❌ Não | Quilometragem ou horas do equipamento | 120.5 |
| `assinatura` | string | ✅ Sim | Nome de quem recebeu o combustível | "João Operador" |

## 🎯 Resposta Esperada

### **Sucesso (201 Created)**
```json
{
  "message": "Abastecimento registrado com sucesso",
  "data": {
    "id": "abast_12345",
    "centro_custo_id": "cc_001",
    "data_abastecimento": "2025-09-12",
    "numero_protocolo": "ABAST-2025-001234",
    "total_combustivel_distribuido": 130.5,
    "created_at": "2025-09-12T10:30:00Z"
  }
}
```

### **Erro (400 Bad Request)**
```json
{
  "error": "Dados inválidos",
  "message": "Campo obrigatório ausente: centro_custo_id",
  "details": {
    "campo": "centro_custo_id",
    "valor_recebido": null,
    "valor_esperado": "string"
  }
}
```

## 🏢 Centro de Custo

### **Endpoint para listar centros de custo**
```
GET /api/centros-custo
```

### **Resposta esperada:**
```json
{
  "centros_custo": [
    {
      "id": "cc_001",
      "codigo": "CC001",
      "nome": "Operações Mina",
      "descricao": "Centro de custo para operações de mineração",
      "ativo": true
    },
    {
      "id": "cc_002", 
      "codigo": "CC002",
      "nome": "Manutenção",
      "descricao": "Centro de custo para atividades de manutenção",
      "ativo": true
    },
    {
      "id": "cc_003",
      "codigo": "CC003", 
      "nome": "Transporte",
      "descricao": "Centro de custo para atividades de transporte",
      "ativo": true
    }
  ]
}
```

## 🔄 Fluxo de Envio

### **1. Frontend prepara os dados**
```typescript
const dadosAbastecimento = {
  centro_custo_id: "cc_001",
  data_abastecimento: "2025-09-12",
  existencia_inicio: 1500.5,
  entrada_combustivel: 500.0,
  posto_abastecimento: "Posto Shell Central",
  matricula_ativo: "12345",
  operador: "João Silva",
  equipamentos: [
    // array de equipamentos...
  ],
  existencia_fim: 1370.0,
  responsavel_abastecimento: "Carlos Supervisor"
};
```

### **2. Envio via serviço**
```typescript
try {
  const response = await abastecimentoService.create(dadosAbastecimento);
  console.log('Abastecimento criado:', response);
} catch (error) {
  console.error('Erro ao criar abastecimento:', error);
}
```

## ✅ Validações no Backend

### **Campos Obrigatórios**
- `centro_custo_id`: Deve existir na tabela de centros de custo
- `data_abastecimento`: Data válida (não futura)
- `existencia_inicio`: Número positivo
- `entrada_combustivel`: Número positivo
- `posto_abastecimento`: String não vazia
- `matricula_ativo`: String não vazia
- `operador`: String não vazia
- `equipamentos`: Array com pelo menos 1 item
- `existencia_fim`: Número positivo
- `responsavel_abastecimento`: String não vazia

### **Validações de Negócio**
- **Existência final calculada**: `existencia_fim` deve ser igual a `existencia_inicio + entrada_combustivel - soma(equipamentos.quantidade)`
- **Centro de custo ativo**: O centro de custo deve estar ativo
- **Data válida**: Data não pode ser futura
- **Quantidades positivas**: Todas as quantidades devem ser > 0

### **Equipamentos**
- Cada equipamento deve ter todos os campos obrigatórios
- `quantidade` deve ser > 0
- `kmh` pode ser null ou 0

## 🗄️ Estrutura da Tabela (Sugestão)

### **Tabela: abastecimentos**
```sql
CREATE TABLE abastecimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centro_custo_id UUID NOT NULL REFERENCES centros_custo(id),
  data_abastecimento DATE NOT NULL,
  existencia_inicio DECIMAL(10,2) NOT NULL,
  entrada_combustivel DECIMAL(10,2) NOT NULL,
  posto_abastecimento VARCHAR(255) NOT NULL,
  matricula_ativo VARCHAR(50) NOT NULL,
  operador VARCHAR(255) NOT NULL,
  existencia_fim DECIMAL(10,2) NOT NULL,
  responsavel_abastecimento VARCHAR(255) NOT NULL,
  numero_protocolo VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);
```

### **Tabela: abastecimento_equipamentos**
```sql
CREATE TABLE abastecimento_equipamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  abastecimento_id UUID NOT NULL REFERENCES abastecimentos(id) ON DELETE CASCADE,
  equipamento VARCHAR(255) NOT NULL,
  activo VARCHAR(50) NOT NULL,
  matricula VARCHAR(50) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  kmh DECIMAL(10,2),
  assinatura VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Tabela: centros_custo**
```sql
CREATE TABLE centros_custo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📝 Exemplo Completo

### **Dados de Teste**
```json
{
  "centro_custo_id": "550e8400-e29b-41d4-a716-446655440001",
  "data_abastecimento": "2025-09-12",
  "existencia_inicio": 2000.0,
  "entrada_combustivel": 1000.0,
  "posto_abastecimento": "Posto BR Rodovia",
  "matricula_ativo": "TANK001",
  "operador": "José Santos",
  "equipamentos": [
    {
      "equipamento": "Escavadeira CAT 320",
      "activo": "ESC320001",
      "matricula": "MIN-001",
      "quantidade": 120.5,
      "kmh": 1250.5,
      "assinatura": "Operador Silva"
    },
    {
      "equipamento": "Caminhão Caçamba",
      "activo": "CAM789001", 
      "matricula": "TRK-045",
      "quantidade": 180.0,
      "kmh": 89500.0,
      "assinatura": "Motorista João"
    },
    {
      "equipamento": "Retroescavadeira",
      "activo": "RET456001",
      "matricula": "RET-012",
      "quantidade": 95.5,
      "kmh": 850.0,
      "assinatura": "Operador Maria"
    }
  ],
  "existencia_fim": 2604.0,
  "responsavel_abastecimento": "Supervisor Carlos"
}
```

## 🚀 Considerações de Implementação

### **Performance**
- Usar transações para inserir abastecimento + equipamentos
- Indexar por `centro_custo_id`, `data_abastecimento`, `numero_protocolo`
- Implementar paginação para listagens

### **Segurança**
- Validar JWT token
- Verificar permissões do usuário para o centro de custo
- Sanitizar inputs
- Rate limiting

### **Auditoria**
- Log de todas as operações
- Histórico de alterações
- Rastreabilidade por usuário

### **Integração**
- Webhook para notificar sistemas externos
- Export para sistemas ERP
- Backup automático dos dados

## 📊 Métricas Sugeridas

- Total de combustível distribuído por centro de custo
- Consumo médio por equipamento
- Eficiência de combustível por operador
- Relatórios de custo por período

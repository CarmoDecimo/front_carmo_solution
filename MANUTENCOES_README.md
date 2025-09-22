# 🔧 Sistema de Manutenções Preventivas

## 📖 Visão Geral

O sistema de manutenções preventivas foi desenvolvido para automatizar o gerenciamento de manutenções de equipamentos baseado em intervalos de horímetro. O sistema integra-se automaticamente com o fluxo de abastecimentos para verificar necessidades de manutenção em tempo real.

## 🏗️ Arquitetura

### Componentes Principais

1. **Service Layer** (`src/services/manutencoes.service.js`)
   - Lógica de negócio para manutenções
   - Verificação automática de necessidades
   - Geração automática de registros

2. **Controller Layer** (`src/controllers/manutencoes.controller.js`)
   - Endpoints REST para manutenções
   - Validação de dados
   - Tratamento de erros

3. **Routes Layer** (`src/routes/manutencoes.routes.js`)
   - Definição de rotas da API
   - Middleware de autenticação
   - Documentação de endpoints

4. **Database Layer** (`scripts_sql_manutencoes.sql`)
   - Funções SQL automatizadas
   - Triggers para verificação automática
   - Views para relatórios

## 🔄 Fluxo de Trabalho

### 1. Verificação Automática
```
Abastecimento → Trigger SQL → Verificação Manutenção → Geração Automática (se necessário)
```

### 2. Verificação Manual
```
API Call → Service → Database Check → Response com necessidades
```

### 3. Geração Forçada
```
API Call → Validation → Force Generation → Database Insert → Response
```

## 📡 Endpoints da API

### POST `/api/manutencoes/preventiva/:equipamentoId`
Força a geração de uma manutenção preventiva para um equipamento específico.

**Parâmetros:**
- `equipamentoId` (UUID): ID do equipamento

**Response:**
```json
{
  "success": true,
  "message": "Manutenção preventiva gerada com sucesso",
  "data": {
    "id": "uuid",
    "equipamento_id": "uuid",
    "data_prevista": "2024-01-15",
    "horimetro_previsto": 1500,
    "status": "pendente"
  }
}
```

### POST `/api/manutencoes/verificar-lote`
Verifica necessidade de manutenção para múltiplos equipamentos.

**Body:**
```json
{
  "equipamentoIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_verificados": 3,
    "necessitam_manutencao": 1,
    "manutencoes_geradas": 1,
    "equipamentos": [
      {
        "equipamento_id": "uuid1",
        "numero_patrimonio": "001",
        "necessita_manutencao": true,
        "status_manutencao": "vencida",
        "manutencao_gerada": true
      }
    ]
  }
}
```

### GET `/api/manutencoes/calendario`
Lista manutenções em formato de calendário.

**Query Parameters:**
- `mes` (optional): Mês específico (1-12)
- `ano` (optional): Ano específico (YYYY)
- `centro_custo_id` (optional): Filtrar por centro de custo

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "equipamento": {
        "numero_patrimonio": "001",
        "marca": "Caterpillar",
        "modelo": "320D"
      },
      "data_prevista": "2024-01-15",
      "horimetro_previsto": 1500,
      "status": "pendente",
      "prioridade": "alta",
      "centro_custo": "Obras"
    }
  ]
}
```

### POST `/api/manutencoes/atualizar-atrasadas`
Atualiza o status de manutenções atrasadas.

**Response:**
```json
{
  "success": true,
  "message": "Status de manutenções atualizados",
  "data": {
    "manutencoes_atualizadas": 5
  }
}
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: `manutencoes_preventivas`
```sql
- id (UUID, PK)
- equipamento_id (UUID, FK)
- tipo_manutencao (VARCHAR)
- data_prevista (DATE)
- data_realizada (DATE, nullable)
- horimetro_previsto (INTEGER)
- horimetro_manutencao (INTEGER, nullable)
- status (ENUM: 'pendente', 'atrasada', 'realizada', 'cancelada')
- observacoes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Funções SQL Principais

1. **`calcular_proxima_manutencao()`**
   - Calcula quando um equipamento precisa de manutenção
   - Baseado no último horímetro de manutenção + intervalo

2. **`atualizar_status_manutencoes_atrasadas()`**
   - Atualiza automaticamente manutenções vencidas
   - Executa diariamente via cron ou manual

3. **`verificacao_diaria_manutencoes()`**
   - Verificação completa de todos os equipamentos
   - Gera manutenções necessárias
   - Atualiza status

### Triggers Automáticos

- **`trigger_manutencao_pos_abastecimento`**
  - Ativado após INSERT/UPDATE em `abastecimentos`
  - Verifica necessidade de manutenção
  - Gera registros automaticamente

## 🔧 Configuração e Uso

### 1. Instalação
```bash
# Executar scripts SQL no banco
psql -f scripts_sql_manutencoes.sql

# Reiniciar aplicação para carregar novas rotas
npm restart
```

### 2. Configuração de Intervalos
```javascript
// Em manutencoes.service.js
const INTERVALO_MANUTENCAO_PADRAO = 250; // horas
```

### 3. Integração com Frontend
```javascript
// Exemplo de uso no frontend
const verificarManutencoes = async (equipamentoIds) => {
  const response = await fetch('/api/manutencoes/verificar-lote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ equipamentoIds })
  });
  return response.json();
};
```

## 📊 Relatórios e Dashboards

### Views Disponíveis

1. **`dashboard_manutencoes`**
   - Visão geral de manutenções pendentes
   - Priorização automática
   - Informações do equipamento

2. **`relatorio_performance_manutencoes`**
   - Performance mensal de manutenções
   - Percentual de cumprimento
   - Histórico de 12 meses

### Exemplo de Query para Dashboard
```sql
-- Manutenções por prioridade
SELECT 
  prioridade,
  COUNT(*) as quantidade,
  string_agg(numero_patrimonio, ', ') as equipamentos
FROM dashboard_manutencoes 
GROUP BY prioridade 
ORDER BY 
  CASE prioridade 
    WHEN 'Crítico' THEN 1 
    WHEN 'Urgente' THEN 2 
    WHEN 'Atenção' THEN 3 
    ELSE 4 
  END;
```

## 🚨 Monitoramento e Logs

### Sistema de Logs
- Todas as operações são registradas em `logs_sistema`
- Inclui detalhes de equipamentos e operações
- Permite auditoria completa

### Exemplo de Log
```sql
INSERT INTO logs_sistema (
  tipo_operacao, 
  descricao, 
  detalhes, 
  equipamento_id
) VALUES (
  'MANUTENCAO_AUTO_GERADA',
  'Manutenção preventiva gerada automaticamente',
  'Equipamento: 001, Horímetro: 1520, Status: vencida',
  'uuid-equipamento'
);
```

## 🔄 Integração com Sistema Existente

### Modificações Realizadas

1. **`abastecimentos.service.js`**
   - Adicionada verificação de manutenção após atualizações
   - Mantida compatibilidade com sistema anterior

2. **`app.js`**
   - Adicionadas rotas de manutenções
   - Configuração de middleware

3. **Database**
   - Novos triggers automáticos
   - Funções de cálculo e verificação

### Backward Compatibility
- Sistema anterior continua funcionando
- Novas funcionalidades são opcionais
- Dados existentes são preservados

## 🎯 Benefícios do Sistema

1. **Automação Completa**
   - Verificação automática após abastecimentos
   - Geração automática de manutenções
   - Atualização automática de status

2. **Visibilidade Total**
   - Dashboard em tempo real
   - Relatórios de performance
   - Histórico completo

3. **Prevenção de Falhas**
   - Alertas antecipados
   - Priorização inteligente
   - Rastreamento de intervalos

4. **Eficiência Operacional**
   - Redução de tempo de inatividade
   - Otimização de custos
   - Melhoria na vida útil dos equipamentos

## 🚀 Próximos Passos

1. **Implementação de Notificações**
   - Email para manutenções atrasadas
   - WhatsApp para urgências
   - Dashboard em tempo real

2. **Relatórios Avançados**
   - Análise de custos
   - Previsão de falhas
   - KPIs de manutenção

3. **Integração com IoT**
   - Leitura automática de horímetros
   - Sensores de condição
   - Manutenção preditiva

4. **Mobile App**
   - App para técnicos
   - Check-in de manutenções
   - Fotos e relatórios
# 📋 Guia Completo - Fluxo de Centros de Custo, Equipamentos e Abastecimentos

## 🎯 Visão Geral do Sistema

O sistema foi reestruturado para ter **equipamentos independentes** que podem ser associados a múltiplos centros de custo. O fluxo principal é:

```
Centro de Custo → Associar Equipamentos → Registrar Abastecimentos → Controle Automático
```

## 🏗️ 1. Centros de Custo (Obras)

### 📡 **Rotas Disponíveis:**

#### **Lista# Filtros disponíveis:
- categoria_id
- status_equipamento
- centro_custo_id
- alerta_manutencao

// Campos para exibir:
- nome
- codigo_ativo
- categoria
- horimetro_atual
- horas_para_vencer
- status_equipamento
- centros_custo (lista)usto**
```http
GET /api/centros-custo
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "centro_custo_id": 1,
      "nome": "Obra ABC - Construção Civil",
      "codigo": "CC01",
      "responsavel": "João Silva",
      "localizacao": "Rua das Obras, 123",
      "ativo": true,
      "criado_em": "2024-01-10T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### **Buscar Centro de Custo por ID**
```http
GET /api/centros-custo/:id
Authorization: Bearer <token>
```

#### **Criar Novo Centro de Custo**
```http
POST /api/centros-custo
Content-Type: application/json
Authorization: Bearer <token>

{
  "nome": "Obra DEF - Pavimentação",
  "codigo": "CC02",
  "responsavel": "Maria Santos",
  "localizacao": "Av. Principal, 456"
}
```

#### **Atualizar Centro de Custo**
```http
PUT /api/centros-custo/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "nome": "Obra DEF - Pavimentação Atualizada",
  "responsavel": "Maria Santos",
  "localizacao": "Av. Principal, 456 - Nova Localização",
  "ativo": true
}
```

#### **Excluir Centro de Custo**
```http
DELETE /api/centros-custo/:id
Authorization: Bearer <token>
```

---

## 🚜 2. Equipamentos (Independentes)

### 📡 **Rotas Disponíveis:**

#### **Listar Todos os Equipamentos**
```http
GET /api/equipamentos
Authorization: Bearer <token>

# Filtros opcionais:
GET /api/equipamentos?categoria_id=1&status_equipamento=ativo
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "equipamento_id": 1,
      "nome": "TRATOR DE ESTEIRA CATERPILLER D6R",
      "codigo_ativo": "01.01.0004",
      "categoria": "Trator de Esteira",
      "horimetro_atual": 6662,
      "km_atual": null,
      "status_equipamento": "ativo",
      "horas_para_vencer": -231,
      "alerta_manutencao": true,
      "ultima_revisao_horimetro": 6893,
      "proxima_revisao_horimetro": 7143,
      "data_ultima_leitura": "2025-08-19",
      "centros_custo": [
        {
          "centro_custo_id": 1,
          "nome": "Obra ABC",
          "data_associacao": "2024-01-15"
        }
      ]
    }
  ],
  "total": 1
}
```

#### **Buscar Equipamento por ID**
```http
GET /api/equipamentos/:id
Authorization: Bearer <token>
```

#### **Criar Novo Equipamento (Independente)**
```http
POST /api/equipamentos
Content-Type: application/json
Authorization: Bearer <token>

{
  "nome": "Escavadeira CAT 320D",
  "codigo_ativo": "EQ001",
  "categoria_id": 1,
  "horimetro_atual": 5000,
  "intervalo_manutencao": 250,
  "status_equipamento": "ativo",
  "observacoes": "Equipamento novo, sem centro de custo definido"
}
```

#### **Atualizar Equipamento**
```http
PUT /api/equipamentos/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "nome": "Escavadeira CAT 320D - Atualizada",
  "status_equipamento": "manutencao",
  "observacoes": "Em manutenção preventiva"
}
```

#### **Atualizar Horímetro Manualmente**
```http
PUT /api/equipamentos/:id/horimetro
Content-Type: application/json
Authorization: Bearer <token>

{
  "horimetro_atual": 5250,
  "data_leitura": "2024-01-20",
  "observacoes": "Leitura mensal"
}
```

#### **Registrar Manutenção**
```http
POST /api/equipamentos/:id/manutencao
Content-Type: application/json
Authorization: Bearer <token>

{
  "horimetro_manutencao": 5300,
  "data_manutencao": "2024-01-21",
  "tipo_revisao": "Manutenção preventiva",
  "observacoes": "Troca de óleo e filtros",
  "novo_intervalo": 300
}
```

---

## 🔗 3. Associações Equipamento ↔ Centro de Custo

### 📡 **Rotas para Associações:**

#### **Listar Equipamentos de um Centro de Custo**
```http
GET /api/equipamentos/centro-custo/:centro_custo_id
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "equipamento_id": 1,
      "nome": "TRATOR DE ESTEIRA CATERPILLER D6R",
      "codigo_ativo": "01.01.0004",
      "horimetro_atual": 6662,
      "status_equipamento": "ativo",
      "horas_para_vencer": -231,
      "data_associacao": "2024-01-15",
      "associacao_ativa": true
    }
  ],
  "total": 1
}
```

#### **Associar Equipamento a Centro de Custo**
```http
POST /api/equipamentos/:equipamento_id/centro-custo
Content-Type: application/json
Authorization: Bearer <token>

{
  "centro_custo_id": 1,
  "data_associacao": "2024-01-15",
  "observacoes": "Equipamento transferido para obra ABC"
}
```

#### **Remover Associação**
```http
DELETE /api/equipamentos/:equipamento_id/centro-custo/:centro_custo_id
Authorization: Bearer <token>
```

---

## ⛽ 4. Abastecimentos (Com Atualização Automática)

### 📡 **Rotas de Abastecimentos:**

#### **Listar Abastecimentos**
```http
GET /api/abastecimentos
Authorization: Bearer <token>

# Filtros:
GET /api/abastecimentos?centro_custo_id=1&data_inicio=2024-01-01&data_fim=2024-01-31
```

#### **Criar Abastecimento (Atualiza Horímetro Automaticamente)**
```http
POST /api/abastecimentos
Content-Type: application/json
Authorization: Bearer <token>

{
  "centro_custo_id": "1",
  "data_abastecimento": "2024-01-21",
  "existencia_inicio": 100.5,
  "entrada_combustivel": 80.0,
  "posto_abastecimento": "Posto Shell",
  "matricula_ativo": "EQ001",
  "operador": "João Silva",
  "veiculo_id": 1,
  "quilometragem": 25000,
  "horimetro": 6700,
  "quantidade_combustivel": 80.0,
  "valor_total": 500.00,
  "equipamentos": [
    {
      "equipamento": "TRATOR DE ESTEIRA CATERPILLER D6R",
      "activo": "01.01.0004",
      "matricula": "TR-001",
      "quantidade": 80.0,
      "kmh": 6700,
      "assinatura": "João Silva"
    }
  ],
  "existencia_fim": 20.5,
  "responsavel_abastecimento": "João Silva"
}
```

**⚡ IMPORTANTE:** Quando um abastecimento é criado:
- O `horimetro_atual` do equipamento é **automaticamente atualizado** para o valor do campo `horimetro` 
- A `data_ultima_leitura` é atualizada para a `data_abastecimento`
- Os cálculos de manutenção são recalculados automaticamente através do campo `kmh` dos equipamentos

#### **Buscar Abastecimento por ID**
```http
GET /api/abastecimentos/:id
Authorization: Bearer <token>
```

#### **Atualizar Abastecimento**
```http
PUT /api/abastecimentos/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "horimetro": 6750,
  "quantidade_combustivel": 85.0,
  "valor_total": 520.00,
  "equipamentos": [
    {
      "equipamento": "TRATOR DE ESTEIRA CATERPILLER D6R",
      "activo": "01.01.0004",
      "quantidade": 85.0,
      "kmh": 6750
    }
  ]
}
```

---

## 📊 5. Relatórios e Alertas

### 📡 **Rotas de Consulta:**

#### **Equipamentos com Alerta de Manutenção**
```http
GET /api/equipamentos/alertas
Authorization: Bearer <token>

# Por centro de custo:
GET /api/equipamentos/alertas?centro_custo_id=1
```

#### **Estatísticas de Manutenção**
```http
GET /api/equipamentos/estatisticas
Authorization: Bearer <token>

# Por centro de custo:
GET /api/equipamentos/estatisticas?centro_custo_id=1
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total_equipamentos": 5,
    "manutencoes_vencidas": 2,
    "manutencoes_proximas": 1,
    "equipamentos_ok": 2,
    "media_horimetro": 4250,
    "equipamentos_por_status": {
      "Operacional": 3,
      "Manutenção": 1,
      "Parado": 1
    }
  }
}
```

---

## 🔄 6. Fluxo Completo de Uso

### **Cenário 1: Nova Obra com Equipamentos Existentes**

```bash
# 1. Criar centro de custo (obra)
POST /api/centros-custo
{
  "nome": "Obra Nova XYZ",
  "codigo": "CC03",
  "responsavel": "Carlos Silva",
  "localizacao": "Zona Norte"
}

# 2. Associar equipamentos existentes à obra
POST /api/equipamentos/1/centro-custo
{
  "centro_custo_id": 2
}

# 3. Registrar abastecimentos (atualiza horímetros automaticamente)
POST /api/abastecimentos
{
  "centro_custo_id": "2",
  "data_abastecimento": "2024-01-21",
  "horimetro": 7000,
  "quantidade_combustivel": 50.0,
  "equipamentos": [
    {
      "equipamento": "TRATOR DE ESTEIRA CATERPILLER D6R",
      "activo": "01.01.0004",
      "quantidade": 50.0,
      "kmh": 7000
    }
  ]
}

# 4. Verificar equipamentos da obra
GET /api/equipamentos/centro-custo/2
```

### **Cenário 2: Equipamento Novo sem Obra Definida**

```bash
# 1. Criar equipamento independente
POST /api/equipamentos
{
  "nome": "Trator Novo",
  "codigo_ativo": "TR001",
  "categoria_id": 1
}

# 2. Aguardar definição de obra...

# 3. Quando definido, associar à obra
POST /api/equipamentos/3/centro-custo
{
  "centro_custo_id": 1
}
```

### **Cenário 3: Transferência de Equipamento**

```bash
# 1. Remover da obra atual
DELETE /api/equipamentos/1/centro-custo/1

# 2. Associar à nova obra
POST /api/equipamentos/1/centro-custo
{
  "centro_custo_id": 2,
  "observacoes": "Transferido da Obra ABC para Obra DEF"
}
```

---

## 💻 7. Estrutura para Frontend

### **Página: Lista de Centros de Custo**
```javascript
// Dados necessários:
const centrosCusto = await fetch('/api/centros-custo');

// Campos para exibir:
- nome
- codigo
- responsavel
- localizacao
- ativo
- criado_em
- total_equipamentos (calcular)
```

### **Página: Detalhes do Centro de Custo**
```javascript
// Dados necessários:
const centroCusto = await fetch(`/api/centros-custo/${id}`);
const equipamentos = await fetch(`/api/equipamentos/centro-custo/${id}`);
const alertas = await fetch(`/api/equipamentos/alertas?centro_custo_id=${id}`);

// Seções da página:
1. Informações básicas do centro
2. Lista de equipamentos associados
3. Alertas de manutenção
4. Estatísticas
```

### **Página: Lista de Equipamentos**
```javascript
// Dados necessários:
const equipamentos = await fetch('/api/equipamentos');

// Filtros disponíveis:
- categoria_id
- status
- centro_custo_id
- alerta_manutencao

// Campos para exibir:
- nome
- codigo_ativo
- categoria
- horimetro_atual
- horas_para_vencer
- status
- centros_custo (lista)
```

### **Página: Detalhes do Equipamento**
```javascript
// Dados necessários:
const equipamento = await fetch(`/api/equipamentos/${id}`);
const abastecimentos = await fetch(`/api/abastecimentos?centro_custo_id=${centroCustoId}`);

// Seções da página:
1. Informações básicas
2. Status de manutenção
3. Centros de custo associados
4. Histórico de abastecimentos (filtrar por equipamento)
5. Ações: atualizar horímetro, registrar manutenção
```

### **Página: Registro de Abastecimento**
```javascript
// Formulário deve incluir:
{
  centro_custo_id: "Select com centros de custo",
  data_abastecimento: "Data",
  existencia_inicio: "Número (combustível inicial)",
  entrada_combustivel: "Número (combustível adicionado)",
  posto_abastecimento: "Texto",
  matricula_ativo: "Texto (matrícula principal)",
  operador: "Texto",
  veiculo_id: "Select com veículos (opcional)",
  quilometragem: "Número (se veículo)",
  horimetro: "Número (se equipamento)",
  quantidade_combustivel: "Número",
  valor_total: "Decimal",
  equipamentos: [
    {
      equipamento: "Texto (nome)",
      activo: "Texto (código)",
      matricula: "Texto", 
      quantidade: "Número",
      kmh: "Número (horímetro/km)",
      assinatura: "Texto"
    }
  ],
  existencia_fim: "Número (combustível final)",
  responsavel_abastecimento: "Texto"
}

// Após salvar:
- Mostrar mensagem de sucesso
- Informar que horímetro foi atualizado automaticamente (se aplicável)
- Redirecionar para lista de abastecimentos
```

---

## 🔧 8. Validações e Regras de Negócio

### **Centros de Custo:**
- ✅ Nome é obrigatório e único
- ✅ Código é opcional mas único se fornecido
- ✅ Responsável é opcional
- ✅ Localização é opcional
- ✅ Ativo é booleano (padrão: true)

### **Equipamentos:**
- ✅ Nome é obrigatório
- ✅ Código ativo é obrigatório e único
- ✅ Categoria é obrigatória (categoria_id)
- ✅ Horímetro atual deve ser >= horímetro anterior
- ✅ Intervalo manutenção deve ser > 0
- ✅ Status equipamento: 'ativo', 'manutencao', 'parado'

### **Associações:**
- ✅ Um equipamento pode estar em múltiplos centros
- ✅ Não pode haver associação duplicada (mesmo equipamento + centro)
- ✅ Data associação não pode ser futura

### **Abastecimentos:**
- ✅ Centro de custo é obrigatório
- ✅ Data abastecimento é obrigatória  
- ✅ Equipamentos array é obrigatório
- ✅ Para cada equipamento: activo, quantidade e kmh são obrigatórios
- ✅ Horímetro (kmh) deve ser >= horímetro atual do equipamento
- ✅ Quantidade deve ser > 0
- ✅ Data não pode ser futura

---

## 🚀 9. Recursos Automáticos

### **Atualização Automática de Horímetros:**
- ✅ Quando abastecimento é criado → horímetro do equipamento é atualizado
- ✅ Cálculos de manutenção são refeitos automaticamente
- ✅ Alertas são atualizados em tempo real

### **Cálculos Automáticos:**
- ✅ `horas_para_vencer` = `proxima_revisao_horimetro` - `horimetro_atual`
- ✅ `alerta_manutencao` = `true` se `horas_para_vencer` <= 0
- ✅ `proxima_revisao_horimetro` = `ultima_revisao_horimetro` + `intervalo_manutencao`

### **Triggers de Banco:**
- ✅ Equipamentos: cálculos automáticos antes de inserir/atualizar
- ✅ Abastecimentos: atualização de horímetros após inserir/atualizar

---

Este guia fornece toda a estrutura necessária para implementar as páginas frontend e entender o fluxo completo do sistema! 🎯

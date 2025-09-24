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

### 📊 **Rotas Específicas por Centro de Custo (IMPLEMENTADAS)**

#### **Listar Equipamentos de um Centro de Custo**
```http
GET /api/centros-custo/:id/equipamentos
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
      "categoria_id": 1,
      "horimetro_atual": 6662,
      "km_atual": null,
      "status_equipamento": "ativo",
      "observacoes": "Equipamento em operação normal",
      "created_at": "2024-01-15T08:00:00Z",
      "categorias_equipamentos": {
        "categoria_id": 1,
        "nome": "Tratores de Esteira",
        "descricao": "Tratores para movimentação de terra"
      }
    }
  ],
  "total": 1
}
```

#### **Listar Abastecimentos de um Centro de Custo**
```http
GET /api/centros-custo/:id/abastecimentos
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "abastecimento_id": 1,
      "data_abastecimento": "2025-09-15",
      "litros": 80.5,
      "valor_total": 450.75,
      "horimetro": 6700,
      "km": null,
      "observacoes": "Abastecimento regular",
      "created_at": "2025-09-15T14:30:00Z",
      "equipamentos": {
        "equipamento_id": 1,
        "nome": "TRATOR DE ESTEIRA CATERPILLER D6R",
        "codigo_ativo": "01.01.0004",
        "centro_custo_id": 1
      }
    }
  ],
  "total": 1
}
```

#### **Obter Estatísticas de um Centro de Custo**
```http
GET /api/centros-custo/:id/estatisticas
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "centro_custo": {
      "centro_custo_id": 1,
      "nome": "Obra ABC - Construção Civil",
      "codigo": "CC01",
      "responsavel": "João Silva"
    },
    "equipamentos": {
      "total": 5,
      "ativos": 4,
      "inativos": 1
    },
    "abastecimentos": {
      "total": 24,
      "total_litros": 1850.75,
      "total_valor": 12450.50,
      "periodo": "12 meses"
    }
  }
}
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

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Manutenção registrada com sucesso",
  "data": {
    "equipamento_id": 1,
    "nome": "Escavadeira CAT 320D",
    "horimetro_atual": 5000,
    "ultima_revisao_horimetro": 5300,
    "proxima_revisao_horimetro": 5600,
    "horas_para_vencer": 600,
    "alerta_manutencao": false,
    "status_equipamento": "ativo"
  }
}
```

#### **🚨 Listar Equipamentos com Alerta de Manutenção**
```http
GET /api/equipamentos/alertas
Authorization: Bearer <token>

# Filtros:
GET /api/equipamentos/alertas?centro_custo_id=1
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "equipamento_id": 2,
      "nome": "Bulldozer CAT D8T",
      "codigo_ativo": "EQ002",
      "horimetro_atual": 4950,
      "horas_para_vencer": -50,
      "alerta_manutencao": true,
      "status_equipamento": "ativo",
      "categorias_equipamentos": {
        "nome": "Bulldozers"
      }
    }
  ],
  "total": 1
}
```

#### **📊 Obter Estatísticas de Manutenção**
```http
GET /api/equipamentos/estatisticas-manutencao
Authorization: Bearer <token>

# Filtros:
GET /api/equipamentos/estatisticas-manutencao?centro_custo_id=1
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total_equipamentos": 5,
    "com_alerta": 2,
    "sem_alerta": 3,
    "manutencao_vencida": 1,
    "manutencao_proxima": 1,
    "percentual_alerta": 40
  }
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

#### **Associar Equipamento a Centro de Custo (NOVA ESTRUTURA)**
```http
PUT /api/equipamentos/:equipamento_id
Content-Type: application/json
Authorization: Bearer <token>

{
  "centro_custo_id": 1
}
```

**Nota:** Agora um equipamento pode pertencer a apenas UM centro de custo. Use `PUT` para alterar o `centro_custo_id` diretamente.

#### **Remover Equipamento de Centro de Custo (NOVA ESTRUTURA)**
```http
PUT /api/equipamentos/:equipamento_id
Content-Type: application/json
Authorization: Bearer <token>

{
  "centro_custo_id": null
}
```

**Nota:** Para remover um equipamento de um centro de custo, defina `centro_custo_id` como `null`.

---

## ⛽ 4. Abastecimentos (Com Atualização Automática)

### 📡 **Rotas de Abastecimentos:**

#### **🎯 Listar Equipamentos Disponíveis (NOVO - Para Seleção no Frontend)**
```http
GET /api/abastecimentos/equipamentos-disponiveis
Authorization: Bearer <token>

# Todos os equipamentos ativos:
GET /api/abastecimentos/equipamentos-disponiveis

# Equipamentos de um centro específico:
GET /api/abastecimentos/equipamentos-disponiveis?centro_custo_id=1
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "equipamento_id": 1,
      "nome": "Escavadeira CAT 320D",
      "codigo_ativo": "EQ001",
      "categoria": "Escavadeiras",
      "horimetro_atual": 5000,
      "km_atual": 0,
      "status_equipamento": "ativo",
      "alerta_manutencao": false
    }
  ],
  "total": 1,
  "filtro_centro_custo": "1"
}
```

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

**⚡ IMPORTANTE - NOVA LÓGICA DE VALIDAÇÃO:** 
Quando um abastecimento é criado:

1. **🔍 Validação de Equipamentos:**
   - O sistema verifica se cada equipamento existe na base de dados pelo `codigo_ativo`
   - Apenas equipamentos **encontrados na BD** serão processados
   - Equipamentos não encontrados são registrados como erros, mas não impedem o abastecimento

2. **📊 Validação de Horímetros:**
   - O novo horímetro deve ser >= ao horímetro atual do equipamento
   - Se for menor, o equipamento é ignorado com erro de validação

3. **🔄 Atualizações Automáticas (Apenas para Equipamentos Válidos):**
   - O `horimetro_atual` do equipamento é **automaticamente atualizado** para o valor do campo `kmh`
   - A `data_ultima_leitura` é atualizada para a `data_abastecimento`
   - Os cálculos de manutenção são recalculados automaticamente

4. **💡 Fluxo Recomendado para o Frontend:**
   - Use `GET /api/abastecimentos/equipamentos-disponiveis` para listar equipamentos
   - Permita ao usuário **selecionar** o equipamento da lista
   - Pré-preencha o horímetro atual do equipamento selecionado
   - Valide que o novo horímetro seja >= ao atual antes do envio

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

## � 5. Lógica de Manutenção e Alertas (Automática)

### **📊 Cálculos Automáticos por Triggers:**

#### **A. Cálculo de Horas Para Vencer:**
```sql
horas_para_vencer = proxima_revisao_horimetro - horimetro_atual
```

#### **B. Cálculo da Próxima Revisão:**
```sql
proxima_revisao_horimetro = ultima_revisao_horimetro + intervalo_manutencao
```

#### **C. Alerta de Manutenção:**
```sql
alerta_manutencao = true SE horas_para_vencer <= 0
```

### **🚨 Critérios para Alertas:**

#### **🟢 Normal (horas_para_vencer > 50):**
- Equipamento pode trabalhar normalmente
- Monitorar aproximação da manutenção

#### **🟡 Atenção (0 < horas_para_vencer <= 50):**
- Planejar manutenção nas próximas semanas
- Priorizar agendamento

#### **🔴 Crítico (horas_para_vencer <= 0):**
- **Manutenção OBRIGATÓRIA**
- Equipamento deveria estar parado
- Risco de danos e segurança

#### **⚫ Avariado (status problemático):**
- Parar imediatamente
- Verificação técnica obrigatória

### **📈 Exemplos de Status:**

```javascript
// Equipamento Normal
{
  "horimetro_atual": 1000,
  "proxima_revisao_horimetro": 1250,
  "horas_para_vencer": 250,
  "alerta_manutencao": false,
  "status": "NORMAL"
}

// Equipamento em Atenção
{
  "horimetro_atual": 1200,
  "proxima_revisao_horimetro": 1250,
  "horas_para_vencer": 50,
  "alerta_manutencao": false,
  "status": "ATENÇÃO"
}

// Equipamento Vencido
{
  "horimetro_atual": 1300,
  "proxima_revisao_horimetro": 1250,
  "horas_para_vencer": -50,
  "alerta_manutencao": true,
  "status": "VENCIDO"
}
```

---

## �🔄 6. Fluxo Completo de Uso

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

# 2. Associar equipamentos existentes à obra (NOVA FORMA)
PUT /api/equipamentos/1
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

# 3. Quando definido, associar à obra (NOVA FORMA)
PUT /api/equipamentos/3
{
  "centro_custo_id": 1
}
```

### **Cenário 3: Transferência de Equipamento**

```bash
# 1. Transferir para nova obra (NOVA FORMA - apenas um PUT)
PUT /api/equipamentos/1
{
  "centro_custo_id": 2
}
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
- ✅ **NOVO:** Equipamentos são validados antes do processamento
- ✅ **NOVO:** Apenas equipamentos existentes na BD são atualizados
- ✅ **NOVO:** Horímetro deve ser >= ao atual do equipamento
- ✅ **NOVO:** Equipamentos inexistentes geram log de erro mas não impedem o abastecimento

### **Manutenções:**
- ✅ **NOVO:** Horímetro da manutenção é obrigatório e > 0
- ✅ **NOVO:** Data da manutenção é obrigatória
- ✅ **NOVO:** Cálculos automáticos via triggers da BD
- ✅ **NOVO:** Reset automático de alertas após manutenção
- ✅ **NOVO:** Status volta para 'ativo' automaticamente

### **Alertas e Estatísticas:**
- ✅ **NOVO:** Alerta automático quando horas_para_vencer <= 0
- ✅ **NOVO:** Atenção quando 0 < horas_para_vencer <= 50
- ✅ **NOVO:** Estatísticas calculadas em tempo real
- ✅ **NOVO:** Filtros por centro de custo em alertas e estatísticas  
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

### **🆕 Novas Funcionalidades (Setembro 2025):**
- ✅ **Validação Inteligente de Equipamentos:** Apenas equipamentos existentes são processados
- ✅ **Seleção de Equipamentos para Abastecimento:** Frontend pode listar equipamentos disponíveis
- ✅ **Registro de Manutenção Completo:** Reset automático de alertas e cálculos
- ✅ **Dashboard de Alertas:** Listagem de equipamentos que precisam manutenção
- ✅ **Estatísticas em Tempo Real:** Métricas de manutenção por centro de custo
- ✅ **Associações Melhoradas:** Prevenção de duplicatas e reativação automática
- ✅ **Compatibilidade Completa:** Todas as funções do sistema funcionando no serviço v2

---

## 📋 10. Resumo das APIs Principais

### **🏢 Centros de Custo:**
- `GET /api/centros-custo` - Listar todos
- `POST /api/centros-custo` - Criar novo
- `PUT /api/centros-custo/:id` - Atualizar
- `DELETE /api/centros-custo/:id` - Excluir
- `GET /api/centros-custo/:id/equipamentos` - **NOVO:** Listar equipamentos específicos
- `GET /api/centros-custo/:id/abastecimentos` - **NOVO:** Listar abastecimentos específicos
- `GET /api/centros-custo/:id/estatisticas` - **NOVO:** Obter estatísticas completas

### **⚙️ Equipamentos:**
- `GET /api/equipamentos` - Listar com filtros
- `POST /api/equipamentos` - Criar novo
- `PUT /api/equipamentos/:id` - Atualizar
- `PUT /api/equipamentos/:id/horimetro` - Atualizar horímetro
- `POST /api/equipamentos/:id/manutencao` - Registrar manutenção
- `GET /api/equipamentos/alertas` - **NOVO:** Equipamentos com alerta
- `GET /api/equipamentos/estatisticas-manutencao` - **NOVO:** Dashboard de manutenção

### **🔗 Associações (NOVA ESTRUTURA - 1:1):**
- `GET /api/equipamentos/centro-custo/:id` - Equipamentos do centro
- `PUT /api/equipamentos/:id` - Associar/alterar centro de custo (campo `centro_custo_id`)
- **Nota:** Um equipamento pertence a apenas UM centro de custo

### **⛽ Abastecimentos:**
- `GET /api/abastecimentos` - Listar com filtros
- `GET /api/abastecimentos/equipamentos-disponiveis` - **NOVO:** Equipamentos para seleção
- `POST /api/abastecimentos` - Criar (com validação inteligente)
- `PUT /api/abastecimentos/:id` - Atualizar

---

Este guia fornece toda a estrutura necessária para implementar as páginas frontend e entender o fluxo completo do sistema! 🎯

---

## 📚 **DOCUMENTAÇÃO SWAGGER ATUALIZADA**

### Acesso à Documentação
```
🌐 Swagger UI: http://localhost:3000/api/docs
```

### Arquivos de Documentação Swagger

#### **✅ Organização Atualizada (Setembro 2025)**
**Documentação centralizada nos arquivos específicos do Swagger** - removidas duplicações dos arquivos de rotas:

#### 1. **Equipamentos (`/src/swagger/equipamentos.swagger.js`)**
- **Schemas Completos**: `Equipamento`, `EquipamentoCreate`, `HorimetroUpdate`, `ManutencaoData`
- **Endpoints Documentados**:
  - `GET /api/equipamentos` - Listagem com filtros avançados
  - `POST /api/equipamentos` - Criação com validações
  - `GET /api/equipamentos/{id}` - Busca individual
  - `PUT /api/equipamentos/{id}` - Atualização completa
  - `DELETE /api/equipamentos/{id}` - Exclusão
  - `PUT /api/equipamentos/{id}/horimetro` - Atualização de horímetro
  - `POST /api/equipamentos/{id}/manutencao` - Registro de manutenção
  - `GET /api/equipamentos/alertas` - Equipamentos com alerta
  - `GET /api/equipamentos/estatisticas-manutencao` - Estatísticas
  - `POST/DELETE /api/equipamentos/{equipamento_id}/centro-custo/{centro_custo_id}` - **OBSOLETO** (use PUT com centro_custo_id)

#### 2. **Abastecimentos (`/src/swagger/abastecimentos.swagger.js`)**
- **Schemas Completos**: `Abastecimento`, `AbastecimentoCreate`, `EquipamentoParaAbastecimento`
- **Endpoints Documentados**:
  - `GET /api/abastecimentos` - Listagem com filtros
  - `POST /api/abastecimentos` - Criação com validação de equipamentos
  - `GET /api/abastecimentos/{id}` - Busca individual
  - `PUT /api/abastecimentos/{id}` - Atualização
  - `DELETE /api/abastecimentos/{id}` - Exclusão
  - `GET /api/abastecimentos/equipamentos-disponiveis` - **NOVO**: Lista equipamentos para seleção
  - `PUT /api/abastecimentos/{id}/aprovar` - Aprovação
  - `PUT /api/abastecimentos/{id}/rejeitar` - Rejeição

#### 3. **Centros de Custo (`/src/swagger/centros-custo.swagger.js`)**
- **Schemas Completos**: `CentroCusto`, `CentroCustoCreate`, `CentroCustoComEstatisticas`
- **Endpoints Documentados**:
  - `GET /api/centros-custo` - Listagem com estatísticas opcionais
  - `POST /api/centros-custo` - Criação
  - `GET /api/centros-custo/{id}` - Busca com equipamentos
  - `PUT /api/centros-custo/{id}` - Atualização
  - `DELETE /api/centros-custo/{id}` - Exclusão
  - `GET /api/centros-custo/{id}/equipamentos` - Equipamentos do centro
  - `GET /api/centros-custo/{id}/abastecimentos` - Abastecimentos do centro
  - `GET /api/centros-custo/{id}/estatisticas` - Estatísticas detalhadas

#### **🔧 Arquivos de Rotas Limpos**
- **`src/routes/equipamentos.routes.js`** - Apenas definições de rotas, sem documentação Swagger
- **`src/routes/centros_custo.routes.js`** - Apenas definições de rotas, sem documentação Swagger  
- **`src/routes/abastecimentos.routes.js`** - Apenas definições de rotas, sem documentação Swagger

#### **🧹 Limpeza de Arquivos (Setembro 2025)**
- **Removido**: `src/services/equipamentos.service.js` (versão antiga, substituída por `.v2`)
- **Removido**: `src/swagger/abastecimentos.swagger.updated.js` (versão desatualizada)
- **Mantido**: `src/services/equipamentos.service.v2.js` (versão atual em uso)
- **Mantido**: `src/swagger/abastecimentos.swagger.js` (versão atualizada com novas funcionalidades)

**✅ Benefícios**: Documentação centralizada, sem duplicações, manutenção simplificada, arquivos limpos

### **NOVAS FUNCIONALIDADES DOCUMENTADAS (Dezembro 2024)**

#### 🔍 **Endpoint para Seleção de Equipamentos**
```javascript
// GET /api/abastecimentos/equipamentos-disponiveis
{
  "success": true,
  "data": [
    {
      "equipamento_id": 1,
      "nome": "Caterpillar 320D",
      "codigo_ativo": "CAT-001",
      "categoria": "Escavadeira",
      "horimetro_atual": 1250,
      "status_equipamento": "ativo",
      "alerta_manutencao": false,
      "horas_para_vencer": 150,
      "ultimo_abastecimento": "2024-12-10",
      "dias_sem_abastecimento": 3
    }
  ],
  "resumo": {
    "total_equipamentos": 25,
    "com_alerta_manutencao": 3,
    "sem_abastecimento_7_dias": 5
  }
}
```

#### ⚠️ **Validações Automáticas Documentadas**
- **Equipamentos Inválidos**: Lista equipamentos que não existem ou estão inativos
- **Equipamentos Não Associados**: Verifica associação com centro de custo
- **Horímetros Inválidos**: Valida evolução progressiva do horímetro
- **Respostas de Erro Estruturadas**: Detalhes específicos para cada tipo de erro

#### 📊 **Estatísticas e Alertas**
- **Equipamentos com Alerta**: Filtros por criticidade (≤0 = crítico, ≤50 = atenção)
- **Estatísticas de Manutenção**: Percentuais e contadores automáticos
- **Resumos por Centro de Custo**: Dados agregados para relatórios

### **EXEMPLOS DE USO DOCUMENTADOS**

#### Criação de Abastecimento com Validação
```javascript
POST /api/abastecimentos
{
  "centro_custo_id": 1,
  "combustivel": "diesel",
  "data": "2024-12-13",
  "equipamentos": [
    {
      "equipamento_id": 1,
      "horimetro_atual": 1250,
      "litros": 45.5,
      "valor_unitario": 6.20,
      "observacoes": "Tanque cheio"
    }
  ]
}
```

#### Resposta com Validação de Erro
```javascript
{
  "success": false,
  "error": "Equipamento ID 5 não encontrado ou inativo",
  "details": {
    "equipamentos_invalidos": [5],
    "equipamentos_nao_associados": [2],
    "horimetros_invalidos": [
      {
        "equipamento_id": 3,
        "horimetro_atual_bd": 1200,
        "horimetro_informado": 1150
      }
    ]
  }
}
```

### **CONFIGURAÇÃO SWAGGER**
```javascript
// src/config/swagger.js
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API do Sistema de Gestão Carmo',
      version: '1.0.0',
      description: 'Sistema completo de gestão de equipamentos e abastecimentos'
    }
  },
  apis: [
    './src/routes/*.js',
    './src/swagger/*.js'  // Arquivos específicos de documentação
  ]
};
```

---

## 🏁 **RESUMO FINAL**

### **Sistema Completo de Gestão de Equipamentos**

✅ **Funcionalidades Principais**:
- Gestão completa de equipamentos com validações automáticas
- Sistema de abastecimentos com seleção de equipamentos do banco
- Cálculo automático de manutenções via triggers de banco
- Alertas automáticos baseados em horímetros
- Associações flexíveis equipamento-centro de custo
- Documentação Swagger completa e interativa

✅ **Melhorias de UX (Dezembro 2024)**:
- **Frontend simplificado**: Usuário seleciona equipamentos de lista pré-carregada
- **Validação inteligente**: Sistema verifica automaticamente equipamentos válidos
- **Evolução de horímetro**: Validação automática de progressão temporal
- **Alertas visuais**: Identificação clara de equipamentos precisando manutenção

✅ **Robustez Técnica**:
- Autenticação corrigida (SUPABASE_SERVICE_ROLE_KEY)
- Todos os serviços implementados e testados
- Triggers de banco para cálculos automáticos
- Tratamento completo de erros com detalhes específicos
- Documentação Swagger abrangente e atualizada

### **Para o Frontend**
1. **Usar endpoint**: `GET /api/abastecimentos/equipamentos-disponiveis?centro_custo_id={id}`
2. **Exibir equipamentos** em lista ou cards com informações relevantes
3. **Mostrar alertas** visuais para equipamentos com `alerta_manutencao: true`
4. **Implementar validação** baseada nas respostas de erro da API
5. **Consultar Swagger** em `http://localhost:3000/api/docs` para todos os detalhes

---

## 📝 Changelog - Atualizações Recentes

### **🆕 16/09/2025 - Implementação de Rotas Específicas para Centros de Custo**

#### **Novas Rotas Implementadas:**

1. **`GET /api/centros-custo/:id/equipamentos`**
   - **Funcionalidade:** Lista todos os equipamentos associados a um centro de custo específico
   - **Retorna:** Equipamentos com detalhes da categoria e informações completas
   - **Benefício:** Consulta direta e otimizada por centro de custo

2. **`GET /api/centros-custo/:id/abastecimentos`**
   - **Funcionalidade:** Lista todos os abastecimentos dos equipamentos de um centro de custo
   - **Retorna:** Abastecimentos com informações do equipamento relacionado
   - **Benefício:** Relatórios de consumo por obra/centro de custo

3. **`GET /api/centros-custo/:id/estatisticas`**
   - **Funcionalidade:** Gera estatísticas completas de um centro de custo
   - **Retorna:** Contadores de equipamentos, totais de abastecimentos (12 meses)
   - **Benefício:** Dashboard executivo com KPIs por centro de custo

#### **Implementação Técnica:**
- ✅ **Routes:** Adicionadas em `src/routes/centros_custo.routes.js`
- ✅ **Controllers:** Implementados em `src/controllers/centros_custo.controller.js`
- ✅ **Services:** Criados em `src/services/centros_custo.service.js`
- ✅ **Documentação:** Atualizada neste README com exemplos completos

#### **Compatibilidade:**
- **Swagger:** Rotas alinhadas com documentação existente
- **Autenticação:** Mantém padrão Bearer Token
- **Estrutura de Resposta:** Consistente com demais endpoints

#### **Próximos Passos:**
1. Testes unitários das novas funcionalidades
2. Validação de performance com grandes volumes de dados
3. Integração com frontend para utilização das novas APIs

**🎯 O sistema está completamente funcional, documentado e pronto para desenvolvimento frontend!**

# 📚 Guia de Integração Frontend - Sistema de Turnos de Abastecimento

## 🎯 Visão Geral

O novo sistema de turnos substitui o fluxo de criação direta de abastecimentos por um fluxo baseado em **turnos diários**. Cada usuário pode ter apenas **um turno ativo por dia**, garantindo melhor controle e auditoria.

## 🔄 Fluxo de Trabalho

```
1. INICIAR TURNO → 2. ADICIONAR EQUIPAMENTOS → 3. FECHAR TURNO
     (uma vez)         (múltiplas vezes)         (uma vez)
```

---

## 📋 1. INICIAR TURNO DIÁRIO

### Endpoint
```http
POST /api/abastecimentos/iniciar-turno
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Request Body
```json
{
  "existencia_inicio": 1000,
  "posto_abastecimento": "Posto Central",
  "operador": "João Silva",
  "responsavel_abastecimento": "Maria Santos",
  "entrada_combustivel": 500
}
```

### Campos Obrigatórios
- ✅ `existencia_inicio` - Existência inicial de combustível
- ✅ `responsavel_abastecimento` - Responsável pelo turno

### Response Success (201)
```json
{
  "success": true,
  "message": "Turno iniciado com sucesso",
  "turno": {
    "id_abastecimento": 15,
    "data_abastecimento": "2025-09-22",
    "existencia_inicio": 1000,
    "status": "aberto"
  }
}
```

### Response Error (400)
```json
{
  "success": false,
  "message": "Você já tem um turno em aberto hoje (ID: 14). Feche o turno atual antes de iniciar um novo."
}
```

### 💡 Implementação Frontend
```javascript
// Exemplo com Axios
async function iniciarTurno(dadosTurno) {
  try {
    const response = await axios.post('/api/abastecimentos/iniciar-turno', {
      existencia_inicio: dadosTurno.existenciaInicio,
      posto_abastecimento: dadosTurno.posto,
      operador: dadosTurno.operador,
      responsavel_abastecimento: dadosTurno.responsavel,
      entrada_combustivel: dadosTurno.entradaCombustivel
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Salvar ID do turno para uso posterior
    localStorage.setItem('turno_ativo_id', response.data.turno.id_abastecimento);
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      // Usuário já tem turno aberto
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}
```

---

## ⛽ 2. ADICIONAR EQUIPAMENTOS AO TURNO

### Endpoint
```http
PUT /api/abastecimentos/{turno_id}/adicionar-equipamentos
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Request Body
```json
{
  "entrada_combustivel": 700,
  "equipamentos": [
    {
      "equipamento_id": 30,
      "quantidade": 18,
      "horimetro": 240,
      "responsavel": "João Silva"
    },
    {
      "equipamento_id": 29,
      "quantidade": 35,
      "horimetro": 560,
      "responsavel": "Carlos Santos"
    }
  ]
}
```

### Campos por Equipamento
- ✅ `equipamento_id` - ID do equipamento (obrigatório)
- ✅ `quantidade` - Litros abastecidos (obrigatório)
- `horimetro` - Horímetro atual (opcional)
- `responsavel` - Quem recebeu o combustível (opcional)

### Response Success (200)
```json
{
  "success": true,
  "message": "Equipamentos adicionados ao turno com sucesso",
  "turno_id": 15,
  "equipamentos_adicionados": 2,
  "resultado_detalhado": {
    "equipamentos_processados": [
      {
        "equipamento_id": 30,
        "nome": "Toyota Hylux",
        "codigo_ativo": "TH-001",
        "quantidade_abastecida": 18,
        "horimetro_atualizado": true
      }
    ]
  }
}
```

### 💡 Implementação Frontend
```javascript
async function adicionarEquipamentos(turnoId, equipamentos, entradaCombustivel) {
  try {
    const response = await axios.put(
      `/api/abastecimentos/${turnoId}/adicionar-equipamentos`,
      {
        entrada_combustivel: entradaCombustivel,
        equipamentos: equipamentos.map(eq => ({
          equipamento_id: eq.id,
          quantidade: eq.quantidade,
          horimetro: eq.horimetro,
          responsavel: eq.responsavel
        }))
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

// Exemplo de uso
const equipamentos = [
  { id: 30, quantidade: 18, horimetro: 240, responsavel: "João Silva" },
  { id: 29, quantidade: 35, horimetro: 560, responsavel: "Carlos Santos" }
];

await adicionarEquipamentos(15, equipamentos, 700);
```

---

## 🔒 3. FECHAR TURNO

### Endpoint
```http
PUT /api/abastecimentos/fechar-turno
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Request Body
```json
{
  "existencia_fim": 1647,
  "responsavel_abastecimento": "Maria Santos - Supervisor"
}
```

### Campos Obrigatórios
- ✅ `existencia_fim` - Existência final de combustível

### Response Success (200)
```json
{
  "success": true,
  "message": "Turno fechado com sucesso",
  "turno": {
    "id_abastecimento": 15,
    "data_abastecimento": "2025-09-22",
    "existencia_inicio": 1000,
    "existencia_fim": 1647,
    "total_abastecido": 53,
    "variacao": 0,
    "status": "fechado"
  }
}
```

### 📊 Fórmula de Validação
O sistema calcula automaticamente:
```
existencia_fim_calculada = existencia_inicio + entrada_combustivel - total_abastecido
variacao = |existencia_fim_informada - existencia_fim_calculada|
```

### 💡 Implementação Frontend
```javascript
async function fecharTurno(existenciaFim, responsavel) {
  try {
    const response = await axios.put('/api/abastecimentos/fechar-turno', {
      existencia_fim: existenciaFim,
      responsavel_abastecimento: responsavel
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Limpar turno ativo do localStorage
    localStorage.removeItem('turno_ativo_id');
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}
```

---

## 🔍 4. CONSULTAR TURNO ATUAL

### Endpoint
```http
GET /api/abastecimentos/{turno_id}
Authorization: Bearer {jwt_token}
```

### Response
```json
{
  "success": true,
  "abastecimento": {
    "id_abastecimento": 15,
    "data_abastecimento": "2025-09-22",
    "existencia_inicio": 1000,
    "entrada_combustivel": 700,
    "posto_abastecimento": "Posto Central",
    "operador": "João Silva",
    "responsavel_abastecimento": "Maria Santos",
    "quantidade_combustivel": 53,
    "existencia_fim": null,
    "equipamentos_abastecimentos": [
      {
        "id": 1,
        "equipamento": "Toyota Hylux",
        "activo": "TH-001",
        "quantidade": 18,
        "kmh": 240,
        "assinatura": "João Silva"
      }
    ]
  }
}
```

---

## 📱 Exemplo de Implementação Completa (React)

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TurnoAbastecimento = () => {
  const [turnoAtivo, setTurnoAtivo] = useState(null);
  const [equipamentos, setEquipamentos] = useState([]);

  // Verificar se há turno ativo ao carregar componente
  useEffect(() => {
    const turnoId = localStorage.getItem('turno_ativo_id');
    if (turnoId) {
      verificarTurnoAtivo(turnoId);
    }
  }, []);

  const verificarTurnoAtivo = async (turnoId) => {
    try {
      const response = await axios.get(`/api/abastecimentos/${turnoId}`);
      if (response.data.abastecimento.existencia_fim === null) {
        setTurnoAtivo(response.data.abastecimento);
      } else {
        localStorage.removeItem('turno_ativo_id');
      }
    } catch (error) {
      localStorage.removeItem('turno_ativo_id');
    }
  };

  const iniciarNovoTurno = async (dados) => {
    try {
      const response = await axios.post('/api/abastecimentos/iniciar-turno', dados);
      setTurnoAtivo(response.data.turno);
      localStorage.setItem('turno_ativo_id', response.data.turno.id_abastecimento);
      alert('Turno iniciado com sucesso!');
    } catch (error) {
      alert(`Erro: ${error.response?.data?.message || error.message}`);
    }
  };

  const adicionarEquipamento = async (equipamento) => {
    try {
      await axios.put(
        `/api/abastecimentos/${turnoAtivo.id_abastecimento}/adicionar-equipamentos`,
        {
          equipamentos: [equipamento]
        }
      );
      
      // Recarregar dados do turno
      await verificarTurnoAtivo(turnoAtivo.id_abastecimento);
      alert('Equipamento adicionado com sucesso!');
    } catch (error) {
      alert(`Erro: ${error.response?.data?.message || error.message}`);
    }
  };

  const fecharTurno = async (existenciaFim) => {
    try {
      await axios.put('/api/abastecimentos/fechar-turno', {
        existencia_fim: existenciaFim
      });
      
      setTurnoAtivo(null);
      localStorage.removeItem('turno_ativo_id');
      alert('Turno fechado com sucesso!');
    } catch (error) {
      alert(`Erro: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div>
      {!turnoAtivo ? (
        <FormIniciarTurno onSubmit={iniciarNovoTurno} />
      ) : (
        <div>
          <TurnoAtivo 
            turno={turnoAtivo} 
            onAdicionarEquipamento={adicionarEquipamento}
            onFecharTurno={fecharTurno}
          />
        </div>
      )}
    </div>
  );
};
```

---

## ⚠️ Tratamento de Erros Importantes

### 1. Turno já existente
```javascript
// Error 400: Usuário já tem turno aberto
if (error.response?.status === 400 && error.response?.data?.message?.includes('turno em aberto')) {
  // Redirecionar para turno existente ou mostrar opção de continuar
  const turnoId = extractTurnoId(error.response.data.message); // Extrair ID da mensagem
  localStorage.setItem('turno_ativo_id', turnoId);
}
```

### 2. Nenhum turno em aberto
```javascript
// Error 400: Nenhum turno em aberto para adicionar equipamentos
if (error.response?.data?.message?.includes('Nenhum turno em aberto')) {
  // Limpar localStorage e redirecionar para iniciar novo turno
  localStorage.removeItem('turno_ativo_id');
  redirectToIniciarTurno();
}
```

### 3. Validações de equipamento
```javascript
// Error 400: Equipamento não encontrado ou horímetro inválido
if (error.response?.data?.resultado_detalhado?.erros_validacao) {
  const erros = error.response.data.resultado_detalhado.erros_validacao;
  erros.forEach(erro => {
    console.error(`Equipamento ${erro.equipamento_id}: ${erro.erro}`);
  });
}
```

---

## 📊 Estados da Interface

### Estado 1: Sem Turno Ativo
- Mostrar formulário para iniciar novo turno
- Campos: existencia_inicio, responsavel_abastecimento, posto, operador

### Estado 2: Turno Ativo
- Mostrar informações do turno atual
- Formulário para adicionar equipamentos
- Botão para fechar turno

### Estado 3: Turno Fechado
- Mostrar resumo do turno fechado
- Opção para visualizar relatório
- Botão para iniciar novo turno (próximo dia)

---

## 🔧 Configuração do Axios

```javascript
// axios.config.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('turno_ativo_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🎯 Boas Práticas

### 1. Persistência de Estado
```javascript
// Salvar ID do turno ativo
localStorage.setItem('turno_ativo_id', turnoId);

// Verificar ao carregar página
useEffect(() => {
  const turnoId = localStorage.getItem('turno_ativo_id');
  if (turnoId) {
    verificarTurnoAtivo(turnoId);
  }
}, []);
```

### 2. Validações no Frontend
```javascript
// Validar existencia_inicio antes de enviar
if (!existenciaInicio || existenciaInicio <= 0) {
  throw new Error('Existência inicial deve ser maior que zero');
}

// Validar responsavel_abastecimento
if (!responsavelAbastecimento?.trim()) {
  throw new Error('Responsável pelo abastecimento é obrigatório');
}
```

### 3. Feedback Visual
```javascript
// Loading states
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await iniciarTurno(dados);
  } finally {
    setLoading(false);
  }
};
```

### 4. Sincronização de Dados
```javascript
// Recarregar dados após operações
const adicionarEquipamento = async (equipamento) => {
  await api.post(`/abastecimentos/${turnoId}/adicionar-equipamentos`, data);
  await recarregarTurno(); // Atualizar estado local
};
```

---

## 📋 Checklist de Implementação

- [ ] Implementar formulário de iniciar turno
- [ ] Validar campos obrigatórios no frontend
- [ ] Implementar persistência do turno ativo
- [ ] Criar interface para adicionar equipamentos
- [ ] Implementar busca/seleção de equipamentos
- [ ] Validar horímetros no frontend
- [ ] Implementar fechamento de turno
- [ ] Mostrar cálculos de variação
- [ ] Tratar todos os casos de erro
- [ ] Implementar loading states
- [ ] Adicionar confirmações para ações críticas
- [ ] Implementar navegação entre estados
- [ ] Adicionar relatórios de turno
- [ ] Testar fluxo completo

Este guia fornece uma base sólida para implementar o novo sistema de turnos no frontend! 🚀
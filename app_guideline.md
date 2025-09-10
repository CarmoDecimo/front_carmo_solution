# 📌 App de Gestão de Abastecimentos e Manutenção Preventiva

Este documento é o guia de desenvolvimento da aplicação final. Ele descreve os passos, responsabilidades e arquitetura do sistema. **Não contém código**, apenas o que deve ser feito.

---

## 🎯 Objetivo do Projeto

- Substituir os ficheiros Excel por uma aplicação web.
- Permitir o preenchimento de formulários digitais.
- Exportar relatórios para os mesmos formatos Excel usados atualmente.
- Facilitar a gestão de horímetros, quilometragens e alertas de manutenção preventiva e etc.

---

## 🏗 Arquitetura

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Base de Dados:** Supabase (Postgres)
- **Exportação Excel:** Gerada no back (exceljs https\://github.com/exceljs/exceljs) e disponibilizada ao utilizador.

Fluxo de alto nível:

1. Usuário insere dados de abastecimento ou manutenção pelo frontend.
2. Os dados são enviados ao backend e gravados no Supabase.
3. O backend calcula/atualiza horímetros e programações preventivas.
4. Usuário pode exportar relatórios em Excel no formato dos documentos oficiais.

---

## 📂 Estrutura de Dados (Supabase / Postgres)

### Tabelas Principais

1. **veiculos**

   - id
   - descricao
   - matricula
   - tipo
   - ativo (boolean)
   - criado\_em

2. **abastecimentos (PA.DME.01.M02)**

   - id
   - data
   - posto\_local
   - operador
   - existencia\_inicio
   - entrada\_combustivel
   - existencia\_fim
   - responsavel\_final
   - linhas (relacionadas com equipamentos abastecidos)

3. **linhas\_abastecimentos**

   - id
   - abastecimento\_id (FK)
   - equipamento
   - activo
   - matricula
   - quantidade\_litros
   - km\_h
   - assinatura

4. **manutencoes (PA.DME.01.M01)**

   - id
   - veiculo\_id (FK)
   - tipo
   - data\_prevista
   - km\_previsto
   - horimetro\_previsto
   - responsavel
   - status (planeada, concluída, atrasada)

5. **horimetros (PA.DME.01.M03)**

   - id
   - equipamento\_id (FK)
   - hora\_km\_atual
   - data\_atualizacao
   - ultima\_revisao\_hora
   - ultima\_revisao\_data
   - proxima\_revisao\_hora
   - proxima\_revisao\_tipo

---

## 🖥️ Frontend (React + Vite)

### Funcionalidades

- Formulário **Controlo de Abastecimento** (M02):

  - Cabeçalho: data, existência início, entrada combustível, posto, matrícula, operador.
  - Linhas dinâmicas: equipamento, ativo, matrícula, quantidade, km/h, assinatura.
  - Rodapé: existência fim, responsável final.
  - Botões: adicionar linha, eliminar linha, exportar Excel, limpar tabela.

- Formulário **Calendário de Manutenção Preventiva** (M01):

  - Campos: viatura, tipo de manutenção, data prevista, km previsto, horímetro previsto, responsável.
  - Botões: adicionar à tabela, eliminar, exportar Excel, limpar tabela.

- Dashboard simples:

  - Estatísticas de abastecimento.
  - Alertas de revisões próximas (baseado em horímetros e quilometragem).

---

## ⚙️ Backend (Node.js + Express)

### Responsabilidades

- API REST para comunicação entre frontend e Supabase.
- Endpoints para CRUD de veículos, abastecimentos, manutenções e horímetros.
- Lógica para calcular automaticamente:
  - Atualização de horímetro e quilometragem a partir dos abastecimentos.
  - Próxima revisão preventiva com base em intervalos predefinidos (ex.: cada 250h ou 10.000 km).
- Middleware de autenticação (Supabase Auth ou JWT).
- Rotas para exportação de relatórios se necessário (opcional, caso a exportação não seja só no frontend).

---

## 📤 Exportação Excel

- O formato dos relatórios seguirá os modelos oficiais já em uso:
  - **PA.DME.01.M02** → Controlo de Abastecimentos.
  - **PA.DME.01.M01** → Calendário de Manutenção Preventiva.
  - **PA.DME.01.M03** → Controlo de Horímetro e Kilometragens.
- Geração inicial será feita no **frontend** usando **SheetJS**.
- Arquivos devem ser baixados diretamente pelo utilizador.

---

## ✅ Passos de Desenvolvimento

### Fase 1 — Configuração do Projeto

- Criar repositório com estrutura básica (frontend e backend separados).
- Configurar ambiente React (Vite) e Node.js (Express).
- Criar projeto no Supabase e definir tabelas.

### Fase 2 — Frontend MVP

- Implementar formulário de abastecimento com exportação Excel.
- Implementar formulário de manutenção preventiva com exportação Excel.

### Fase 3 — Backend MVP

- Implementar CRUD básico (veículos, abastecimentos, manutenções, horímetros).
- Conectar ao Supabase.
- Calcular horímetros automaticamente.

### Fase 4 — Integração

- Frontend consome API do backend.
- Dados armazenados no Supabase.
- Exportação Excel passa a refletir dados reais da base.

### Fase 5 — Refinamentos

- Implementar autenticação.
- Criar dashboards com gráficos.
- Adicionar alertas automáticos de manutenção.

---

## 📌 Considerações Finais

- O MVP deve priorizar simplicidade e exportação correta dos ficheiros Excel.
- A integração com o Primavera será **apenas leitura** (futuro).
- O projeto deve ser modular para permitir evoluções futuras (ex.: ordens de serviço digitais).

---


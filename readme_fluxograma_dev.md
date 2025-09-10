# 📘 README Técnico – Fluxo do Sistema de Gestão de Manutenções

Este documento serve como **guia para desenvolvedores** entenderem a lógica e as funcionalidades que deverão ser implementadas com base no fluxograma fornecido.

---

## 🔑 Autenticação
- O sistema inicia com **Login e Cadastro** de usuários.
- Apenas usuários autenticados terão acesso às funcionalidades.

---

## 🗂️ Estrutura dos Módulos

### 1. Oficina
Fluxo principal de manutenção:
- **Ficha de Inspeção** → preenchimento manual.
- **Ficha de Serviços** → preenchimento manual.
- **Ficha de Comunicação** → preenchimento manual.
- **Ficha de Relatório de Manutenção** → preenchimento manual.

### 2. Abastecimento
Controle de combustível e quilometragem:
- **Ficha de Controle de Abastecimento** → preenchimento manual.
- **Atualização Automática** → sistema atualiza **Horímetro** e **Quilometragens**.
- **Alertas Automáticos** → sistema gera alertas de manutenção quando limites são atingidos.

### 3. Alertas
- Exibe **todos os alertas criados** automaticamente ou manualmente.

### 4. Calendário de Manutenção
- **Mapa de Manutenções** → visão geral de todas as manutenções agendadas/realizadas.
- **Relatório de Manutenções** → exportação/listagem de manutenções concluídas.

---

## ⚙️ Funcionalidades Automáticas
- **Integração Oficina/Abastecimento → Controle de Horímetro**.
- **Geração Automática de Alertas** baseada em quilometragem ou horas de uso.

---

## ⏱️ Controle de Horímetro
- O sistema solicita ao usuário selecionar um **controle de horímetro existente**.
- Se não existir, deve-se **criar e selecionar um novo**.

---

## 🔄 Fluxo Resumido (Visão de Implementação)
1. Login e Cadastro.
2. Seleção de módulo (Oficina, Abastecimento, Alertas ou Calendário).
3. Preenchimento de fichas conforme módulo.
4. Sistema atualiza automaticamente horímetro/quilometragem.
5. Sistema cria alertas de manutenção.
6. Usuário consulta relatórios/mapa de manutenções.

---

## ✅ Requisitos para Desenvolvimento
- CRUD para fichas (inspeção, serviços, comunicação, relatório, abastecimento).
- Rotina de atualização automática de **horímetro e quilometragem**.
- Motor de regras para **geração automática de alertas**.
- Módulo de relatórios/exportação.
- Interface de **calendário de manutenções**.

---

## 📌 Observações Importantes
- O sistema deve permitir integração futura com ERPs (ex.: Primavera).
- Dados de abastecimento devem alimentar o controle de horímetro de forma confiável.
- Alertas devem ser disparados em tempo real ou próximos ao vencimento.
- Deve haver consistência entre fichas e relatórios (auditoria de dados).

---


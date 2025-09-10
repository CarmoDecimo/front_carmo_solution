# Templates Excel

Esta pasta contém os templates Excel pré-formatados para cada módulo do sistema.

## Estrutura

```
templates/
├── oficina/          # Templates para relatórios de oficina
├── abastecimento/    # Templates para relatórios de abastecimento
├── calendario/       # Templates para relatórios de calendário
├── alertas/          # Templates para relatórios de alertas
└── README.md         # Este arquivo
```

## Como Usar

1. **Criar Template**: Crie um arquivo Excel (.xlsx) com a formatação desejada
2. **Posicionar Dados**: Deixe células específicas para preenchimento automático
3. **Salvar na Pasta**: Coloque o template na pasta do módulo correspondente
4. **Implementar**: Use ExcelJS para carregar template e preencher dados

## Convenções de Nomenclatura

- `[modulo]_template.xlsx` - Template principal do módulo
- `[modulo]_relatorio_[tipo].xlsx` - Template específico por tipo de relatório

## Exemplos

- `oficina/oficina_template.xlsx` - Template principal de oficina
- `oficina/oficina_relatorio_servicos.xlsx` - Relatório específico de serviços
- `abastecimento/PA.DME.01.M02 - CONTROLO DE ABASTECIMENTO.xlsx` - Template de abastecimento
- `calendario/calendario_relatorio_mensal.xlsx` - Relatório mensal do calendário

## Células Recomendadas para Preenchimento

### Template de Oficina
- **B2**: Nome do Cliente
- **B3**: Data do Serviço
- **B4**: Veículo/Placa
- **A8+**: Tabela de serviços (código, descrição, quantidade, valor)

### Template de Abastecimento
- **B2**: Nome do Cliente
- **B3**: Data do Serviço
- **B4**: Veículo/Placa
- **A8+**: Tabela de serviços (código, descrição, quantidade, valor)

## Template de Abastecimento - Instruções Específicas

Para criar o template `PA.DME.01.M02 - CONTROLO DE ABASTECIMENTO.xlsx`:

### Estrutura do Template:
```
    A    B    C    D    E    F    G    H    I    J    K    L    M
1   🏢CARMON                                     Doc N.º  PA.DME.01.M02
2                  CONTROLO DE ABASTECIMENTO     Revisão  06
3                                               Data     
4
5   Data: [C5]/[E5]/2025    Existência início: [M5]      Entrada: [M6]
6   
7   Posto: [C7]             Matrícula: [I7]              Operador: [M7]
8
9   EQUIPAMENTO  ACTIVO  MATRÍCULA  QUANTIDADE(Lts)  KM/H  ASSINATURA
10  [A10]        [C10]   [E10]      [G10]            [I10] [K10]
11  [A11]        [C11]   [E11]      [G11]            [I11] [K11]
...
42  Existência fim: [C42]                    Responsável: [I42]
```

### Células para Preenchimento:
- **C5**: Dia (número)
- **E5**: Mês (número)
- **M5**: Existência início dia (número)
- **M6**: Entrada combustível (número)
- **C7**: Posto abastecimento (texto)
- **I7**: Matrícula/Activo (texto)
- **M7**: Operador (texto)
- **A10+**: Equipamento (texto) - linhas 10 a 41
- **C10+**: Activo (texto)
- **E10+**: Matrícula (texto)
- **G10+**: Quantidade (número)
- **I10+**: KM/H (número)
- **K10+**: Assinatura (texto)
- **C42**: Existência fim dia (número)
- **I42**: Responsável abastecimento (texto)

### Template de Abastecimento

### Template de Calendário
- **B2**: Período
- **A6+**: Eventos (data, descrição, responsável)

### Template de Alertas
- **B2**: Data do Relatório
- **A5+**: Lista de alertas (tipo, descrição, prioridade, status)

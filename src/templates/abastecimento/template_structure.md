# Template Abastecimento - PA.DME.01.M02 - CONTROLO DE ABASTECIMENTO.xlsx

## Campos Identificados no Template

### Cabeçalho
- **Documento N.º**: PA.DME.01.M02 (fixo)
- **Revisão**: 06 (fixo)
- **Data**: Campo preenchível

### Seção de Dados Gerais
- **Data**: [Campo Input] / [Campo Input] /2025
- **Existência ao início do dia (Lts)**: Campo numérico
- **Entrada de Combustível (Lts)**: Campo numérico
- **Posto de Abastecimento (Local)**: Campo texto
- **Matrícula / Activo**: Campo texto
- **O operador**: Campo texto

### Tabela Principal (Linhas repetitivas)
Colunas:
- **EQUIPAMENTO**: Texto
- **ACTIVO**: Texto
- **MATRÍCULA**: Texto
- **QUANTIDADE (Lts)**: Numérico
- **KM/H**: Numérico
- **ASSINATURA**: Texto/Espaço

### Rodapé
- **Existência ao fim do dia (Lts)**: Campo numérico
- **Responsável pelo Abastecimento**: Campo texto

## Células para Preenchimento Automático

### Dados Gerais (Linha ~5-7)
- **C5**: Data (dia)
- **E5**: Data (mês)
- **M5**: Existência início dia
- **M6**: Entrada combustível
- **C7**: Posto abastecimento
- **I7**: Matrícula/Activo
- **M7**: Operador

### Tabela (Linha ~10+)
Começando na linha 10:
- **A10+**: Equipamento
- **C10+**: Activo
- **E10+**: Matrícula
- **G10+**: Quantidade
- **I10+**: KM/H
- **K10+**: Assinatura

### Rodapé (Linha ~42)
- **C42**: Existência fim dia
- **I42**: Responsável abastecimento

## Layout Estimado
```
    A    B    C    D    E    F    G    H    I    J    K    L    M
1   CARMON                                     Doc N.º  PA.DME.01.M02
2                  CONTROLO DE ABASTECIMENTO   Revisão  06
3                                              Data     [INPUT]
4
5   Data: [C5]/[E5]/2025    Existência início: [M5]    Entrada: [M6]
6   Posto: [C7]             Matrícula: [I7]            Operador: [M7]
7
8   EQUIPAMENTO  ACTIVO  MATRÍCULA  QUANTIDADE  KM/H  ASSINATURA
9   ----------------------------------------------------------------
10  [A10]        [C10]   [E10]      [G10]       [I10] [K10]
...
42  Existência fim: [C42]           Responsável: [I42]
```

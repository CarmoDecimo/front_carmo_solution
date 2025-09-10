# Instruções para Template Excel

## Como Usar o Template Real

Para que o código consiga carregar o template Excel original, siga estes passos:

### 1. Criar pasta no public
```
public/
├── src/
    └── templates/
        └── abastecimento/
            └── PA.DME.01.M02 - CONTROLO DE ABASTECIMENTO.xlsx
```

### 2. Colocar o arquivo Excel
- Coloque o arquivo Excel na pasta: `public/src/templates/abastecimento/`
- Nome exato: `PA.DME.01.M02 - CONTROLO DE ABASTECIMENTO.xlsx`

### 3. Como funciona
- O código primeiro tenta carregar o template real via fetch
- Se conseguir, usa o template original com toda formatação
- Se não conseguir, usa o template criado programaticamente
- Em ambos os casos, preenche os dados nos campos corretos

### 4. Campos que serão preenchidos

#### Nova Estrutura de Células:
- **H3**: Data completa (dia/mês/ano)
- **A5**: Data completa no texto (A5:C5 mescladas)
- **D5**: Existência início no texto (D5:E5 mescladas)
- **F5**: Entrada combustível no texto (F5:H5 mescladas)
- **A6**: Posto abastecimento no texto (A6:C6 mescladas)
- **D6**: Matrícula/Activo no texto (D6:E6 mescladas)
- **F6**: Operador no texto (F6:H6 mescladas)

#### Tabela de Equipamentos (linhas 9-40):
- **A9+**: Equipamento (A:B mescladas)
- **C9+**: Activo
- **D9+**: Matrícula
- **E9+**: Quantidade (Lts)
- **F9+**: KM/H
- **G9+**: Assinatura (G:H mescladas)

#### Rodapé (linha 41):
- **A41**: Existência fim no texto (A41:D41 mescladas)
- **E41**: Responsável no texto (E41:H41 mescladas)

#### Template Programático:
- Mesmas células, mas com layout recriado em código
- Mantém estrutura, bordas, formatação similar ao original

### 5. Vantagens desta Abordagem

✅ **Flexibilidade**: Funciona com ou sem template físico
✅ **Fidelidade**: Quando tem template, usa exatamente o original
✅ **Backup**: Se não tem template, cria um similar
✅ **Manutenção**: Fácil atualizar template físico sem mudar código

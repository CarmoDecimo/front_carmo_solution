import ExcelJS from 'exceljs';

// Interface para os dados do abastecimento
interface DadosAbastecimento {
  // Dados gerais
  data: {
    dia: number;
    mes: number;
    ano: number;
  };
  existenciaInicio: number;
  entradaCombustivel: number;
  postoAbastecimento: string;
  matriculaAtivo: string;
  operador: string;
  
  // Lista de equipamentos abastecidos
  equipamentos: {
    equipamento: string;
    activo: string;
    matricula: string;
    quantidade: number;
    kmH: number;
    assinatura?: string;
  }[];
  
  // Dados finais
  existenciaFim: number;
  responsavelAbastecimento: string;
}

// Função para carregar template Excel via fetch
const carregarTemplateViaFetch = async (): Promise<ExcelJS.Workbook> => {
  try {
    // Carregar o arquivo template via fetch
    const response = await fetch('/src/templates/abastecimento/PA.DME.01.M02 - CONTROLO DE ABASTECIMENTO.xlsx');
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar template: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Criar workbook e carregar dados
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    return workbook;
    
  } catch (error) {
    console.error('Erro ao carregar template via fetch:', error);
    throw error;
  }
};

// Função para criar template base idêntico ao original
const criarTemplateExato = (): ExcelJS.Worksheet => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Controlo de Abastecimento');

  // Configurar larguras das colunas exatas
  worksheet.columns = [
    { width: 18 }, // A - EQUIPAMENTO
    { width: 2 },  // B - Separador
    { width: 12 }, // C - ACTIVO
    { width: 2 },  // D - Separador
    { width: 14 }, // E - MATRÍCULA
    { width: 2 },  // F - Separador
    { width: 16 }, // G - QUANTIDADE
    { width: 2 },  // H - Separador
    { width: 12 }, // I - KM/H
    { width: 2 },  // J - Separador
    { width: 18 }, // K - ASSINATURA
    { width: 2 },  // L - Separador
    { width: 20 }  // M - Dados direita
  ];

  // === CABEÇALHO EXATO ===
  
  // Linha 1: Logo CARMON + Documento
  worksheet.mergeCells('A1:B1');
  worksheet.getCell('A1').value = '🏢CARMON';
  worksheet.getCell('A1').font = { bold: true, size: 12 };
  worksheet.getCell('A1').border = {
    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
  };

  worksheet.mergeCells('C1:J1');
  worksheet.getCell('C1').value = 'CONTROLO DE ABASTECIMENTO';
  worksheet.getCell('C1').font = { bold: true, size: 14 };
  worksheet.getCell('C1').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell('C1').border = {
    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
  };

  worksheet.getCell('K1').value = 'Documento N.º';
  worksheet.getCell('K1').font = { bold: true };
  worksheet.getCell('K1').border = {
    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
  };

  worksheet.getCell('M1').value = 'PA.DME.01.M02';
  worksheet.getCell('M1').font = { bold: true };
  worksheet.getCell('M1').border = {
    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
  };

  // Linha 2: Revisão
  worksheet.mergeCells('A2:J2');
  worksheet.getCell('K2').value = 'Revisão:';
  worksheet.getCell('K2').font = { bold: true };
  worksheet.getCell('K2').border = {
    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
  };
  worksheet.getCell('M2').value = '06';
  worksheet.getCell('M2').border = {
    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
  };

  // Linha 3: Data no cabeçalho
  worksheet.mergeCells('A3:J3');
  worksheet.getCell('K3').value = 'Data:';
  worksheet.getCell('K3').font = { bold: true };
  worksheet.getCell('K3').border = {
    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
  };
  worksheet.getCell('M3').border = {
    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
  };

  // Linha 4: Vazia
  worksheet.getRow(4).height = 15;

  // === SEÇÃO DE DADOS ===
  
  // Linha 5: Data detalhada + Existência início + Entrada combustível
  worksheet.mergeCells('A5:C5');
  worksheet.getCell('A5').value = 'Data:         /          /2025';
  worksheet.getCell('A5').font = { bold: true };
  
  worksheet.mergeCells('D5:E5');
  worksheet.getCell('D5').value = 'Existência ao início do dia (Lts):___________';
  worksheet.getCell('D5').font = { bold: true };
  
  worksheet.mergeCells('F5:H5');
  worksheet.getCell('F5').value = 'Entrada de Combustível (Lts):_____________';
  worksheet.getCell('F5').font = { bold: true };

  // Linha 6: Posto + Matrícula + Operador
  worksheet.mergeCells('A6:C6');
  worksheet.getCell('A6').value = 'Posto de Abastecimento (Local):';
  worksheet.getCell('A6').font = { bold: true };
  
  worksheet.mergeCells('D6:E6');
  worksheet.getCell('D6').value = 'Matrícula / Activo:';
  worksheet.getCell('D6').font = { bold: true };
  
  worksheet.mergeCells('F6:H6');
  worksheet.getCell('F6').value = 'O operador:';
  worksheet.getCell('F6').font = { bold: true };

  // Linha 7: Vazia
  worksheet.getRow(7).height = 15;

  // === CABEÇALHO DA TABELA ===
  
  // Linha 8: Cabeçalhos das colunas
  worksheet.mergeCells('A8:B8');
  worksheet.getCell('A8').value = 'EQUIPAMENTO';
  worksheet.getCell('A8').font = { bold: true, size: 11 };
  worksheet.getCell('A8').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell('A8').border = {
    top: { style: 'medium' },
    left: { style: 'thin' },
    bottom: { style: 'medium' },
    right: { style: 'thin' }
  };
  worksheet.getCell('A8').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6FA' }
  };

  const headers = [
    { cell: 'C8', text: 'ACTIVO' },
    { cell: 'D8', text: 'MATRÍCULA' },
    { cell: 'E8', text: 'QUANTIDADE (Lts)' },
    { cell: 'F8', text: 'KM/H' }
  ];

  headers.forEach(({ cell, text }) => {
    worksheet.getCell(cell).value = text;
    worksheet.getCell(cell).font = { bold: true, size: 11 };
    worksheet.getCell(cell).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell(cell).border = {
      top: { style: 'medium' },
      left: { style: 'thin' },
      bottom: { style: 'medium' },
      right: { style: 'thin' }
    };
    worksheet.getCell(cell).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };
  });

  // Assinatura (G8:H8)
  worksheet.mergeCells('G8:H8');
  worksheet.getCell('G8').value = 'ASSINATURA';
  worksheet.getCell('G8').font = { bold: true, size: 11 };
  worksheet.getCell('G8').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell('G8').border = {
    top: { style: 'medium' },
    left: { style: 'thin' },
    bottom: { style: 'medium' },
    right: { style: 'thin' }
  };
  worksheet.getCell('G8').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6FA' }
  };

  // === LINHAS DA TABELA (9-40) ===
  
  // Criar 32 linhas para equipamentos
  for (let row = 9; row <= 40; row++) {
    // Equipamento (A:B merged)
    worksheet.mergeCells(`A${row}:B${row}`);
    worksheet.getCell(`A${row}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    // Outras colunas individuais
    ['C', 'D', 'E', 'F'].forEach(col => {
      worksheet.getCell(`${col}${row}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Assinatura (G:H merged)
    worksheet.mergeCells(`G${row}:H${row}`);
    worksheet.getCell(`G${row}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    // Altura das linhas
    worksheet.getRow(row).height = 20;
  }

  // === RODAPÉ ===
  
  // Linha 41: Existência final + Responsável
  worksheet.mergeCells('A41:D41');
  worksheet.getCell('A41').value = 'Existência ao fim do dia (Lts): ______________';
  worksheet.getCell('A41').font = { bold: true };
  
  worksheet.mergeCells('E41:H41');
  worksheet.getCell('E41').value = 'Responsável pelo Abastecimento:______________________________________';
  worksheet.getCell('E41').font = { bold: true };

  return worksheet;
};

// Função para preencher template de abastecimento
export const preencherTemplateAbastecimento = async (dados: DadosAbastecimento): Promise<ArrayBuffer> => {
  try {
    let workbook: ExcelJS.Workbook;
    let worksheet: ExcelJS.Worksheet;
    
    try {
      // Tentar carregar template real primeiro
      workbook = await carregarTemplateViaFetch();
      worksheet = workbook.getWorksheet(1) || workbook.getWorksheet('Controlo de Abastecimento') || workbook.worksheets[0];
      
      if (!worksheet) {
        throw new Error('Worksheet não encontrada no template');
      }
      
      console.log('✅ Template original carregado com sucesso');
      
    } catch (error) {
      // Se falhar, usar template criado programaticamente
      console.log('⚠️ Template original não encontrado, usando template programático');
      worksheet = criarTemplateExato();
      workbook = worksheet.workbook;
    }

    // Preencher dados gerais conforme nova estrutura
    
    // H3: Data completa (dia/mês/ano)
    worksheet.getCell('H3').value = `${dados.data.dia}/${dados.data.mes}/${dados.data.ano}`;
    
    // Modificar texto da A5 para incluir valores de data
    const textoDataCompleto = `Data: ${dados.data.dia}/${dados.data.mes}/${dados.data.ano}`;
    worksheet.getCell('A5').value = textoDataCompleto;
    
    // Modificar texto da D5 para incluir existência início
    const textoExistenciaInicio = `Existência ao início do dia (Lts): ${dados.existenciaInicio}`;
    worksheet.getCell('D5').value = textoExistenciaInicio;
    
    // Modificar texto da F5 para incluir entrada combustível
    const textoEntradaCombustivel = `Entrada de Combustível (Lts): ${dados.entradaCombustivel}`;
    worksheet.getCell('F5').value = textoEntradaCombustivel;
    
    // Modificar texto da A6 para incluir posto
    const textoPosto = `Posto de Abastecimento (Local): ${dados.postoAbastecimento}`;
    worksheet.getCell('A6').value = textoPosto;
    
    // Modificar texto da D6 para incluir matrícula
    const textoMatricula = `Matrícula / Activo: ${dados.matriculaAtivo}`;
    worksheet.getCell('D6').value = textoMatricula;
    
    // Modificar texto da F6 para incluir operador
    const textoOperador = `O operador: ${dados.operador}`;
    worksheet.getCell('F6').value = textoOperador;
    
    // Preencher tabela de equipamentos (começando na linha 9)
    const startRow = 9;
    dados.equipamentos.forEach((equipamento, index) => {
      const row = startRow + index;
      
      // A:B = Equipamento (células mescladas)
      worksheet.getCell(`A${row}`).value = equipamento.equipamento;
      
      // C = Activo
      worksheet.getCell(`C${row}`).value = equipamento.activo;
      
      // D = Matrícula
      worksheet.getCell(`D${row}`).value = equipamento.matricula;
      
      // E = Quantidade
      worksheet.getCell(`E${row}`).value = equipamento.quantidade;
      
      // F = KM/H
      worksheet.getCell(`F${row}`).value = equipamento.kmH;
      
      // G:H = Assinatura (células mescladas)
      worksheet.getCell(`G${row}`).value = equipamento.assinatura || '';
    });
    
    // Preencher rodapé (linha 41)
    // A41:D41 = Existência final
    const textoExistenciaFim = `Existência ao fim do dia (Lts): ${dados.existenciaFim}`;
    worksheet.getCell('A41').value = textoExistenciaFim;
    
    // E41:H41 = Responsável
    const textoResponsavel = `Responsável pelo Abastecimento: ${dados.responsavelAbastecimento}`;
    worksheet.getCell('E41').value = textoResponsavel;
    
    // Retornar buffer para download
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
    
  } catch (error) {
    console.error('Erro ao preencher template de abastecimento:', error);
    throw error;
  }
};

// Função helper para calcular existência final automaticamente
export const calcularExistenciaFinal = (
  existenciaInicio: number,
  entradaCombustivel: number,
  equipamentos: DadosAbastecimento['equipamentos']
): number => {
  const totalConsumido = equipamentos.reduce((total, eq) => total + eq.quantidade, 0);
  return existenciaInicio + entradaCombustivel - totalConsumido;
};

// Exemplo de uso
export const exemploPreenchimentoAbastecimento = async () => {
  const dadosExemplo: DadosAbastecimento = {
    data: {
      dia: 10,
      mes: 9,
      ano: 2025
    },
    existenciaInicio: 1500,
    entradaCombustivel: 500,
    postoAbastecimento: "Posto Central - Carmo",
    matriculaAtivo: "VW-001-CM",
    operador: "João Silva",
    equipamentos: [
      {
        equipamento: "Escavadora CAT",
        activo: "ESC-001",
        matricula: "CAT-320D",
        quantidade: 45.5,
        kmH: 120.5,
        assinatura: "M. Santos"
      },
      {
        equipamento: "Camião Mercedes",
        activo: "CAM-002", 
        matricula: "MB-1834",
        quantidade: 80.0,
        kmH: 145000,
        assinatura: "P. Costa"
      },
      {
        equipamento: "Retroescavadora JCB",
        activo: "RET-003",
        matricula: "JCB-3CX",
        quantidade: 35.2,
        kmH: 98.7,
        assinatura: "A. Ferreira"
      }
    ],
    existenciaFim: 0, // Será calculado
    responsavelAbastecimento: "Carlos Mendes - Supervisor"
  };
  
  // Calcular existência final automaticamente
  dadosExemplo.existenciaFim = calcularExistenciaFinal(
    dadosExemplo.existenciaInicio,
    dadosExemplo.entradaCombustivel,
    dadosExemplo.equipamentos
  );
  
  console.log(`Existência final calculada: ${dadosExemplo.existenciaFim} litros`);
  
  // Gerar relatório
  const buffer = await preencherTemplateAbastecimento(dadosExemplo);
  
  // Aqui você pode retornar o buffer para download ou salvar arquivo
  return buffer;
};

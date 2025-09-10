import { exemploPreenchimentoAbastecimento } from './abastecimento-template';

// Função para testar a geração do relatório no browser
export async function testarAbastecimento() {
  try {
    console.log('🚀 Iniciando teste de geração do relatório...');
    
    // Chamar a função de exemplo
    const buffer = await exemploPreenchimentoAbastecimento();
    
    // Criar download automático do arquivo para testar
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'teste_abastecimento.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Relatório gerado com sucesso!');
    console.log('📁 Arquivo baixado como: teste_abastecimento.xlsx');
    console.log('🔍 Abra o arquivo Excel para verificar o resultado.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        console.log('📋 Certifique-se de que o template Excel existe em:');
        console.log('   src/templates/abastecimento/PA.DME.01.M02 - CONTROLO DE ABASTECIMENTO.xlsx');
      }
    }
    
    return false;
  }
}

// Função para teste rápido no console do navegador
(window as any).testarAbastecimento = testarAbastecimento;

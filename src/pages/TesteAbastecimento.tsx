import React from 'react';
import { Button, Container, Typography, Stack, Alert } from '@mui/material';
import { BugReport as TestIcon } from '@mui/icons-material';
import { testarAbastecimento } from '../templates/abastecimento/test-abastecimento';

const TesteAbastecimento: React.FC = () => {
  const [resultado, setResultado] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const executarTeste = async () => {
    setLoading(true);
    setResultado('');
    
    try {
      const sucesso = await testarAbastecimento();
      if (sucesso) {
        setResultado('✅ Teste executado com sucesso! Verifique o arquivo baixado.');
      } else {
        setResultado('❌ Teste falhou. Verifique o console para mais detalhes.');
      }
    } catch (error) {
      setResultado('❌ Erro durante o teste: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3} alignItems="center">
        <Typography variant="h4" component="h1">
          Teste de Template Abastecimento
        </Typography>
        
        <Typography variant="body1" textAlign="center" color="text.secondary">
          Clique no botão abaixo para testar a geração do relatório de abastecimento
          usando dados de exemplo.
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<TestIcon />}
          onClick={executarTeste}
          disabled={loading}
          sx={{ px: 4, py: 2 }}
        >
          {loading ? 'Testando...' : 'Executar Teste'}
        </Button>
        
        {resultado && (
          <Alert 
            severity={resultado.includes('✅') ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {resultado}
          </Alert>
        )}
        
        <Typography variant="caption" color="text.secondary">
          O teste irá gerar um arquivo Excel com dados de exemplo e fazer download automaticamente.
          Certifique-se de que o template existe na pasta correta.
        </Typography>
      </Stack>
    </Container>
  );
};

export default TesteAbastecimento;

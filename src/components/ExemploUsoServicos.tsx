import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  Alert,
  CircularProgress 
} from '@mui/material';
import { veiculosService, abastecimentoService, ApiException } from '../services';
import type { Veiculo, Abastecimento } from '../services';

/**
 * Componente de exemplo mostrando como usar os serviços de API
 * Este arquivo serve como exemplo e pode ser removido posteriormente
 */
const ExemploUsoServicos = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar veículos ao montar o componente
  useEffect(() => {
    fetchVeiculos();
  }, []);

  // Função para buscar veículos
  const fetchVeiculos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await veiculosService.getAll();
      setVeiculos(data);
    } catch (error) {
      if (error instanceof ApiException) {
        setError(`Erro ao carregar veículos: ${error.message}`);
        
        // Tratamento específico por status
        switch (error.status) {
          case 401:
            setError('Você precisa fazer login para ver os veículos');
            break;
          case 403:
            setError('Você não tem permissão para ver os veículos');
            break;
          case 404:
            setError('Nenhum veículo encontrado');
            break;
          default:
            setError(`Erro ${error.status}: ${error.message}`);
        }
      } else {
        setError('Erro inesperado ao carregar veículos');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar abastecimentos de um veículo
  const fetchAbastecimentosVeiculo = async (veiculoId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await abastecimentoService.getByVeiculo(veiculoId);
      setAbastecimentos(data);
    } catch (error) {
      if (error instanceof ApiException) {
        setError(`Erro ao carregar abastecimentos: ${error.message}`);
      } else {
        setError('Erro inesperado ao carregar abastecimentos');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para criar um novo veículo (exemplo)
  const criarVeiculoExemplo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const novoVeiculo = await veiculosService.create({
        placa: 'EXE-1234',
        modelo: 'Civic',
        marca: 'Honda',
        ano: 2020,
        cor: 'Prata',
        combustivel: 'flex',
        km_atual: 50000,
        observacoes: 'Veículo de exemplo criado via API'
      });
      
      // Atualizar lista de veículos
      setVeiculos(prev => [...prev, novoVeiculo]);
      
    } catch (error) {
      if (error instanceof ApiException) {
        setError(`Erro ao criar veículo: ${error.message}`);
      } else {
        setError('Erro inesperado ao criar veículo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Exemplo de Uso dos Serviços de API
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Este componente demonstra como usar os serviços de API criados para comunicação com o backend.
      </Typography>

      {/* Exibir erros */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Botões de ação */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={fetchVeiculos}
          disabled={loading}
        >
          Carregar Veículos
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={criarVeiculoExemplo}
          disabled={loading}
        >
          Criar Veículo Exemplo
        </Button>
      </Box>

      {/* Lista de veículos */}
      <Typography variant="h6" gutterBottom>
        Veículos Carregados: {veiculos.length}
      </Typography>
      
      <List>
        {veiculos.map((veiculo) => (
          <ListItem key={veiculo.id} divider>
            <ListItemText
              primary={`${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`}
              secondary={`Ano: ${veiculo.ano} | KM: ${veiculo.km_atual.toLocaleString()} | Status: ${veiculo.status}`}
            />
            <Button
              size="small"
              onClick={() => fetchAbastecimentosVeiculo(veiculo.id)}
              disabled={loading}
            >
              Ver Abastecimentos
            </Button>
          </ListItem>
        ))}
      </List>

      {/* Lista de abastecimentos */}
      {abastecimentos.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Abastecimentos: {abastecimentos.length}
          </Typography>
          
          <List>
            {abastecimentos.map((abastecimento) => (
              <ListItem key={abastecimento.id} divider>
                <ListItemText
                  primary={`${new Date(abastecimento.data_abastecimento).toLocaleDateString()} - ${abastecimento.posto}`}
                  secondary={`${abastecimento.litros_abastecidos}L | R$ ${abastecimento.valor_total.toFixed(2)} | KM: ${abastecimento.km_atual.toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* Informações sobre a API */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Como Usar os Serviços
        </Typography>
        <Typography variant="body2" component="div">
          <strong>1. Importar:</strong><br />
          <code>import {`{ veiculosService, ApiException }`} from '../services';</code>
          <br /><br />
          
          <strong>2. Usar com async/await:</strong><br />
          <code>const veiculos = await veiculosService.getAll();</code>
          <br /><br />
          
          <strong>3. Tratar erros:</strong><br />
          <code>
            try {`{`}<br />
            &nbsp;&nbsp;const data = await service.method();<br />
            {`}`} catch (error) {`{`}<br />
            &nbsp;&nbsp;if (error instanceof ApiException) {`{`}<br />
            &nbsp;&nbsp;&nbsp;&nbsp;console.log(error.status, error.message);<br />
            &nbsp;&nbsp;{`}`}<br />
            {`}`}
          </code>
        </Typography>
      </Box>
    </Box>
  );
};

export default ExemploUsoServicos;

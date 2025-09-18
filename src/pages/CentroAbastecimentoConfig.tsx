import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import { Save, ArrowBack, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ConfiguracaoCentro {
  nome: string;
  endereco: string;
  capacidadeMaxima: number;
  quantidadeCombustivel: number;
  tipoCombustivel: string;
  horarioFuncionamento: string;
  responsavel: string;
  telefone: string;
  email: string;
  ativo: boolean;
  observacoes: string;
}

const CentroAbastecimentoConfig: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Estados do formulário
  const [config, setConfig] = useState<ConfiguracaoCentro>({
    nome: '',
    endereco: '',
    capacidadeMaxima: 0,
    quantidadeCombustivel: 0,
    tipoCombustivel: 'diesel',
    horarioFuncionamento: '',
    responsavel: '',
    telefone: '',
    email: '',
    ativo: true,
    observacoes: ''
  });

  // Carregar configurações existentes
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    setLoading(true);
    try {
      // Simulação de carregamento - substituir pela API real
      const configExistente: ConfiguracaoCentro = {
        nome: 'Centro de Abastecimento Principal',
        endereco: 'Rua das Flores, 123 - Centro',
        capacidadeMaxima: 10000,
        quantidadeCombustivel: 7500,
        tipoCombustivel: 'diesel',
        horarioFuncionamento: '06:00 - 18:00',
        responsavel: 'João Silva',
        telefone: '(11) 99999-9999',
        email: 'joao@empresa.com',
        ativo: true,
        observacoes: 'Centro principal de abastecimento da frota'
      };
      
      setConfig(configExistente);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar configurações',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.nome.trim()) {
      setSnackbar({
        open: true,
        message: 'Nome do centro é obrigatório',
        severity: 'error'
      });
      return;
    }

    if (config.quantidadeCombustivel > config.capacidadeMaxima) {
      setSnackbar({
        open: true,
        message: 'Quantidade atual não pode ser maior que a capacidade máxima',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // Simulação de salvamento - substituir pela API real
      console.log('Salvando configurações:', config);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({
        open: true,
        message: 'Configurações salvas com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar configurações',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ConfiguracaoCentro, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const percentualCombustivel = config.capacidadeMaxima > 0 
    ? (config.quantidadeCombustivel / config.capacidadeMaxima) * 100 
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Settings color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Configuração do Centro de Abastecimento
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/abastecimento')}
        >
          Voltar
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Informações Básicas */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Informações Básicas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nome do Centro *"
                  fullWidth
                  value={config.nome}
                  onChange={e => handleInputChange('nome', e.target.value)}
                  error={!config.nome.trim()}
                  helperText={!config.nome.trim() ? 'Nome é obrigatório' : ''}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.ativo}
                      onChange={e => handleInputChange('ativo', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Centro ativo"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Endereço"
                  fullWidth
                  value={config.endereco}
                  onChange={e => handleInputChange('endereco', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Combustível */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              ⛽ Gestão de Combustível
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Capacidade Máxima (Litros)"
                  fullWidth
                  type="number"
                  value={config.capacidadeMaxima}
                  onChange={e => handleInputChange('capacidadeMaxima', Number(e.target.value))}
                  inputProps={{ min: 0, step: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Quantidade Atual (Litros)"
                  fullWidth
                  type="number"
                  value={config.quantidadeCombustivel}
                  onChange={e => handleInputChange('quantidadeCombustivel', Number(e.target.value))}
                  inputProps={{ min: 0, step: 10 }}
                  error={config.quantidadeCombustivel > config.capacidadeMaxima}
                  helperText={
                    config.quantidadeCombustivel > config.capacidadeMaxima 
                      ? 'Não pode ser maior que a capacidade máxima'
                      : `${percentualCombustivel.toFixed(1)}% da capacidade`
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Combustível</InputLabel>
                  <Select
                    value={config.tipoCombustivel}
                    label="Tipo de Combustível"
                    onChange={e => handleInputChange('tipoCombustivel', e.target.value)}
                  >
                    <MenuItem value="diesel">Diesel</MenuItem>
                    <MenuItem value="gasolina">Gasolina</MenuItem>
                    <MenuItem value="etanol">Etanol</MenuItem>
                    <MenuItem value="gnv">GNV</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Informações de Contato */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Informações de Contato
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Responsável"
                  fullWidth
                  value={config.responsavel}
                  onChange={e => handleInputChange('responsavel', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Telefone"
                  fullWidth
                  value={config.telefone}
                  onChange={e => handleInputChange('telefone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="E-mail"
                  fullWidth
                  type="email"
                  value={config.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Horário de Funcionamento"
                  fullWidth
                  value={config.horarioFuncionamento}
                  onChange={e => handleInputChange('horarioFuncionamento', e.target.value)}
                  placeholder="Ex: 06:00 - 18:00"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Observações */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Observações
            </Typography>
            <TextField
              label="Observações"
              fullWidth
              multiline
              minRows={3}
              value={config.observacoes}
              onChange={e => handleInputChange('observacoes', e.target.value)}
              placeholder="Informações adicionais sobre o centro de abastecimento..."
            />
          </Paper>
        </Grid>

        {/* Botões de Ação */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/abastecimento')}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={loading || !config.nome.trim()}
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CentroAbastecimentoConfig;

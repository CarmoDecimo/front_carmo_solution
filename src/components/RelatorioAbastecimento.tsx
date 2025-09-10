import React, { useState } from 'react';
import { 
  Container, 
  Stack, 
  Typography, 
  Button, 
  Grid, 
  TextField, 
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { preencherTemplateAbastecimento, calcularExistenciaFinal } from '../templates/abastecimento/abastecimento-template';

interface EquipamentoAbastecido {
  equipamento: string;
  activo: string;
  matricula: string;
  quantidade: number;
  kmH: number;
  assinatura: string;
}

const RelatorioAbastecimento: React.FC = () => {
  // Estados para o formulário
  const [dia, setDia] = useState<number>(new Date().getDate());
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [existenciaInicio, setExistenciaInicio] = useState<number>(0);
  const [entradaCombustivel, setEntradaCombustivel] = useState<number>(0);
  const [postoAbastecimento, setPostoAbastecimento] = useState<string>('');
  const [matriculaAtivo, setMatriculaAtivo] = useState<string>('');
  const [operador, setOperador] = useState<string>('');
  const [responsavelAbastecimento, setResponsavelAbastecimento] = useState<string>('');
  
  const [equipamentos, setEquipamentos] = useState<EquipamentoAbastecido[]>([
    { equipamento: '', activo: '', matricula: '', quantidade: 0, kmH: 0, assinatura: '' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Adicionar novo equipamento
  const adicionarEquipamento = () => {
    setEquipamentos([...equipamentos, { 
      equipamento: '', activo: '', matricula: '', quantidade: 0, kmH: 0, assinatura: '' 
    }]);
  };

  // Remover equipamento
  const removerEquipamento = (index: number) => {
    if (equipamentos.length > 1) {
      setEquipamentos(equipamentos.filter((_, i) => i !== index));
    }
  };

  // Atualizar equipamento
  const atualizarEquipamento = (index: number, campo: keyof EquipamentoAbastecido, valor: string | number) => {
    const novosEquipamentos = [...equipamentos];
    novosEquipamentos[index] = { ...novosEquipamentos[index], [campo]: valor };
    setEquipamentos(novosEquipamentos);
  };

  // Calcular existência final em tempo real
  const existenciaFinal = calcularExistenciaFinal(existenciaInicio, entradaCombustivel, equipamentos);

  // Gerar relatório Excel
  const gerarRelatorio = async () => {
    try {
      setLoading(true);
      setError('');

      const dados = {
        data: { dia, mes, ano: 2025 },
        existenciaInicio,
        entradaCombustivel,
        postoAbastecimento,
        matriculaAtivo,
        operador,
        equipamentos,
        existenciaFim: existenciaFinal,
        responsavelAbastecimento
      };

      const buffer = await preencherTemplateAbastecimento(dados);
      
      // Criar download do arquivo
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `controlo_abastecimento_${dia}_${mes}_2025.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError('Erro ao gerar relatório. Verifique se o template existe.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Cabeçalho */}
        <Typography variant="h4" component="h1">
          Relatório de Abastecimento
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Dados Gerais */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dados Gerais
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Dia"
                type="number"
                value={dia}
                onChange={(e) => setDia(Number(e.target.value))}
                inputProps={{ min: 1, max: 31 }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Mês"
                type="number"
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                inputProps={{ min: 1, max: 12 }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Posto de Abastecimento"
                value={postoAbastecimento}
                onChange={(e) => setPostoAbastecimento(e.target.value)}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Matrícula / Activo"
                value={matriculaAtivo}
                onChange={(e) => setMatriculaAtivo(e.target.value)}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Operador"
                value={operador}
                onChange={(e) => setOperador(e.target.value)}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Existência Início (Lts)"
                type="number"
                value={existenciaInicio}
                onChange={(e) => setExistenciaInicio(Number(e.target.value))}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Entrada Combustível (Lts)"
                type="number"
                value={entradaCombustivel}
                onChange={(e) => setEntradaCombustivel(Number(e.target.value))}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Tabela de Equipamentos */}
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">
              Equipamentos Abastecidos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={adicionarEquipamento}
            >
              Adicionar Equipamento
            </Button>
          </Stack>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Equipamento</TableCell>
                <TableCell>Activo</TableCell>
                <TableCell>Matrícula</TableCell>
                <TableCell>Quantidade (Lts)</TableCell>
                <TableCell>KM/H</TableCell>
                <TableCell>Assinatura</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipamentos.map((equipamento, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      size="small"
                      value={equipamento.equipamento}
                      onChange={(e) => atualizarEquipamento(index, 'equipamento', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={equipamento.activo}
                      onChange={(e) => atualizarEquipamento(index, 'activo', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={equipamento.matricula}
                      onChange={(e) => atualizarEquipamento(index, 'matricula', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={equipamento.quantidade}
                      onChange={(e) => atualizarEquipamento(index, 'quantidade', Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={equipamento.kmH}
                      onChange={(e) => atualizarEquipamento(index, 'kmH', Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={equipamento.assinatura}
                      onChange={(e) => atualizarEquipamento(index, 'assinatura', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="error" 
                      onClick={() => removerEquipamento(index)}
                      disabled={equipamentos.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Dados Finais */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dados Finais
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Existência Final (Lts)"
                type="number"
                value={existenciaFinal}
                InputProps={{ readOnly: true }}
                helperText="Calculado automaticamente"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Responsável pelo Abastecimento"
                value={responsavelAbastecimento}
                onChange={(e) => setResponsavelAbastecimento(e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Botão Gerar Relatório */}
        <Stack direction="row" justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            onClick={gerarRelatorio}
            disabled={loading}
            sx={{ px: 6, py: 2 }}
          >
            {loading ? 'Gerando...' : 'Gerar Relatório Excel'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default RelatorioAbastecimento;

import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import Chip from '@mui/material/Chip';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

// Tipos para os dados de manutenção
interface ManutencaoItem {
  id: number;
  veiculo: string;
  tipo: string;
  dataPrevista: Date | null;
  kmPrevisto: number | null;
  horimetroPrevisto: number | null;
  responsavel: string;
  status: 'planeada' | 'concluída' | 'atrasada';
}

// Tipos comuns de manutenção para o autocomplete
const tiposManutencao = [
  'Troca de Óleo',
  'Revisão Geral',
  'Troca de Filtros',
  'Inspeção de Segurança',
  'Alinhamento e Balanceamento',
  'Revisão Elétrica',
  'Calibragem de Injetores',
  'Troca de Correias'
];

function Manutencao() {
  const [manutencaoAtual, setManutencaoAtual] = useState<ManutencaoItem>({
    id: 0,
    veiculo: '',
    tipo: '',
    dataPrevista: new Date(),
    kmPrevisto: null,
    horimetroPrevisto: null,
    responsavel: '',
    status: 'planeada'
  });

  const [manutencoes, setManutencoes] = useState<ManutencaoItem[]>([]);

  // Handler para campos do formulário
  const handleChange = (field: string, value: any) => {
    setManutencaoAtual({
      ...manutencaoAtual,
      [field]: value
    });
  };

  // Adicionar item à tabela
  const adicionarItem = () => {
    // Validação básica
    if (!manutencaoAtual.veiculo || !manutencaoAtual.tipo || !manutencaoAtual.dataPrevista) {
      alert('Preencha pelo menos Viatura, Tipo e Data Prevista.');
      return;
    }

    const novoItem = {
      ...manutencaoAtual,
      id: Date.now() // Usar timestamp como id único temporário
    };

    setManutencoes([...manutencoes, novoItem]);

    // Limpar o formulário
    setManutencaoAtual({
      id: 0,
      veiculo: '',
      tipo: '',
      dataPrevista: new Date(),
      kmPrevisto: null,
      horimetroPrevisto: null,
      responsavel: '',
      status: 'planeada'
    });
  };

  // Remover item da tabela
  const removerItem = (id: number) => {
    setManutencoes(manutencoes.filter(item => item.id !== id));
  };

  // Limpar todos os dados
  const limparDados = () => {
    if (!confirm('Deseja realmente limpar todos os dados de manutenção?')) return;
    setManutencoes([]);
  };

  // Exportar para Excel
  const exportarExcel = () => {
    if (manutencoes.length === 0) {
      if (!confirm('Tabela vazia — queres exportar um ficheiro vazio com cabeçalhos?')) return;
    }
    
    // Cabeçalho da tabela
    const header = ['Viatura', 'Tipo de Manutenção', 'Data Prevista', 'Quilometragem Prevista', 'Horímetro Previsto', 'Responsável', 'Status'];
    
    // Converter dados para o formato esperado pelo Excel
    const rows = manutencoes.map(item => [
      item.veiculo,
      item.tipo,
      item.dataPrevista ? item.dataPrevista.toLocaleDateString('pt-BR') : '',
      item.kmPrevisto,
      item.horimetroPrevisto,
      item.responsavel,
      item.status
    ]);
    
    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    
    // Configurar larguras de coluna
    ws['!cols'] = [
      { wpx: 110 },  // Viatura
      { wpx: 160 },  // Tipo
      { wpx: 100 },  // Data
      { wpx: 90 },   // Km
      { wpx: 100 },  // Horímetro
      { wpx: 120 },  // Responsável
      { wpx: 90 }    // Status
    ];
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'PA.DME.01.M01');
    
    // Salvar arquivo
    XLSX.writeFile(wb, `PA.DME.01.M01_Calendario_Manutencao.xlsx`);
  };

  // Obter cor do chip baseado no status
  const getStatusColor = (status: string): "success" | "error" | "warning" => {
    switch (status) {
      case 'concluída':
        return 'success';
      case 'atrasada':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Calendário de Manutenção Preventiva — PA.DME.01.M01
          </Typography>
        </Grid>

        {/* Formulário */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Adicionar Manutenção Preventiva
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Viatura (matrícula)"
                    required
                    margin="normal"
                    value={manutencaoAtual.veiculo}
                    onChange={(e) => handleChange('veiculo', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="tipo-manutencao-label">Tipo de Manutenção</InputLabel>
                    <Select
                      labelId="tipo-manutencao-label"
                      value={manutencaoAtual.tipo}
                      label="Tipo de Manutenção"
                      onChange={(e) => handleChange('tipo', e.target.value)}
                      required
                    >
                      {tiposManutencao.map((tipo) => (
                        <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <DatePicker
                    label="Data Prevista"
                    value={manutencaoAtual.dataPrevista}
                    onChange={(newValue) => handleChange('dataPrevista', newValue)}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal', required: true } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Km Previsto"
                    type="number"
                    margin="normal"
                    value={manutencaoAtual.kmPrevisto || ''}
                    onChange={(e) => handleChange('kmPrevisto', e.target.value ? Number(e.target.value) : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Horímetro Previsto"
                    type="number"
                    margin="normal"
                    value={manutencaoAtual.horimetroPrevisto || ''}
                    onChange={(e) => handleChange('horimetroPrevisto', e.target.value ? Number(e.target.value) : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Responsável Execução"
                    margin="normal"
                    value={manutencaoAtual.responsavel}
                    onChange={(e) => handleChange('responsavel', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={adicionarItem}
                    sx={{ mt: 2 }}
                  >
                    Adicionar à Tabela
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabela de manutenções */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Viatura</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Data Prevista</TableCell>
                  <TableCell>Km Previsto</TableCell>
                  <TableCell>Horímetro Previsto</TableCell>
                  <TableCell>Responsável</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {manutencoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Nenhuma manutenção agendada
                    </TableCell>
                  </TableRow>
                ) : (
                  manutencoes.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.veiculo}</TableCell>
                      <TableCell>{item.tipo}</TableCell>
                      <TableCell>{item.dataPrevista?.toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{item.kmPrevisto}</TableCell>
                      <TableCell>{item.horimetroPrevisto}</TableCell>
                      <TableCell>{item.responsavel}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.status} 
                          color={getStatusColor(item.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => removerItem(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Ações */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<FileDownloadIcon />}
                onClick={exportarExcel}
              >
                Exportar Excel (PA.DME.01.M01)
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<ClearAllIcon />}
                onClick={limparDados}
              >
                Limpar Tabela
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}

export default Manutencao;

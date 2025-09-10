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
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

// Tipos para os dados de horímetro
interface HorimetroItem {
  id: number;
  equipamento: string;
  activo: string;
  matricula: string;
  horAtual: number;
  data: Date | null;
  ultimaRevHor: number | null;
  ultimaRevData: Date | null;
  ultimaRevTipo: string;
  proxRevHor: number | null;
  proxRevTipo: string;
}

function Horimetros() {
  const [horimetroAtual, setHorimetroAtual] = useState<HorimetroItem>({
    id: 0,
    equipamento: '',
    activo: '',
    matricula: '',
    horAtual: 0,
    data: new Date(),
    ultimaRevHor: null,
    ultimaRevData: null,
    ultimaRevTipo: '',
    proxRevHor: null,
    proxRevTipo: ''
  });

  const [horimetros, setHorimetros] = useState<HorimetroItem[]>([]);

  // Handler para campos do formulário
  const handleChange = (field: string, value: any) => {
    setHorimetroAtual({
      ...horimetroAtual,
      [field]: value
    });
  };

  // Adicionar item à tabela
  const adicionarItem = () => {
    // Validação básica
    if (!horimetroAtual.equipamento || !horimetroAtual.horAtual || !horimetroAtual.data) {
      alert('Preencha pelo menos Equipamento, Hora/KM Atual e Data.');
      return;
    }

    const novoItem = {
      ...horimetroAtual,
      id: Date.now() // Usar timestamp como id único temporário
    };

    setHorimetros([...horimetros, novoItem]);

    // Limpar o formulário
    setHorimetroAtual({
      id: 0,
      equipamento: '',
      activo: '',
      matricula: '',
      horAtual: 0,
      data: new Date(),
      ultimaRevHor: null,
      ultimaRevData: null,
      ultimaRevTipo: '',
      proxRevHor: null,
      proxRevTipo: ''
    });
  };

  // Remover item da tabela
  const removerItem = (id: number) => {
    setHorimetros(horimetros.filter(item => item.id !== id));
  };

  // Limpar todos os dados
  const limparDados = () => {
    if (!confirm('Deseja realmente limpar todos os dados de horímetros?')) return;
    setHorimetros([]);
  };

  // Calcular horas que faltam para próxima revisão
  const calcularHorasFaltantes = (horAtual: number, proxRevHor: number | null) => {
    if (proxRevHor === null) return null;
    return proxRevHor - horAtual;
  };

  // Exportar para Excel
  const exportarExcel = () => {
    if (horimetros.length === 0) {
      alert('Tabela de horímetros vazia.');
      return;
    }
    
    // Cabeçalho da tabela
    const header = [
      "Equipamento", "Ativo", "Matrícula", "Hora/KM Atual", "Data", "Horas que faltam",
      "Última Rev Hor", "Última Rev Data", "Última Rev Tipo", "Próx Rev Hor", "Próx Rev Tipo"
    ];
    
    // Converter dados para o formato esperado pelo Excel
    const rows = horimetros.map(item => [
      item.equipamento,
      item.activo,
      item.matricula,
      item.horAtual,
      item.data ? item.data.toLocaleDateString('pt-BR') : '',
      calcularHorasFaltantes(item.horAtual, item.proxRevHor),
      item.ultimaRevHor,
      item.ultimaRevData ? item.ultimaRevData.toLocaleDateString('pt-BR') : '',
      item.ultimaRevTipo,
      item.proxRevHor,
      item.proxRevTipo
    ]);
    
    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    
    // Configurar larguras de coluna
    ws['!cols'] = [
      { wpx: 120 },  // Equipamento
      { wpx: 80 },   // Ativo
      { wpx: 80 },   // Matrícula
      { wpx: 80 },   // Hora/KM Atual
      { wpx: 80 },   // Data
      { wpx: 90 },   // Horas que faltam
      { wpx: 90 },   // Última Rev Hor
      { wpx: 90 },   // Última Rev Data
      { wpx: 100 },  // Última Rev Tipo
      { wpx: 90 },   // Próx Rev Hor
      { wpx: 100 }   // Próx Rev Tipo
    ];
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'PA.DME.01.M03');
    
    // Salvar arquivo
    XLSX.writeFile(wb, `PA.DME.01.M03_Controlo_Horimetros.xlsx`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Controlo de Horímetros — PA.DME.01.M03
          </Typography>
        </Grid>

        {/* Formulário */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Adicionar Horímetro
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Equipamento"
                    required
                    margin="normal"
                    value={horimetroAtual.equipamento}
                    onChange={(e) => handleChange('equipamento', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Activo"
                    margin="normal"
                    value={horimetroAtual.activo}
                    onChange={(e) => handleChange('activo', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Matrícula"
                    margin="normal"
                    value={horimetroAtual.matricula}
                    onChange={(e) => handleChange('matricula', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Hora/KM Atual"
                    type="number"
                    required
                    margin="normal"
                    value={horimetroAtual.horAtual || ''}
                    onChange={(e) => handleChange('horAtual', Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <DatePicker
                    label="Data"
                    value={horimetroAtual.data}
                    onChange={(newValue) => handleChange('data', newValue)}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal', required: true } }}
                  />
                </Grid>
                
                {/* Informações de revisão anterior */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Informações da Última Revisão
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Última Rev. Horímetro"
                    type="number"
                    margin="normal"
                    value={horimetroAtual.ultimaRevHor || ''}
                    onChange={(e) => handleChange('ultimaRevHor', e.target.value ? Number(e.target.value) : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <DatePicker
                    label="Última Rev. Data"
                    value={horimetroAtual.ultimaRevData}
                    onChange={(newValue) => handleChange('ultimaRevData', newValue)}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Última Rev. Tipo"
                    margin="normal"
                    value={horimetroAtual.ultimaRevTipo}
                    onChange={(e) => handleChange('ultimaRevTipo', e.target.value)}
                  />
                </Grid>
                
                {/* Informações da próxima revisão */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Informações da Próxima Revisão
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Próx. Rev. Horímetro"
                    type="number"
                    margin="normal"
                    value={horimetroAtual.proxRevHor || ''}
                    onChange={(e) => handleChange('proxRevHor', e.target.value ? Number(e.target.value) : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Próx. Rev. Tipo"
                    margin="normal"
                    value={horimetroAtual.proxRevTipo}
                    onChange={(e) => handleChange('proxRevTipo', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={adicionarItem}
                    sx={{ mt: 2 }}
                  >
                    Adicionar Horímetro
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabela de horímetros */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Equipamento</TableCell>
                  <TableCell>Activo</TableCell>
                  <TableCell>Matrícula</TableCell>
                  <TableCell>Hora/KM Atual</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Horas Faltantes</TableCell>
                  <TableCell>Última Rev. Hor</TableCell>
                  <TableCell>Última Rev. Data</TableCell>
                  <TableCell>Última Rev. Tipo</TableCell>
                  <TableCell>Próx. Rev. Hor</TableCell>
                  <TableCell>Próx. Rev. Tipo</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {horimetros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      Nenhum horímetro registado
                    </TableCell>
                  </TableRow>
                ) : (
                  horimetros.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.equipamento}</TableCell>
                      <TableCell>{item.activo}</TableCell>
                      <TableCell>{item.matricula}</TableCell>
                      <TableCell>{item.horAtual}</TableCell>
                      <TableCell>{item.data?.toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{calcularHorasFaltantes(item.horAtual, item.proxRevHor)}</TableCell>
                      <TableCell>{item.ultimaRevHor}</TableCell>
                      <TableCell>{item.ultimaRevData?.toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{item.ultimaRevTipo}</TableCell>
                      <TableCell>{item.proxRevHor}</TableCell>
                      <TableCell>{item.proxRevTipo}</TableCell>
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
                Exportar Excel (PA.DME.01.M03)
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

export default Horimetros;

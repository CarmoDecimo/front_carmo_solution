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

// Tipos para os dados do abastecimento
interface AbastecimentoLinha {
  id: number;
  equipamento: string;
  activo: string;
  matricula: string;
  quantidade: number;
  kmh: number | null;
  assinatura: string;
}

function Abastecimento() {
  const [cabecalho, setCabecalho] = useState({
    data: new Date(),
    existenciaInicio: '',
    entradaCombustivel: '',
    posto: '',
    matricula: '',
    operador: ''
  });

  const [linhaAtual, setLinhaAtual] = useState<AbastecimentoLinha>({
    id: 0,
    equipamento: '',
    activo: '',
    matricula: '',
    quantidade: 0,
    kmh: null,
    assinatura: ''
  });

  const [rodape, setRodape] = useState({
    existenciaFim: '',
    responsavelFinal: ''
  });

  const [linhas, setLinhas] = useState<AbastecimentoLinha[]>([]);

  // Handler para campos do cabeçalho
  const handleCabecalhoChange = (field: string, value: any) => {
    setCabecalho({
      ...cabecalho,
      [field]: value
    });
  };

  // Handler para campos da linha atual
  const handleLinhaChange = (field: string, value: any) => {
    setLinhaAtual({
      ...linhaAtual,
      [field]: value
    });
  };

  // Handler para campos do rodapé
  const handleRodapeChange = (field: string, value: any) => {
    setRodape({
      ...rodape,
      [field]: value
    });
  };

  // Adicionar linha à tabela
  const adicionarLinha = () => {
    // Validação básica
    if (!linhaAtual.equipamento || !linhaAtual.matricula || !linhaAtual.quantidade) {
      alert('Preencha pelo menos Equipamento, Matrícula e Quantidade.');
      return;
    }

    const novaLinha = {
      ...linhaAtual,
      id: Date.now() // Usar timestamp como id único temporário
    };

    setLinhas([...linhas, novaLinha]);

    // Limpar o formulário de linha
    setLinhaAtual({
      id: 0,
      equipamento: '',
      activo: '',
      matricula: '',
      quantidade: 0,
      kmh: null,
      assinatura: ''
    });
  };

  // Remover linha da tabela
  const removerLinha = (id: number) => {
    setLinhas(linhas.filter(linha => linha.id !== id));
  };

  // Limpar todos os dados
  const limparDados = () => {
    if (!confirm('Deseja realmente limpar todos os dados do abastecimento?')) return;
    
    setCabecalho({
      data: new Date(),
      existenciaInicio: '',
      entradaCombustivel: '',
      posto: '',
      matricula: '',
      operador: ''
    });
    
    setLinhaAtual({
      id: 0,
      equipamento: '',
      activo: '',
      matricula: '',
      quantidade: 0,
      kmh: null,
      assinatura: ''
    });
    
    setRodape({
      existenciaFim: '',
      responsavelFinal: ''
    });
    
    setLinhas([]);
  };

  // Exportar para Excel
  const exportarExcel = () => {
    const dataFormatada = cabecalho.data.toLocaleDateString('pt-BR');
    
    const ws_data = [
      ["CONTROLO DE ABASTECIMENTO", "", "", "", "Documento Nº", "PA.DME.01.M02"],
      ["", "", "", "", "Revisão:", "06"],
      ["", "", "", "", "Data:", "05/08/25"],
      [],
      [`Data: ${dataFormatada}`, `Existência início: ${cabecalho.existenciaInicio} Lts`, `Entrada Combustível: ${cabecalho.entradaCombustivel} Lts`],
      [`Posto: ${cabecalho.posto}`, `Matrícula/Ativo: ${cabecalho.matricula}`, `Operador: ${cabecalho.operador}`],
      [],
      ["Equipamento", "Activo", "Matrícula", "Quantidade (Lts)", "KM/H", "Assinatura"]
    ];

    // Adicionar linhas de dados
    linhas.forEach(linha => {
      ws_data.push([
        linha.equipamento,
        linha.activo,
        linha.matricula,
        linha.quantidade,
        linha.kmh,
        linha.assinatura
      ]);
    });

    // Adicionar rodapé
    ws_data.push([]);
    ws_data.push([`Existência fim do dia: ${rodape.existenciaFim} Lts`]);
    ws_data.push([`Responsável pelo abastecimento: ${rodape.responsavelFinal}`]);

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Configurar larguras de coluna
    ws['!cols'] = [
      { wpx: 120 }, // Equipamento
      { wpx: 90 },  // Activo
      { wpx: 90 },  // Matrícula
      { wpx: 120 }, // Quantidade
      { wpx: 80 },  // KM/H
      { wpx: 120 }  // Assinatura
    ];

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'PA.DME.01.M02');

    // Salvar arquivo
    XLSX.writeFile(wb, `PA.DME.01.M02_Abastecimento_${dataFormatada.replace(/\//g, '-')}.xlsx`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Controlo de Abastecimento — PA.DME.01.M02
          </Typography>
        </Grid>

        {/* Cabeçalho */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dados do Abastecimento
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Data"
                    value={cabecalho.data}
                    onChange={(newValue) => handleCabecalhoChange('data', newValue)}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Existência Início (Lts)"
                    type="number"
                    margin="normal"
                    value={cabecalho.existenciaInicio}
                    onChange={(e) => handleCabecalhoChange('existenciaInicio', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Entrada Combustível (Lts)"
                    type="number"
                    margin="normal"
                    value={cabecalho.entradaCombustivel}
                    onChange={(e) => handleCabecalhoChange('entradaCombustivel', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Posto / Local"
                    margin="normal"
                    value={cabecalho.posto}
                    onChange={(e) => handleCabecalhoChange('posto', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Matrícula / Ativo"
                    margin="normal"
                    value={cabecalho.matricula}
                    onChange={(e) => handleCabecalhoChange('matricula', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Operador"
                    margin="normal"
                    value={cabecalho.operador}
                    onChange={(e) => handleCabecalhoChange('operador', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Formulário para adicionar linhas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Adicionar Item
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Equipamento"
                    required
                    value={linhaAtual.equipamento}
                    onChange={(e) => handleLinhaChange('equipamento', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Activo"
                    value={linhaAtual.activo}
                    onChange={(e) => handleLinhaChange('activo', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Matrícula"
                    required
                    value={linhaAtual.matricula}
                    onChange={(e) => handleLinhaChange('matricula', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Quantidade (Lts)"
                    type="number"
                    required
                    value={linhaAtual.quantidade || ''}
                    onChange={(e) => handleLinhaChange('quantidade', Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="KM/H"
                    type="number"
                    value={linhaAtual.kmh || ''}
                    onChange={(e) => handleLinhaChange('kmh', e.target.value ? Number(e.target.value) : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Assinatura"
                    value={linhaAtual.assinatura}
                    onChange={(e) => handleLinhaChange('assinatura', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={adicionarLinha}
                    sx={{ mt: 2 }}
                  >
                    Adicionar Linha
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabela de linhas adicionadas */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
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
                {linhas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Nenhum item adicionado
                    </TableCell>
                  </TableRow>
                ) : (
                  linhas.map((linha, index) => (
                    <TableRow key={linha.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{linha.equipamento}</TableCell>
                      <TableCell>{linha.activo}</TableCell>
                      <TableCell>{linha.matricula}</TableCell>
                      <TableCell>{linha.quantidade}</TableCell>
                      <TableCell>{linha.kmh}</TableCell>
                      <TableCell>{linha.assinatura}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => removerLinha(linha.id)}
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

        {/* Rodapé */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Existência Fim (Lts)"
                    type="number"
                    margin="normal"
                    value={rodape.existenciaFim}
                    onChange={(e) => handleRodapeChange('existenciaFim', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Responsável pelo Abastecimento"
                    margin="normal"
                    value={rodape.responsavelFinal}
                    onChange={(e) => handleRodapeChange('responsavelFinal', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
                Exportar Excel (PA.DME.01.M02)
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<ClearAllIcon />}
                onClick={limparDados}
              >
                Limpar Tudo
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}

export default Abastecimento;

import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SaveIcon from '@mui/icons-material/Save';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';
import { preencherTemplateAbastecimento, calcularExistenciaFinal } from '../templates/abastecimento/abastecimento-template';
import { abastecimentoService, ApiException, API_BASE_URL } from '../services';
// import { centroCustoService } from '../services'; // TODO: Usar quando API estiver implementada
import type { CreateAbastecimentoRequest, Equipamento } from '../services';

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
    centroCusto: '',
    centroCustoNome: '', // Novo campo para armazenar o nome do centro de custo
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
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<number | ''>('');

  const [rodape, setRodape] = useState({
    existenciaFim: '',
    responsavelFinal: ''
  });

  const [linhas, setLinhas] = useState<AbastecimentoLinha[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [centrosCustoNomes, setCentrosCustoNomes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Carregar equipamentos ao montar o componente
  useEffect(() => {
    fetchEquipamentos();
  }, []);

  // Buscar equipamentos
  const fetchEquipamentos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/equipamentos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setEquipamentos(result.data);
        // Carregar nomes dos centros de custo
        await loadCentrosCustoNomes(result.data);
      } else {
        setError('Erro ao carregar equipamentos');
        setOpenSnackbar(true);
        setEquipamentos([]); // Lista vazia em caso de erro
      }
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      setError('Erro ao carregar equipamentos da API');
      setOpenSnackbar(true);
      setEquipamentos([]); // Lista vazia em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // Carregar nomes dos centros de custo para todos os equipamentos
  const loadCentrosCustoNomes = async (equipamentos: Equipamento[]) => {
    const centrosCustoIds = new Set<number>();
    
    // Coletar todos os IDs únicos de centros de custo
    equipamentos.forEach(eq => {
      if (eq.centro_custo_id) {
        centrosCustoIds.add(eq.centro_custo_id);
      }
      // Verificar também a estrutura antiga se existir (array)
      if (eq.centros_custo && Array.isArray(eq.centros_custo)) {
        eq.centros_custo.forEach(cc => centrosCustoIds.add(cc.centro_custo_id));
      }
    });

    // Buscar nomes para cada centro de custo
    const nomes: Record<number, string> = {};
    for (const id of centrosCustoIds) {
      try {
        const nome = await fetchCentroCustoNome(id);
        nomes[id] = nome;
      } catch (error) {
        console.error(`Erro ao carregar centro de custo ${id}:`, error);
        nomes[id] = `Centro de Custo ${id}`;
      }
    }
    
    setCentrosCustoNomes(nomes);
  };

  // Buscar nome do centro de custo
  const fetchCentroCustoNome = async (centroCustoId: number): Promise<string> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/centros-custo/${centroCustoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success && result.data) {
        return result.data.nome || 'Centro de Custo não encontrado';
      } else {
        return 'Centro de Custo não encontrado';
      }
    } catch (error) {
      console.error('Erro ao carregar centro de custo:', error);
      return 'Erro ao carregar centro de custo';
    }
  };

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

  // Handler para seleção de equipamento
  const handleEquipamentoChange = async (equipamentoId: number | string) => {
    const id = equipamentoId === '' ? '' : Number(equipamentoId);
    setEquipamentoSelecionado(id);
    
    if (id) {
      const equipamento = equipamentos.find(eq => eq.equipamento_id === id);
      if (equipamento) {
        // Preencher os campos com os dados do equipamento selecionado
        setLinhaAtual({
          ...linhaAtual,
          equipamento: equipamento.nome,
          activo: equipamento.codigo_ativo,
          matricula: equipamento.codigo_ativo // Usando código ativo como matrícula por padrão
        });
        
        // Auto-preencher o centro de custo
        if (equipamento.centro_custo_id) {
          // Usar o nome do cache se disponível, senão buscar
          let centroCustoNome = centrosCustoNomes[equipamento.centro_custo_id];
          if (!centroCustoNome) {
            centroCustoNome = await fetchCentroCustoNome(equipamento.centro_custo_id);
          }
          handleCabecalhoChange('centroCusto', equipamento.centro_custo_id.toString());
          handleCabecalhoChange('centroCustoNome', centroCustoNome);
        } else if (equipamento.centros_custo && equipamento.centros_custo.length > 0) {
          // Fallback para estrutura antiga se existir
          const centroCustoAtivo = equipamento.centros_custo.find(cc => cc.associacao_ativa);
          if (centroCustoAtivo) {
            let centroCustoNome = centrosCustoNomes[centroCustoAtivo.centro_custo_id] || centroCustoAtivo.nome;
            if (!centroCustoNome) {
              centroCustoNome = await fetchCentroCustoNome(centroCustoAtivo.centro_custo_id);
            }
            handleCabecalhoChange('centroCusto', centroCustoAtivo.centro_custo_id.toString());
            handleCabecalhoChange('centroCustoNome', centroCustoNome);
          }
        }
      }
    } else {
      // Limpar campos se nenhum equipamento for selecionado
      setLinhaAtual({
        ...linhaAtual,
        equipamento: '',
        activo: '',
        matricula: ''
      });
      // Limpar também o centro de custo
      handleCabecalhoChange('centroCusto', '');
      handleCabecalhoChange('centroCustoNome', '');
    }
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
      setError('Preencha pelo menos Equipamento, Matrícula e Quantidade.');
      setOpenSnackbar(true);
      return;
    }

    const novaLinha = {
      ...linhaAtual,
      id: Date.now() // Usar timestamp como id único temporário
    };

    setLinhas([...linhas, novaLinha]);

    // Limpar linha atual
    setLinhaAtual({
      id: 0,
      equipamento: '',
      activo: '',
      matricula: '',
      quantidade: 0,
      kmh: null,
      assinatura: ''
    });
    setEquipamentoSelecionado('');
  };

  // Remover linha da tabela
  const removerLinha = (id: number) => {
    setLinhas(linhas.filter(linha => linha.id !== id));
  };

  // Limpar todos os dados
  const limparTudo = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados?')) {
      setCabecalho({
        centroCusto: '',
        centroCustoNome: '',
        data: new Date(),
        existenciaInicio: '',
        entradaCombustivel: '',
        posto: '',
        matricula: '',
        operador: ''
      });
      setLinhas([]);
      setRodape({
        existenciaFim: '',
        responsavelFinal: ''
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
      setEquipamentoSelecionado('');
    }
  };

  // Verificar se todos os campos obrigatórios estão preenchidos
  const isFormValid = () => {
    return !!(
      cabecalho.centroCusto &&
      cabecalho.existenciaInicio &&
      cabecalho.entradaCombustivel &&
      cabecalho.posto &&
      cabecalho.matricula &&
      cabecalho.operador &&
      rodape.responsavelFinal &&
      linhas.length > 0
    );
  };

  // Enviar dados para o backend
  const enviarParaBackend = async () => {
    // Validação dos dados obrigatórios
    if (!cabecalho.centroCusto) {
      setError('Centro de Custo é obrigatório');
      setOpenSnackbar(true);
      return;
    }

    if (!cabecalho.existenciaInicio || !cabecalho.entradaCombustivel || !cabecalho.posto || 
        !cabecalho.matricula || !cabecalho.operador || !rodape.responsavelFinal) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      setOpenSnackbar(true);
      return;
    }

    if (linhas.length === 0) {
      setError('Adicione pelo menos um equipamento');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar dados para envio
      const dadosEnvio: CreateAbastecimentoRequest = {
        centro_custo_id: cabecalho.centroCusto,
        data_abastecimento: cabecalho.data.toISOString().split('T')[0], // Formato YYYY-MM-DD
        existencia_inicio: Number(cabecalho.existenciaInicio),
        entrada_combustivel: Number(cabecalho.entradaCombustivel),
        posto_abastecimento: cabecalho.posto,
        matricula_ativo: cabecalho.matricula,
        operador: cabecalho.operador,
        equipamentos: linhas.map(linha => ({
          equipamento: linha.equipamento,
          activo: linha.activo,
          matricula: linha.matricula,
          quantidade: linha.quantidade,
          kmh: linha.kmh || undefined,
          assinatura: linha.assinatura
        })),
        existencia_fim: Number(rodape.existenciaFim) || calcularExistenciaFinal(
          Number(cabecalho.existenciaInicio),
          Number(cabecalho.entradaCombustivel),
          linhas.map(linha => ({
            equipamento: linha.equipamento,
            activo: linha.activo,
            matricula: linha.matricula,
            quantidade: linha.quantidade,
            kmH: linha.kmh || 0,
            assinatura: linha.assinatura
          }))
        ),
        responsavel_abastecimento: rodape.responsavelFinal
      };

      // Enviar para o backend
      const response = await abastecimentoService.create(dadosEnvio);
      
      setSuccess(`Abastecimento enviado com sucesso! Protocolo: ${response.numero_protocolo || response.id}`);
      setOpenSnackbar(true);
      
      // Limpar formulário após sucesso
      setTimeout(() => {
        limparTudo();
      }, 2000);

    } catch (error) {
      console.error('Erro ao enviar abastecimento:', error);
      
      if (error instanceof ApiException) {
        setError(`Erro ao enviar: ${error.message}`);
      } else {
        setError('Erro inesperado ao enviar dados');
      }
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Exportar para Excel usando template
  const exportarExcel = async () => {
    try {
      // Preparar os dados no formato esperado pelo template
      const dadosTemplate = {
        data: {
          dia: cabecalho.data.getDate(),
          mes: cabecalho.data.getMonth() + 1,
          ano: cabecalho.data.getFullYear()
        },
        existenciaInicio: Number(cabecalho.existenciaInicio) || 0,
        entradaCombustivel: Number(cabecalho.entradaCombustivel) || 0,
        postoAbastecimento: cabecalho.posto,
        matriculaAtivo: cabecalho.matricula,
        operador: cabecalho.operador,
        equipamentos: linhas.map(linha => ({
          equipamento: linha.equipamento,
          activo: linha.activo,
          matricula: linha.matricula,
          quantidade: linha.quantidade,
          kmH: linha.kmh || 0,
          assinatura: linha.assinatura
        })),
        existenciaFim: Number(rodape.existenciaFim) || calcularExistenciaFinal(
          Number(cabecalho.existenciaInicio) || 0,
          Number(cabecalho.entradaCombustivel) || 0,
          linhas.map(linha => ({
            equipamento: linha.equipamento,
            activo: linha.activo,
            matricula: linha.matricula,
            quantidade: linha.quantidade,
            kmH: linha.kmh || 0,
            assinatura: linha.assinatura
          }))
        ),
        responsavelAbastecimento: rodape.responsavelFinal
      };

      // Gerar o arquivo usando o template
      const buffer = await preencherTemplateAbastecimento(dadosTemplate);
      
      // Criar blob e download
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Controle_Abastecimento_${cabecalho.data.toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess('Arquivo Excel gerado com sucesso!');
      setOpenSnackbar(true);

    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      setError('Erro ao gerar arquivo Excel');
      setOpenSnackbar(true);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Controle de Abastecimento
        </Typography>

        {/* Cabeçalho */}
        <Card sx={{ marginBottom: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dados Gerais
            </Typography>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <DatePicker
                  label="Data"
                  value={cabecalho.data}
                  onChange={(newValue) => handleCabecalhoChange('data', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <TextField
                  label="Existência Início (L)"
                  type="number"
                  value={cabecalho.existenciaInicio}
                  onChange={(e) => handleCabecalhoChange('existenciaInicio', e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Entrada Combustível (L)"
                  type="number"
                  value={cabecalho.entradaCombustivel}
                  onChange={(e) => handleCabecalhoChange('entradaCombustivel', e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Posto de Abastecimento"
                  value={cabecalho.posto}
                  onChange={(e) => handleCabecalhoChange('posto', e.target.value)}
                  fullWidth
                  required
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <TextField
                  label="Matrícula do Ativo"
                  value={cabecalho.matricula}
                  onChange={(e) => handleCabecalhoChange('matricula', e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Operador"
                  value={cabecalho.operador}
                  onChange={(e) => handleCabecalhoChange('operador', e.target.value)}
                  fullWidth
                  required
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Adicionar Equipamento */}
        <Card sx={{ marginBottom: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Adicionar Equipamento
            </Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <FormControl fullWidth size="small">
                  <InputLabel>Equipamento</InputLabel>
                  <Select
                    value={equipamentoSelecionado}
                    label="Equipamento"
                    onChange={(e) => handleEquipamentoChange(e.target.value)}
                    disabled={loading}
                  >
                    {loading ? (
                      <MenuItem disabled>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        Carregando equipamentos...
                      </MenuItem>
                    ) : equipamentos.length === 0 ? (
                      <MenuItem disabled>
                        Nenhum equipamento disponível
                      </MenuItem>
                    ) : (
                      equipamentos.map((equipamento) => (
                        <MenuItem key={equipamento.equipamento_id} value={equipamento.equipamento_id}>
                          {equipamento.nome} ({equipamento.codigo_ativo})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <TextField
                  label="Ativo"
                  value={linhaAtual.activo}
                  onChange={(e) => handleLinhaChange('activo', e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Matrícula"
                  value={linhaAtual.matricula}
                  onChange={(e) => handleLinhaChange('matricula', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <TextField
                  label="Quantidade (L)"
                  type="number"
                  value={linhaAtual.quantidade}
                  onChange={(e) => handleLinhaChange('quantidade', Number(e.target.value))}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Km/H"
                  type="number"
                  value={linhaAtual.kmh || ''}
                  onChange={(e) => handleLinhaChange('kmh', e.target.value ? Number(e.target.value) : null)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Assinatura"
                  value={linhaAtual.assinatura}
                  onChange={(e) => handleLinhaChange('assinatura', e.target.value)}
                  fullWidth
                  size="small"
                />
                <IconButton 
                  onClick={adicionarLinha}
                  color="primary"
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Tabela de Equipamentos */}
        {linhas.length > 0 && (
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Equipamentos Adicionados
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Equipamento</TableCell>
                      <TableCell>Ativo</TableCell>
                      <TableCell>Matrícula</TableCell>
                      <TableCell>Quantidade (L)</TableCell>
                      <TableCell>Km/H</TableCell>
                      <TableCell>Assinatura</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {linhas.map((linha) => (
                      <TableRow key={linha.id}>
                        <TableCell>{linha.equipamento}</TableCell>
                        <TableCell>{linha.activo}</TableCell>
                        <TableCell>{linha.matricula}</TableCell>
                        <TableCell>{linha.quantidade}</TableCell>
                        <TableCell>{linha.kmh}</TableCell>
                        <TableCell>{linha.assinatura}</TableCell>
                        <TableCell>
                          <IconButton 
                            onClick={() => removerLinha(linha.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Rodapé */}
        <Card sx={{ marginBottom: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Finalização
            </Typography>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <TextField
                  label="Existência Final (L)"
                  type="number"
                  value={rodape.existenciaFim}
                  onChange={(e) => handleRodapeChange('existenciaFim', e.target.value)}
                  fullWidth
                  helperText="Deixe vazio para calcular automaticamente"
                />
                <TextField
                  label="Responsável pelo Abastecimento"
                  value={rodape.responsavelFinal}
                  onChange={(e) => handleRodapeChange('responsavelFinal', e.target.value)}
                  fullWidth
                  required
                />
              </Stack>
              
              <TextField
                label="Centro de Custo"
                value={cabecalho.centroCustoNome || 'Selecione um equipamento para preencher automaticamente'}
                fullWidth
                disabled
                helperText="Este campo é preenchido automaticamente baseado no equipamento selecionado"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={enviarParaBackend}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading || !isFormValid()}
          >
            {loading ? 'Enviando...' : 'Enviar para Backend'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={exportarExcel}
            startIcon={<FileDownloadIcon />}
            disabled={loading}
          >
            Exportar Excel
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            onClick={limparTudo}
            startIcon={<ClearAllIcon />}
            disabled={loading}
          >
            Limpar Tudo
          </Button>
        </Stack>

        {/* Snackbar para notificações */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert 
            onClose={() => setOpenSnackbar(false)} 
            severity={error ? 'error' : 'success'}
            sx={{ width: '100%' }}
          >
            {error || success}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

export default Abastecimento;

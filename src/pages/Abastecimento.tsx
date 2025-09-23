import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField, Stack, Alert, Snackbar,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Autocomplete, Table, TableBody, TableCell, TableHead, TableRow, Chip,
  Divider, IconButton, Paper, TableContainer
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { equipamentosService } from '../services';
import { abastecimentoService } from '../services/abastecimentoService';
import turnoAbastecimentoService, { 
  type TurnoAbastecimento, 
  type IniciarTurnoRequest, 
  type AdicionarEquipamentosRequest, 
  type FecharTurnoRequest 
} from '../services/turnoAbastecimento.service';
import type { Equipamento } from '../services';

// Estados da interface
type EstadoInterface = 'verificando' | 'sem_turno' | 'turno_ativo' | 'turno_fechado';

// Interface para equipamento na lista local
interface EquipamentoLista {
  equipamento_id: number;
  nome: string;
  codigo_ativo: string;
  quantidade: number;
  horimetro?: number;
  responsavel?: string;
}

function Abastecimento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  // Estados principais
  const [estadoInterface, setEstadoInterface] = useState<EstadoInterface>('verificando');
  const [turnoAtivo, setTurnoAtivo] = useState<TurnoAbastecimento | null>(null);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [equipamentosLista, setEquipamentosLista] = useState<EquipamentoLista[]>([]);
  const [historico, setHistorico] = useState<TurnoAbastecimento[]>([]);
  const [historicoTurnoAtivo, setHistoricoTurnoAtivo] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  
  // Estados para modo de edição
  const [abastecimentoEditando, setAbastecimentoEditando] = useState<any>(null);
  
  // Estados para formulários
  const [dadosIniciarTurno, setDadosIniciarTurno] = useState<IniciarTurnoRequest>({
    existencia_inicio: 0,
    responsavel_abastecimento: '',
    matricula: '',
    matricula_ativo: '',
    posto_abastecimento: '',
    operador: '',
    entrada_combustivel: 0
  });
  
  const [equipamentoAtual, setEquipamentoAtual] = useState<EquipamentoLista>({
    equipamento_id: 0,
    nome: '',
    codigo_ativo: '',
    quantidade: 0,
    horimetro: undefined,
    responsavel: ''
  });
  
  // Estados para diálogos
  const [dialogFecharTurno, setDialogFecharTurno] = useState(false);
  const [dadosFecharTurno, setDadosFecharTurno] = useState<FecharTurnoRequest>({
    existencia_fim: 0,
    responsavel_abastecimento: ''
  });
  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [verificandoTurno, setVerificandoTurno] = useState(false);
  const [ultimaVerificacao, setUltimaVerificacao] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Verificar turno ativo e carregar equipamentos ao montar o componente
  useEffect(() => {
    inicializarPagina();
  }, []);

  // Carregar histórico quando turno ativo ou equipamentos mudarem
  useEffect(() => {
    if (estadoInterface !== 'verificando') {
      carregarHistorico();
    }
  }, [turnoAtivo, equipamentosLista, estadoInterface]);

  // Removido: Verificação automática ao focar na página para evitar requisições desnecessárias

  // Forçar limpeza completa do estado
  const forcarLimpezaCompleta = () => {
    console.log('🧹 Forçando limpeza completa do estado...');
    localStorage.removeItem('turno_ativo_id');
    setTurnoAtivo(null);
    setEquipamentosLista([]);
    setEstadoInterface('sem_turno');
    setError(null);
    setSuccess(null);
  };

  // Inicializar página
  const inicializarPagina = async () => {
    setLoading(true);
    try {
      // Se estiver em modo de edição, carregar dados do abastecimento
      if (isEditMode && id) {
        console.log('📝 Modo de edição detectado, carregando abastecimento ID:', id);
        await carregarAbastecimentoParaEdicao(Number(id));
        return;
      }
      
      // Verificar se há turno fake/problemático no localStorage e remover
      const turnoId = localStorage.getItem('turno_ativo_id');
      if (turnoId && (turnoId === '34' || turnoId === 'verificacao' || turnoId === 'verificacao_automatica')) {
        console.log('🗑️ Removendo turno fake/problemático do localStorage:', turnoId);
        forcarLimpezaCompleta();
        return; // Sair da função, página ficará no estado sem_turno
      }
      
      // Carregar equipamentos primeiro
      await carregarEquipamentos();
      
      // Verificar turno ativo
      if (turnoId) {
        await verificarTurnoAtivo();
      } else {
        console.log('📭 Nenhum turno no localStorage, indo para página principal');
        // Não há turno, ir direto para página principal
        setEstadoInterface('sem_turno');
      }
    } catch (error) {
      console.error('Erro ao inicializar página:', error);
      setError('Erro ao carregar dados iniciais');
      setOpenSnackbar(true);
      // Em caso de erro, ir para página principal
      setEstadoInterface('sem_turno');
    } finally {
      setLoading(false);
    }
  };

  // Carregar equipamentos
  const carregarEquipamentos = async () => {
    try {
      const response = await equipamentosService.getAll();
      setEquipamentos(response || []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      setEquipamentos([]);
    }
  };

  // Carregar dados do abastecimento para edição
  const carregarAbastecimentoParaEdicao = async (abastecimentoId: number) => {
    try {
      console.log('🔍 Carregando dados do abastecimento para edição:', abastecimentoId);
      
      // Carregar equipamentos primeiro
      await carregarEquipamentos();
      
      // Carregar dados do abastecimento
      const abastecimento = await abastecimentoService.buscarPorId(abastecimentoId);
      console.log('📋 Dados do abastecimento carregados:', abastecimento);
      
      setAbastecimentoEditando(abastecimento);
      
      // Preencher formulário com dados do abastecimento
      setDadosIniciarTurno({
        existencia_inicio: abastecimento.existencia_inicio || 0,
        responsavel_abastecimento: abastecimento.responsavel_abastecimento || '',
        matricula: abastecimento.matricula_ativo || abastecimento.matricula || '',
        matricula_ativo: abastecimento.matricula_ativo || '',
        posto_abastecimento: abastecimento.posto_abastecimento || '',
        operador: abastecimento.operador || '',
        entrada_combustivel: abastecimento.entrada_combustivel || 0
      });
      
      // Carregar equipamentos do abastecimento se existirem
      if (abastecimento.equipamentos && abastecimento.equipamentos.length > 0) {
        const equipamentosFormatados = abastecimento.equipamentos.map((eq: any, index: number) => ({
          equipamento_id: eq.equipamento_id || index + 1,
          nome: eq.nome || eq.equipamento || `Equipamento ${index + 1}`,
          codigo_ativo: eq.codigo_ativo || eq.activo || '',
          quantidade: eq.quantidade || 0,
          horimetro: eq.horimetro || eq.kmh,
          responsavel: eq.responsavel || eq.assinatura || ''
        }));
        setEquipamentosLista(equipamentosFormatados);
      }
      
      // Definir estado como edição (usar sem_turno para mostrar formulário)
      setEstadoInterface('sem_turno');
      
    } catch (error) {
      console.error('❌ Erro ao carregar abastecimento para edição:', error);
      setError('Erro ao carregar dados do abastecimento para edição');
      setOpenSnackbar(true);
      
      // Redirecionar de volta para lista em caso de erro
      setTimeout(() => {
        navigate('/abastecimento');
      }, 2000);
    }
  };

  // Carregar histórico de turnos
  const carregarHistorico = async () => {
    setLoadingHistorico(true);
    try {
      // Se há turno ativo, carregar apenas histórico deste turno
      if (turnoAtivo?.id_abastecimento) {
        console.log('📋 Carregando histórico do turno ativo:', turnoAtivo.id_abastecimento);
        // Por enquanto, usar dados mock até implementar API específica
        setHistoricoTurnoAtivo([
          {
            data: new Date().toLocaleDateString('pt-BR'),
            equipamento: 'Equipamentos do turno atual',
            quantidade: equipamentosLista.reduce((total, eq) => total + eq.quantidade, 0),
            responsavel: turnoAtivo.responsavel_abastecimento,
            status: 'Em andamento'
          }
        ]);
        setHistorico([]); // Limpar histórico geral
      } else {
        console.log('📋 Carregando histórico geral de turnos');
        // Carregar todos os turnos (implementar API futuramente)
        setHistorico([]);
        setHistoricoTurnoAtivo([]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setHistorico([]);
      setHistoricoTurnoAtivo([]);
    } finally {
      setLoadingHistorico(false);
    }
  };

  // Verificar se há turno ativo
  const verificarTurnoAtivo = async (forcarVerificacao = false) => {
    const agora = Date.now();
    
    // Evitar chamadas múltiplas (debounce de 2 segundos) - exceto se forçado
    if (!forcarVerificacao && verificandoTurno) {
      console.log('🔄 Verificação de turno já em andamento, ignorando...');
      return;
    }
    
    if (!forcarVerificacao && agora - ultimaVerificacao < 2000) {
      console.log('⏱️ Verificação muito recente, ignorando... (debounce)');
      return;
    }

    try {
      setVerificandoTurno(true);
      setUltimaVerificacao(agora);
      setEstadoInterface('verificando');
      
      console.log('🔍 APENAS VERIFICANDO turno ativo (SEM CRIAR NOVO)...');
      
      // IMPORTANTE: Apenas verificar, nunca criar novo turno
      const turno = await turnoAbastecimentoService.verificarTurnoAtivo();
      
      // Turno já foi validado pela função verificarTurnoAtivo() do service
      
      if (turno) {
        console.log('✅ Turno ativo encontrado e validado:', turno.id_abastecimento);
        console.log('🎯 Redirecionando para página do turno ativo...');
        setTurnoAtivo(turno);
        // Converter equipamentos do turno para lista local
        if (turno.equipamentos_abastecimentos) {
          const equipamentosConvertidos = turno.equipamentos_abastecimentos.map((eq, index) => ({
            equipamento_id: index + 1, // Temporário, pois não temos o ID real
            nome: eq.equipamento,
            codigo_ativo: eq.activo,
            quantidade: eq.quantidade,
            horimetro: eq.kmh || undefined,
            responsavel: eq.assinatura || ''
          }));
          setEquipamentosLista(equipamentosConvertidos);
          console.log('📋 Equipamentos do turno carregados:', equipamentosConvertidos.length);
        }
        setEstadoInterface('turno_ativo');
      } else {
        console.log('📭 Nenhum turno ativo encontrado');
        console.log('🏠 Redirecionando para página principal de abastecimento...');
        setEstadoInterface('sem_turno');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar turno ativo:', error);
      // Em caso de erro, assumir que não há turno ativo
      setEstadoInterface('sem_turno');
    } finally {
      setVerificandoTurno(false);
    }
  };

  // Iniciar turno ou salvar alterações
  const handleIniciarTurno = async () => {
    if (!dadosIniciarTurno.existencia_inicio || dadosIniciarTurno.existencia_inicio <= 0) {
      setError('Existência inicial deve ser maior que zero');
      setOpenSnackbar(true);
      return;
    }

    if (!dadosIniciarTurno.responsavel_abastecimento.trim()) {
      setError('Responsável pelo abastecimento é obrigatório');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && abastecimentoEditando) {
        // Modo de edição - salvar alterações usando rota de turnos
        console.log('💾 Salvando alterações do abastecimento via rota de turnos:', abastecimentoEditando.id_abastecimento);
        
        // Usar a rota de adicionar equipamentos do sistema de turnos
        const equipamentosParaAPI = equipamentosLista.map(eq => ({
          equipamento_id: Number(eq.equipamento_id),
          quantidade: Number(eq.quantidade),
          horimetro: eq.horimetro ? Number(eq.horimetro) : undefined,
          responsavel: eq.responsavel || undefined
        }));
        
        const dadosParaEnviar = {
          entrada_combustivel: Number(dadosIniciarTurno.entrada_combustivel) || 0,
          equipamentos: equipamentosParaAPI
        };
        
        console.log('📤 Dados sendo enviados para API:', JSON.stringify(dadosParaEnviar, null, 2));
        
        await turnoAbastecimentoService.adicionarEquipamentos(abastecimentoEditando.id_abastecimento, dadosParaEnviar);
        
        setSuccess('Abastecimento atualizado com sucesso!');
        setOpenSnackbar(true);
        
        // Redirecionar para lista após salvar
        setTimeout(() => {
          navigate('/abastecimento');
        }, 2000);
        
      } else {
        // Modo normal - iniciar novo turno
        console.log('🚀 Tentando iniciar turno com dados:', dadosIniciarTurno);
        const response = await turnoAbastecimentoService.iniciarTurno(dadosIniciarTurno);
        console.log('✅ Resposta do serviço:', response);
        
        setTurnoAtivo(response.turno);
        setEquipamentosLista([]);
        setEstadoInterface('turno_ativo');
        
        // Garantir que o ID do turno seja salvo no localStorage
        if (response.turno?.id_abastecimento) {
          localStorage.setItem('turno_ativo_id', response.turno.id_abastecimento.toString());
          console.log('💾 ID do turno salvo no localStorage:', response.turno.id_abastecimento);
        }
        
        setSuccess('Turno iniciado com sucesso!');
        setOpenSnackbar(true);
        
        // Limpar formulário
        setDadosIniciarTurno({
          existencia_inicio: 0,
          responsavel_abastecimento: '',
          matricula: '',
          matricula_ativo: '',
          posto_abastecimento: '',
          operador: '',
          entrada_combustivel: 0
        });
      }
    } catch (error: any) {
      console.error('❌ Erro detalhado ao iniciar turno:', {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        stack: error.stack
      });
      
      // Verificar se é erro de turno já existente (pode vir em diferentes formatos)
      const errorMessage = error.response?.data?.message || error.message || '';
      if (errorMessage.includes('turno em aberto') || errorMessage.includes('turno ativo')) {
        console.log('🔄 Turno já existe, tentando detectar e carregar...');
        console.log('📝 Mensagem completa:', errorMessage);
        
        // Usar a nova função para detectar e carregar o turno ativo
        const turnoDetectado = await turnoAbastecimentoService.detectarTurnoAtivoDoErro(errorMessage);
        
        if (turnoDetectado) {
          // Turno detectado e carregado com sucesso
          setTurnoAtivo(turnoDetectado);
          setEstadoInterface('turno_ativo');
          setSuccess('Turno ativo encontrado! Carregando dados do turno...');
          
          // Carregar equipamentos do turno se existirem
          if (turnoDetectado.equipamentos_abastecimentos && turnoDetectado.equipamentos_abastecimentos.length > 0) {
            const equipamentosFormatados = turnoDetectado.equipamentos_abastecimentos.map((eq: any) => ({
              equipamento_id: eq.equipamento_id,
              nome: eq.equipamento?.nome || `Equipamento ${eq.equipamento_id}`,
              codigo_ativo: eq.equipamento?.codigo_ativo || '',
              quantidade: eq.quantidade,
              horimetro: eq.horimetro,
              responsavel: eq.responsavel
            }));
            setEquipamentosLista(equipamentosFormatados);
          }
        } else {
          console.log('❌ Não foi possível detectar ou carregar o turno ativo');
          setError('Turno ativo detectado, mas não foi possível carregar. Tente novamente.');
        }
      } else {
        let errorMessage = 'Erro ao iniciar turno';
        
        // Verificar diferentes tipos de erro
        if (error.status === 0 || error.message?.includes('conexão')) {
          errorMessage = 'Erro de conexão com o servidor. Verifique se o backend está rodando.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        console.error('💥 Erro final:', errorMessage);
        setError(errorMessage);
      }
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Abrir turno (adicionar equipamento e iniciar se necessário)
  const handleAbrirTurno = async () => {
    console.log('🔓 Iniciando processo de abertura de turno...');
    
    // Se não há turno ativo, tentar detectar um existente primeiro
    if (!turnoAtivo?.id_abastecimento) {
      console.log('📭 Nenhum turno ativo detectado, verificando se existe algum...');
      
      setLoading(true);
      try {
        // Tentar verificar se há turno ativo no backend
        await verificarTurnoAtivo(true);
        
        // Se ainda não há turno após verificação, redirecionar para criar
        if (!turnoAtivo?.id_abastecimento) {
          setError('Nenhum turno ativo encontrado. Redirecionando para iniciar novo turno...');
          setOpenSnackbar(true);
          
          setTimeout(() => {
            setEstadoInterface('sem_turno');
            setError(null);
          }, 2000);
          return;
        }
      } catch (error) {
        console.error('❌ Erro ao verificar turno:', error);
        setError('Erro ao verificar turno ativo. Redirecionando para iniciar novo turno...');
        setOpenSnackbar(true);
        
        setTimeout(() => {
          setEstadoInterface('sem_turno');
          setError(null);
        }, 2000);
        return;
      } finally {
        setLoading(false);
      }
    }

    // Se chegou aqui, há turno ativo - adicionar equipamento
    console.log('✅ Turno ativo confirmado, adicionando equipamento:', turnoAtivo.id_abastecimento);
    await handleAdicionarEquipamento();
  };

  // Adicionar equipamento no modo de edição
  const handleAdicionarEquipamentoEdicao = () => {
    if (!equipamentoAtual.equipamento_id || equipamentoAtual.equipamento_id === 0) {
      setError('Selecione um equipamento');
      setOpenSnackbar(true);
      return;
    }

    if (!equipamentoAtual.quantidade || equipamentoAtual.quantidade <= 0) {
      setError('Quantidade deve ser maior que zero');
      setOpenSnackbar(true);
      return;
    }

    // Adicionar à lista local (será salvo quando clicar em "Salvar Alterações")
    setEquipamentosLista([...equipamentosLista, equipamentoAtual]);
    
    // Limpar formulário
    setEquipamentoAtual({
      equipamento_id: 0,
      nome: '',
      codigo_ativo: '',
      quantidade: 0,
      horimetro: undefined,
      responsavel: ''
    });

    setSuccess('Equipamento adicionado à lista! Clique em "Salvar Alterações" para confirmar.');
    setOpenSnackbar(true);
  };

  // Adicionar equipamento à lista
  const handleAdicionarEquipamento = async () => {
    if (!equipamentoAtual.equipamento_id || equipamentoAtual.equipamento_id === 0) {
      setError('Selecione um equipamento');
      setOpenSnackbar(true);
      return;
    }

    if (!equipamentoAtual.quantidade || equipamentoAtual.quantidade <= 0) {
      setError('Quantidade deve ser maior que zero');
      setOpenSnackbar(true);
      return;
    }

    if (!turnoAtivo?.id_abastecimento) {
      setError('Nenhum turno ativo encontrado');
      setOpenSnackbar(true);
      return;
    }

    // Removido: Verificação preventiva desnecessária que fazia requisição extra

    setLoading(true);
    try {
      const dados: AdicionarEquipamentosRequest = {
        entrada_combustivel: turnoAtivo.entrada_combustivel,
        equipamentos: [{
          equipamento_id: equipamentoAtual.equipamento_id,
          quantidade: equipamentoAtual.quantidade,
          horimetro: equipamentoAtual.horimetro,
          responsavel: equipamentoAtual.responsavel
        }]
      };

      await turnoAbastecimentoService.adicionarEquipamentos(turnoAtivo.id_abastecimento, dados);
      
      // Adicionar à lista local
      setEquipamentosLista([...equipamentosLista, equipamentoAtual]);
      
      // Limpar formulário
      setEquipamentoAtual({
        equipamento_id: 0,
        nome: '',
        codigo_ativo: '',
        quantidade: 0,
        horimetro: undefined,
        responsavel: ''
      });

      setSuccess('Equipamento adicionado com sucesso!');
      setOpenSnackbar(true);
    } catch (error: any) {
      console.error('❌ Erro detalhado ao adicionar equipamento:', {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Tratamento específico para turno não encontrado
      if (error.response?.status === 404) {
        console.log('🔄 Turno não encontrado (404), recarregando página...');
        setError('Turno não encontrado. A página será recarregada.');
        setOpenSnackbar(true);
        
        // Limpar estado e recarregar após 2 segundos
        setTimeout(() => {
          localStorage.removeItem('turno_ativo_id');
          window.location.reload();
        }, 2000);
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('Nenhum turno em aberto')) {
        console.log('🔄 Nenhum turno em aberto, redirecionando...');
        setError('Nenhum turno em aberto. Redirecionando...');
        setOpenSnackbar(true);
        
        // Limpar estado e verificar turno
        setTimeout(() => {
          localStorage.removeItem('turno_ativo_id');
          setEstadoInterface('sem_turno');
          setTurnoAtivo(null);
          setEquipamentosLista([]);
        }, 2000);
      } else {
        setError(error.response?.data?.message || 'Erro ao adicionar equipamento');
        setOpenSnackbar(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Remover equipamento da lista
  const handleRemoverEquipamento = (index: number) => {
    const novosEquipamentos = equipamentosLista.filter((_, i) => i !== index);
    setEquipamentosLista(novosEquipamentos);
    setSuccess('Equipamento removido da lista');
    setOpenSnackbar(true);
  };

  // Fechar turno
  const handleFecharTurno = async () => {
    if (!dadosFecharTurno.existencia_fim || dadosFecharTurno.existencia_fim <= 0) {
      setError('Existência final deve ser maior que zero');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const response = await turnoAbastecimentoService.fecharTurno(dadosFecharTurno);
      setTurnoAtivo(response.turno);
      setEstadoInterface('turno_fechado');
      setDialogFecharTurno(false);
      setSuccess('Turno fechado com sucesso!');
      setOpenSnackbar(true);
      
      // Limpar dados
      setEquipamentosLista([]);
      setDadosFecharTurno({
        existencia_fim: 0,
        responsavel_abastecimento: ''
      });
    } catch (error: any) {
      console.error('Erro ao fechar turno:', error);
      setError(error.response?.data?.message || 'Erro ao fechar turno');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Calcular totais do turno
  const calcularTotais = () => {
    const totalAbastecido = equipamentosLista.reduce((total, eq) => total + eq.quantidade, 0);
    const existenciaCalculada = turnoAtivo 
      ? (turnoAtivo.existencia_inicio + (turnoAtivo.entrada_combustivel || 0) - totalAbastecido)
      : 0;
    
    return { totalAbastecido, existenciaCalculada };
  };

  // Renderizar estado de verificação
  const renderVerificando = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h6" color="text.secondary">
        Verificando turno ativo...
      </Typography>
    </Box>
  );

  // Renderizar formulário para iniciar turno
  const renderSemTurno = () => (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PlayArrowIcon color="primary" />
            <Typography variant="h6">
              {isEditMode ? 'Editar Abastecimento' : 'Iniciar Novo Turno'}
            </Typography>
          </Box>
          
          <Alert severity="info">
            {isEditMode 
              ? 'Editando dados do abastecimento. Modifique os campos necessários e salve as alterações.'
              : 'Nenhum turno ativo encontrado. Inicie um novo turno para começar o abastecimento.'
            }
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <TextField
                label="Existência Inicial (L)"
                type="number"
                value={dadosIniciarTurno.existencia_inicio || ''}
                onChange={(e) => setDadosIniciarTurno({
                  ...dadosIniciarTurno,
                  existencia_inicio: Number(e.target.value)
                })}
                fullWidth
                required
              />
              <TextField
                label="Responsável pelo Abastecimento"
                value={dadosIniciarTurno.responsavel_abastecimento}
                onChange={(e) => setDadosIniciarTurno({
                  ...dadosIniciarTurno,
                  responsavel_abastecimento: e.target.value
                })}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <TextField
                label="Matrícula"
                value={dadosIniciarTurno.matricula || ''}
                onChange={(e) => setDadosIniciarTurno({
                  ...dadosIniciarTurno,
                  matricula: e.target.value
                })}
                fullWidth
                helperText="Matrícula do responsável (opcional)"
              />
              <TextField
                label="Operador"
                value={dadosIniciarTurno.operador || ''}
                onChange={(e) => setDadosIniciarTurno({
                  ...dadosIniciarTurno,
                  operador: e.target.value
                })}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <TextField
                label="Posto de Abastecimento"
                value={dadosIniciarTurno.posto_abastecimento || ''}
                onChange={(e) => setDadosIniciarTurno({
                  ...dadosIniciarTurno,
                  posto_abastecimento: e.target.value
                })}
                fullWidth
              />
              <TextField
                label="Entrada de Combustível (L)"
                type="number"
                value={dadosIniciarTurno.entrada_combustivel || ''}
                onChange={(e) => setDadosIniciarTurno({
                  ...dadosIniciarTurno,
                  entrada_combustivel: Number(e.target.value)
                })}
                fullWidth
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={handleIniciarTurno}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            disabled={loading}
            size="large"
          >
            {loading 
              ? (isEditMode ? 'Salvando...' : 'Iniciando...') 
              : (isEditMode ? 'Salvar Alterações' : 'Iniciar Turno')
            }
          </Button>
          
          {isEditMode && (
            <Button
              variant="outlined"
              onClick={() => navigate('/abastecimento')}
              disabled={loading}
              size="large"
            >
              Cancelar
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  // Renderizar turno ativo
  const renderTurnoAtivo = () => {
    const { totalAbastecido, existenciaCalculada } = calcularTotais();
    
    return (
      <Stack spacing={3}>
        {/* Informações do Turno - só mostrar se não estiver em modo de edição */}
        {!isEditMode && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <LocalGasStationIcon color="primary" />
                <Typography variant="h6">Turno Ativo - ID: {turnoAtivo?.id_abastecimento}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: { xs: '1 1 45%', md: '1 1 22%' }, minWidth: 200 }}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="primary.contrastText">Existência Inicial</Typography>
                    <Typography variant="h6" color="primary.contrastText">{turnoAtivo?.existencia_inicio}L</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: { xs: '1 1 45%', md: '1 1 22%' }, minWidth: 200 }}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="info.contrastText">Entrada</Typography>
                    <Typography variant="h6" color="info.contrastText">{turnoAtivo?.entrada_combustivel || 0}L</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: { xs: '1 1 45%', md: '1 1 22%' }, minWidth: 200 }}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="warning.contrastText">Total Abastecido</Typography>
                    <Typography variant="h6" color="warning.contrastText">{totalAbastecido}L</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: { xs: '1 1 45%', md: '1 1 22%' }, minWidth: 200 }}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="success.contrastText">Existência Calculada</Typography>
                    <Typography variant="h6" color="success.contrastText">{existenciaCalculada}L</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Adicionar Equipamentos */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isEditMode ? 'Editar Equipamentos' : 'Abrir Turno'}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { md: 'end' } }}>
                <Box sx={{ flex: { xs: 1, md: 3 }, minWidth: 200 }}>
                  <Autocomplete
                    options={equipamentos}
                    getOptionLabel={(option) => `${option.nome} (${option.codigo_ativo})`}
                    value={equipamentos.find(eq => eq.equipamento_id === equipamentoAtual.equipamento_id) || null}
                    onChange={(_, newValue) => {
                      setEquipamentoAtual({
                        ...equipamentoAtual,
                        equipamento_id: newValue?.equipamento_id || 0,
                        nome: newValue?.nome || '',
                        codigo_ativo: newValue?.codigo_ativo || ''
                      });
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Equipamento" required />
                    )}
                  />
                </Box>
                <Box sx={{ flex: { xs: 1, md: 2 }, minWidth: 150 }}>
                  <TextField
                    label="Quantidade (L)"
                    type="number"
                    value={equipamentoAtual.quantidade || ''}
                    onChange={(e) => setEquipamentoAtual({
                      ...equipamentoAtual,
                      quantidade: Number(e.target.value)
                    })}
                    fullWidth
                    required
                  />
                </Box>
                <Box sx={{ flex: { xs: 1, md: 2 }, minWidth: 150 }}>
                  <TextField
                    label="Horímetro"
                    type="number"
                    value={equipamentoAtual.horimetro || ''}
                    onChange={(e) => setEquipamentoAtual({
                      ...equipamentoAtual,
                      horimetro: Number(e.target.value)
                    })}
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: { xs: 1, md: 3 }, minWidth: 200 }}>
                  <TextField
                    label="Responsável"
                    value={equipamentoAtual.responsavel || ''}
                    onChange={(e) => setEquipamentoAtual({
                      ...equipamentoAtual,
                      responsavel: e.target.value
                    })}
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: { xs: 1, md: 2 }, minWidth: 120 }}>
                  <Button
                    variant="contained"
                    onClick={isEditMode ? handleAdicionarEquipamentoEdicao : handleAbrirTurno}
                    startIcon={<OpenInNewIcon />}
                    disabled={loading || !equipamentoAtual.equipamento_id || !equipamentoAtual.quantidade}
                    fullWidth
                    color="primary"
                  >
                    {isEditMode ? 'Adicionar Equipamento' : 'Abrir Turno'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Lista de Equipamentos */}
        {equipamentosLista.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Equipamentos Abastecidos</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Equipamento</TableCell>
                      <TableCell>Código</TableCell>
                      <TableCell>Quantidade (L)</TableCell>
                      <TableCell>Horímetro</TableCell>
                      <TableCell>Responsável</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equipamentosLista.map((equipamento, index) => (
                      <TableRow key={index}>
                        <TableCell>{equipamento.nome}</TableCell>
                        <TableCell>{equipamento.codigo_ativo}</TableCell>
                        <TableCell>{equipamento.quantidade}</TableCell>
                        <TableCell>{equipamento.horimetro || '-'}</TableCell>
                        <TableCell>{equipamento.responsavel || '-'}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleRemoverEquipamento(index)}
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

        {/* Botão Fechar Turno - só mostrar se não estiver em modo de edição */}
        {!isEditMode && (
          <Button
            variant="contained"
            color="error"
            onClick={() => setDialogFecharTurno(true)}
            startIcon={<StopIcon />}
            size="large"
          >
            Fechar Turno
          </Button>
        )}
      </Stack>
    );
  };


  // Renderizar turno fechado
  const renderTurnoFechado = () => {
    const { totalAbastecido } = calcularTotais();
    const variacao = turnoAtivo?.existencia_fim 
      ? Math.abs(turnoAtivo.existencia_fim - ((turnoAtivo.existencia_inicio + (turnoAtivo.entrada_combustivel || 0)) - totalAbastecido))
      : 0;
    
    return (
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <AssignmentIcon color="success" />
              <Typography variant="h6">Turno Fechado - ID: {turnoAtivo?.id_abastecimento}</Typography>
            </Box>
            
            <Alert severity="success" sx={{ mb: 3 }}>
              Turno fechado com sucesso! Confira o resumo abaixo.
            </Alert>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 45%', md: '1 1 15%' }, minWidth: 150 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="primary.contrastText">Existência Inicial</Typography>
                  <Typography variant="h6" color="primary.contrastText">{turnoAtivo?.existencia_inicio}L</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 45%', md: '1 1 15%' }, minWidth: 150 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="info.contrastText">Entrada</Typography>
                  <Typography variant="h6" color="info.contrastText">{turnoAtivo?.entrada_combustivel || 0}L</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 45%', md: '1 1 15%' }, minWidth: 150 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="warning.contrastText">Abastecido</Typography>
                  <Typography variant="h6" color="warning.contrastText">{totalAbastecido}L</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 45%', md: '1 1 15%' }, minWidth: 150 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.contrastText">Existência Final</Typography>
                  <Typography variant="h6" color="success.contrastText">{turnoAtivo?.existencia_fim}L</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 45%', md: '1 1 15%' }, minWidth: 150 }}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: variacao <= 1 ? 'success.light' : 'error.light', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color={variacao <= 1 ? 'success.contrastText' : 'error.contrastText'}>
                    Variação
                  </Typography>
                  <Typography variant="h6" color={variacao <= 1 ? 'success.contrastText' : 'error.contrastText'}>
                    {variacao.toFixed(1)}L
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 45%', md: '1 1 15%' }, minWidth: 150 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.300', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.primary">Data</Typography>
                  <Typography variant="h6" color="text.primary">
                    {new Date(turnoAtivo?.data_abastecimento || '').toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Button
              variant="contained"
              onClick={() => {
                setEstadoInterface('sem_turno');
                setTurnoAtivo(null);
                setEquipamentosLista([]);
              }}
              startIcon={<PlayArrowIcon />}
              size="large"
            >
              Iniciar Novo Turno
            </Button>
          </CardContent>
        </Card>

        {/* Histórico de Turnos */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6">
                {turnoAtivo ? 'Histórico do Turno Atual' : 'Histórico de Todos os Turnos'}
              </Typography>
            </Box>
            
            {loadingHistorico ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {turnoAtivo && historicoTurnoAtivo.length > 0 ? (
                  // Histórico do turno ativo
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Exibindo apenas o histórico do turno atual (ID: {turnoAtivo.id_abastecimento})
                    </Alert>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Data</TableCell>
                          <TableCell>Equipamentos</TableCell>
                          <TableCell>Total Litros</TableCell>
                          <TableCell>Responsável</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {historicoTurnoAtivo.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.data}</TableCell>
                            <TableCell>{equipamentosLista.length} equipamentos</TableCell>
                            <TableCell>{item.quantidade} L</TableCell>
                            <TableCell>{item.responsavel}</TableCell>
                            <TableCell>
                              <Chip 
                                label={item.status} 
                                color="primary" 
                                size="small" 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                ) : !turnoAtivo && historico.length > 0 ? (
                  // Histórico geral de turnos
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Exibindo histórico de todos os turnos anteriores
                    </Alert>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Data</TableCell>
                          <TableCell>Operador</TableCell>
                          <TableCell>Posto</TableCell>
                          <TableCell>Equipamentos</TableCell>
                          <TableCell>Total Litros</TableCell>
                          <TableCell>Responsável</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {historico.map((turno, index) => (
                          <TableRow key={index}>
                            <TableCell>{new Date(turno.data_abastecimento).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{turno.operador || '-'}</TableCell>
                            <TableCell>{turno.posto_abastecimento || '-'}</TableCell>
                            <TableCell>{turno.equipamentos_abastecimentos?.length || 0}</TableCell>
                            <TableCell>{turno.quantidade_combustivel || 0} L</TableCell>
                            <TableCell>{turno.responsavel_abastecimento}</TableCell>
                            <TableCell>
                              <Chip 
                                label={turno.status === 'fechado' ? 'Concluído' : 'Aberto'} 
                                color={turno.status === 'fechado' ? 'success' : 'warning'} 
                                size="small" 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                ) : (
                  // Sem histórico
                  <Alert severity="info">
                    {turnoAtivo 
                      ? 'Nenhum histórico disponível para o turno atual.' 
                      : 'Nenhum histórico de turnos encontrado.'}
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Stack>
    );
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Sistema de Turnos de Abastecimento
        </Typography>
        
        {/* Botão de emergência para limpeza completa */}
        <Button
          variant="outlined"
          color="warning"
          size="small"
          onClick={forcarLimpezaCompleta}
          sx={{ ml: 2 }}
        >
          🧹 Limpar Estado
        </Button>
      </Box>

      {/* Renderizar baseado no estado */}
      {estadoInterface === 'verificando' && renderVerificando()}
      {estadoInterface === 'sem_turno' && renderSemTurno()}
      {(estadoInterface === 'turno_ativo' || (isEditMode && estadoInterface === 'sem_turno')) && renderTurnoAtivo()}
      {estadoInterface === 'turno_fechado' && renderTurnoFechado()}

      {/* Diálogo para fechar turno */}
      <Dialog open={dialogFecharTurno} onClose={() => setDialogFecharTurno(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Fechar Turno</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Ao fechar o turno, não será possível adicionar mais equipamentos.
            </Alert>
            
            <TextField
              label="Existência Final (L)"
              type="number"
              value={dadosFecharTurno.existencia_fim || ''}
              onChange={(e) => setDadosFecharTurno({
                ...dadosFecharTurno,
                existencia_fim: Number(e.target.value)
              })}
              fullWidth
              required
              helperText={`Existência calculada: ${calcularTotais().existenciaCalculada}L`}
            />
            
            <TextField
              label="Responsável Final (opcional)"
              value={dadosFecharTurno.responsavel_abastecimento || ''}
              onChange={(e) => setDadosFecharTurno({
                ...dadosFecharTurno,
                responsavel_abastecimento: e.target.value
              })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogFecharTurno(false)}>Cancelar</Button>
          <Button 
            onClick={handleFecharTurno}
            variant="contained"
            color="error"
            disabled={loading || !dadosFecharTurno.existencia_fim}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <StopIcon />}
          >
            {loading ? 'Fechando...' : 'Fechar Turno'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
  );
}

export default Abastecimento;

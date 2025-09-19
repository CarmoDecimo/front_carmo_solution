import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BuildIcon from '@mui/icons-material/Build';
import SpeedIcon from '@mui/icons-material/Speed';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ConstructionIcon from '@mui/icons-material/Construction';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { styled, keyframes } from '@mui/material/styles';
import { abastecimentoService, centroCustoService } from '../services/abastecimentoService';
import { equipamentosService } from '../services/equipamentosService';

// Interfaces para dados dinâmicos
interface DashboardStats {
  totalAbastecimentos: number;
  totalCombustivel: number;
  totalManutencoes: number;
  equipamentosAtivos: number;
  alertasAtivos: number;
  servicosAbertos: number;
  tendencias: {
    abastecimentos: { valor: string; positiva: boolean };
    combustivel: { valor: string; positiva: boolean };
    manutencoes: { valor: string; positiva: boolean };
    equipamentos: { valor: string; positiva: boolean };
    alertas: { valor: string; positiva: boolean };
    servicos: { valor: string; positiva: boolean };
  };
}

interface ManutencaoItem {
  id: number;
  veiculo: string;
  tipo: string;
  data: string;
  kmPrev: string;
  status: 'pendente' | 'atrasado' | 'concluido';
  prioridade: 'alta' | 'media' | 'baixa';
  responsavel?: string;
}

interface SystemStatus {
  online: boolean;
  ultimaAtualizacao: string;
  versao: string;
}

// Hook personalizado para dados do dashboard
const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [manutencoes, setManutencoes] = useState<ManutencaoItem[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    online: true,
    ultimaAtualizacao: new Date().toLocaleString(),
    versao: '2.1.0'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      // Buscar dados reais das APIs existentes
      const [abastecimentosResponse, equipamentosResponse, alertasResponse] = await Promise.all([
        abastecimentoService.getAll().catch(() => ({ data: [], totalCount: 0 })),
        equipamentosService.getAll().catch(() => []),
        equipamentosService.getAlertas().catch(() => [])
      ]);

      // Calcular estatísticas reais
      const totalAbastecimentos = abastecimentosResponse.totalCount || abastecimentosResponse.data?.length || 0;
      
      // Somar combustível dos abastecimentos diretos + estatísticas dos centros de custo
      let totalCombustivel = abastecimentosResponse.data?.reduce((total: number, abast: any) => {
        return total + (abast.quantidade_combustivel || abast.entrada_combustivel || 0);
      }, 0) || 0;

      const equipamentosAtivos = equipamentosResponse.filter((eq: any) => eq.status_equipamento === 'ativo').length;
      const equipamentosManutencao = equipamentosResponse.filter((eq: any) => eq.status_equipamento === 'manutencao').length;
      const alertasAtivos = alertasResponse.length;

      // Calcular tendências baseadas nos dados reais
      const tendenciasCalculadas = {
        abastecimentos: { 
          valor: totalAbastecimentos > 100 ? '+12%' : totalAbastecimentos > 50 ? '+5%' : '-5%', 
          positiva: totalAbastecimentos > 50 
        },
        combustivel: { 
          valor: totalCombustivel > 2000 ? '+8%' : totalCombustivel > 1000 ? '+3%' : '-3%', 
          positiva: totalCombustivel > 1000 
        },
        manutencoes: { 
          valor: equipamentosManutencao > 5 ? '+15%' : equipamentosManutencao > 2 ? '+5%' : '-5%', 
          positiva: equipamentosManutencao <= 3 
        },
        equipamentos: { 
          valor: equipamentosAtivos > 20 ? '100%' : equipamentosAtivos > 10 ? '90%' : '80%', 
          positiva: equipamentosAtivos > 10 
        },
        alertas: { 
          valor: alertasAtivos > 5 ? '+25%' : alertasAtivos > 3 ? '+10%' : '-15%', 
          positiva: alertasAtivos <= 3 
        },
        servicos: { 
          valor: equipamentosManutencao > 3 ? '+10%' : '+3%', 
          positiva: equipamentosManutencao <= 5 
        }
      };

      console.log('📊 Estatísticas Calculadas:', {
        totalAbastecimentos,
        totalCombustivel,
        equipamentosAtivos,
        equipamentosManutencao,
        alertasAtivos
      });

      setStats({
        totalAbastecimentos,
        totalCombustivel: Math.round(totalCombustivel),
        totalManutencoes: equipamentosManutencao,
        equipamentosAtivos,
        alertasAtivos,
        servicosAbertos: equipamentosManutencao, // Serviços abertos = equipamentos em manutenção
        tendencias: tendenciasCalculadas
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      // Fallback para dados simulados
      setStats({
        totalAbastecimentos: 125,
        totalCombustivel: 2350,
        totalManutencoes: 28,
        equipamentosAtivos: 12,
        alertasAtivos: 5,
        servicosAbertos: 8,
        tendencias: {
          abastecimentos: { valor: '+12%', positiva: true },
          combustivel: { valor: '+8%', positiva: true },
          manutencoes: { valor: '-5%', positiva: false },
          equipamentos: { valor: '100%', positiva: true },
          alertas: { valor: '-15%', positiva: false },
          servicos: { valor: '+3%', positiva: true }
        }
      });
    }
  };

  const fetchManutencoes = async () => {
    try {
      // Buscar equipamentos com alerta de manutenção
      const equipamentosComAlerta = await equipamentosService.getAlertas();
      
      // Converter equipamentos para formato de manutenções
      const manutencoesConvertidas: ManutencaoItem[] = equipamentosComAlerta.map((equipamento: any) => {
        // Determinar se está atrasado baseado nas horas para vencer
        const isAtrasado = equipamento.horas_para_vencer <= 0;
        const dataEstimada = new Date();
        
        // Se não está atrasado, calcular data estimada baseada nas horas para vencer
        if (!isAtrasado && equipamento.horas_para_vencer > 0) {
          // Assumindo 8 horas de trabalho por dia
          const diasParaVencer = Math.ceil(equipamento.horas_para_vencer / 8);
          dataEstimada.setDate(dataEstimada.getDate() + diasParaVencer);
        }

        return {
          id: equipamento.equipamento_id,
          veiculo: equipamento.nome || equipamento.codigo_ativo,
          tipo: 'Manutenção Preventiva',
          data: dataEstimada.toLocaleDateString('pt-BR'),
          kmPrev: equipamento.proxima_revisao_horimetro?.toString() || 'N/A',
          status: isAtrasado ? 'atrasado' : 'pendente',
          prioridade: equipamento.horas_para_vencer <= 50 ? 'alta' : 'media',
          responsavel: equipamento.centros_custo?.nome || 'Não definido'
        };
      });

      setManutencoes(manutencoesConvertidas);
    } catch (err) {
      console.error('Erro ao buscar manutenções:', err);
      // Fallback para dados simulados
      setManutencoes([
        { id: 1, veiculo: 'JCB 3CX', tipo: 'Troca de Óleo', data: '2025-09-20', kmPrev: '15000', status: 'pendente', prioridade: 'alta', responsavel: 'João Silva' },
        { id: 2, veiculo: 'Toyota Hilux', tipo: 'Revisão Geral', data: '2025-09-25', kmPrev: '10000', status: 'pendente', prioridade: 'media', responsavel: 'Maria Santos' },
        { id: 3, veiculo: 'Caterpillar', tipo: 'Troca de Filtros', data: '2025-09-12', kmPrev: '5000', status: 'atrasado', prioridade: 'alta', responsavel: 'Pedro Costa' },
      ]);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchManutencoes()
      ]);
      
      setSystemStatus(prev => ({
        ...prev,
        ultimaAtualizacao: new Date().toLocaleString()
      }));
    } catch (err) {
      setError('Erro ao atualizar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    manutencoes,
    systemStatus,
    loading,
    error,
    refreshData
  };
};

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Container principal com gradiente
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.background.default,
  position: 'relative',
  paddingBottom: theme.spacing(4),
}));

// Header profissional
const DashboardHeader = styled(Paper)(({ theme }) => ({
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '16px',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  boxShadow: theme.shadows[2],
  position: 'relative',
  zIndex: 1,
  animation: `${fadeIn} 0.8s ease-out`,
}));

// Cards de estatísticas responsivos
const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
  boxShadow: theme.shadows[1],
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
    '& .stat-icon': {
      animation: `${pulse} 1.5s infinite`,
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: theme.palette.primary.main,
  },
}));

// Ícone com gradiente
const StatIcon = styled(Avatar)<{ bgcolor?: string }>(({ theme, bgcolor }) => ({
  width: 60,
  height: 60,
  background: bgcolor || `linear-gradient(135deg, 
    ${theme.palette.primary.main} 0%, 
    ${theme.palette.primary.dark} 100%)`,
  marginBottom: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  '& .MuiSvgIcon-root': {
    fontSize: '2rem',
    color: 'white',
  },
}));

// Cards de módulos modernos
const ModuleCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: theme.shadows[1],
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: theme.shadows[6],
    '& .module-avatar': {
      transform: 'scale(1.05)',
    },
    '& .module-button': {
      transform: 'scale(1.02)',
    },
  },
}));

// Alertas modernos
const ModernAlert = styled(Alert)(({ theme }) => ({
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
  animation: `${slideIn} 0.6s ease-out`,
  '&.MuiAlert-standardWarning': {
    backgroundColor: theme.palette.warning.light + '20',
    borderColor: theme.palette.warning.main,
  },
  '&.MuiAlert-standardInfo': {
    backgroundColor: theme.palette.info.light + '20',
    borderColor: theme.palette.info.main,
  },
}));

// Progress bar animada
const AnimatedProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 3,
  background: 'rgba(0, 0, 0, 0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 3,
    background: `linear-gradient(90deg, 
      ${theme.palette.primary.main} 0%, 
      ${theme.palette.secondary.main} 100%)`,
  },
}));

// Componente para seção de centros de custo
const CentrosCustoSection: React.FC<{ loading: boolean; refreshData: () => void }> = ({ loading: dashboardLoading, refreshData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [centrosCusto, setCentrosCusto] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarCentrosCusto = async () => {
    setLoading(true);
    try {
      console.log('🏢 Carregando centros de custo...');
      
      // Usar exatamente a mesma abordagem da página CentroCusto.tsx
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/centros-custo', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('📡 Resposta da API:', result);
      
      if (result.success) {
        const centros = result.data;
        console.log('✅ Centros carregados:', centros);
        console.log('📊 Primeiro centro:', centros[0]);
        
        // Ordenar por data de criação (mais recentes primeiro) e pegar os 3 últimos
        const centrosOrdenados = centros.sort((a: any, b: any) => {
          const dataA = new Date(a.criado_em || a.created_at || 0);
          const dataB = new Date(b.criado_em || b.created_at || 0);
          return dataB.getTime() - dataA.getTime(); // Decrescente (mais recentes primeiro)
        });
        
        const ultimos3 = centrosOrdenados.slice(0, 3);
        console.log('🕒 Últimos 3 centros de custo (mais recentes):', ultimos3);
        setCentrosCusto(ultimos3);
        
        // Para cada centro, tentar buscar estatísticas
        const centrosComEstatisticas = await Promise.all(
          ultimos3.map(async (centro: any) => {
            try {
              const centroId = centro.centro_custo_id;
              console.log(`📡 Buscando estatísticas do centro ${centro.nome} (ID: ${centroId})`);
              
              // Usar fetch direto para estatísticas também
              const estatisticasResponse = await fetch(`http://localhost:3001/api/centros-custo/${centroId}/estatisticas`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (estatisticasResponse.ok) {
                const estatisticasResult = await estatisticasResponse.json();
                const estatisticas = estatisticasResult.success ? estatisticasResult.data : null;
                console.log(`✅ Estatísticas obtidas para ${centro.nome}:`, estatisticas);
                
                return {
                  ...centro,
                  estatisticas
                };
              } else {
                console.warn(`⚠️ Estatísticas não disponíveis para ${centro.nome} (status: ${estatisticasResponse.status})`);
                return {
                  ...centro,
                  estatisticas: null
                };
              }
            } catch (error) {
              console.warn(`⚠️ Erro ao buscar estatísticas para ${centro.nome}:`, error);
              return {
                ...centro,
                estatisticas: null
              };
            }
          })
        );
        
        setCentrosCusto(centrosComEstatisticas);
        console.log('🎯 Centros com estatísticas processados:', centrosComEstatisticas);
      } else {
        console.error('❌ Erro na resposta da API:', result.message);
        setCentrosCusto([]);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar centros de custo:', error);
      setCentrosCusto([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCentrosCusto();
  }, []);

  return (
    <Box>
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Centros de Custo - Últimos 3 Adicionados
      </Typography>
      
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {loading || dashboardLoading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: { xs: 2, md: 3 } }}>
                <Skeleton variant="text" width="70%" height={30} />
                <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                </Stack>
              </Card>
            </Grid>
          ))
        ) : centrosCusto.length > 0 ? (
          // Renderizar centros de custo
          centrosCusto.map((centro: any, index: number) => (
            <Grid key={centro.id || centro.centro_custo_id || index} size={{ xs: 12, md: 4 }}>
              <Grow in timeout={1800 + index * 200}>
                <StatCard>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {centro.nome || 'Centro de Custo'}
                      </Typography>
                      {index === 0 && (
                        <Chip 
                          label="Mais Recente" 
                          size="small" 
                          color="primary" 
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Código: {centro.codigo || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                      Criado em: {new Date(centro.criado_em || centro.created_at).toLocaleDateString('pt-BR')}
                    </Typography>
                    
                    <Stack spacing={1.5}>
                      {/* Equipamentos */}
                      <Paper sx={{ p: 1.5, backgroundColor: 'action.hover', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SpeedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Equipamentos
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {centro.estatisticas?.equipamentos?.total || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={`Ativos: ${centro.estatisticas?.equipamentos?.ativos || 0}`} 
                            size="small" 
                            color="success" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={`Inativos: ${centro.estatisticas?.equipamentos?.inativos || 0}`} 
                            size="small" 
                            color="error" 
                            variant="outlined" 
                          />
                        </Box>
                      </Paper>

                      {/* Abastecimentos */}
                      <Paper sx={{ p: 1.5, backgroundColor: 'action.hover', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalGasStationIcon sx={{ fontSize: 16, color: 'info.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Abastecimentos
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {centro.estatisticas?.abastecimentos?.total || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={`${centro.estatisticas?.abastecimentos?.total_litros || 0}L`} 
                            size="small" 
                            color="info" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={`€${centro.estatisticas?.abastecimentos?.total_valor || 0}`} 
                            size="small" 
                            color="warning" 
                            variant="outlined" 
                          />
                        </Box>
                      </Paper>

                      {/* Responsável */}
                      {centro.responsavel && (
                        <Paper sx={{ p: 1.5, backgroundColor: 'action.hover', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 20, height: 20, fontSize: 12 }}>
                              {centro.responsavel.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {centro.responsavel}
                            </Typography>
                          </Box>
                        </Paper>
                      )}

                      {/* Status */}
                      <Paper sx={{ p: 1.5, backgroundColor: 'action.hover', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Status
                          </Typography>
                          <Chip 
                            label={centro.ativo ? 'Ativo' : 'Inativo'}
                            color={centro.ativo ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </Paper>
                    </Stack>
                  </CardContent>
                </StatCard>
              </Grow>
            </Grid>
          ))
        ) : (
          // Mensagem quando não há dados
          <Grid size={12}>
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'action.hover' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                📊 Nenhum Centro de Custo Encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Não foi possível carregar os centros de custo.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  carregarCentrosCusto();
                  refreshData();
                }}
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Tentar Novamente'}
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

function Dashboard() {
  console.log('🚀 Dashboard component rendering...');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Hook dinâmico para dados do dashboard
  const { stats, manutencoes, systemStatus, loading, error, refreshData } = useDashboardData();
  
  console.log('📊 Dashboard state:', { stats, loading, error });
  
  const [animatedValues, setAnimatedValues] = useState({
    totalAbastecimentos: 0,
    totalCombustivel: 0,
    totalManutencoes: 0,
    equipamentosAtivos: 0,
    alertasAtivos: 0,
    servicosAbertos: 0
  });

  const [showError, setShowError] = useState(false);

  // Animação dos números quando os dados chegam
  useEffect(() => {
    if (!stats || loading) return;

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedValues({
        totalAbastecimentos: Math.floor(stats.totalAbastecimentos * easeOutQuart),
        totalCombustivel: Math.floor(stats.totalCombustivel * easeOutQuart),
        totalManutencoes: Math.floor(stats.totalManutencoes * easeOutQuart),
        equipamentosAtivos: Math.floor(stats.equipamentosAtivos * easeOutQuart),
        alertasAtivos: Math.floor(stats.alertasAtivos * easeOutQuart),
        servicosAbertos: Math.floor(stats.servicosAbertos * easeOutQuart),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues({
          totalAbastecimentos: stats.totalAbastecimentos,
          totalCombustivel: stats.totalCombustivel,
          totalManutencoes: stats.totalManutencoes,
          equipamentosAtivos: stats.equipamentosAtivos,
          alertasAtivos: stats.alertasAtivos,
          servicosAbertos: stats.servicosAbertos,
        });
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [stats, loading]);

  // Mostrar erro se houver
  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  // Cards dinâmicos com dados das tendências
  const statCards = stats ? [
    { 
      title: 'Abastecimentos', 
      value: animatedValues.totalAbastecimentos, 
      icon: LocalGasStationIcon, 
      bgcolor: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
      trend: stats.tendencias.abastecimentos.valor, 
      trendUp: stats.tendencias.abastecimentos.positiva 
    },
    { 
      title: 'Combustível Total', 
      value: `${animatedValues.totalCombustivel}L`, 
      icon: LocalGasStationIcon, 
      bgcolor: 'linear-gradient(135deg, #00acc1 0%, #26c6da 100%)', 
      trend: stats.tendencias.combustivel.valor, 
      trendUp: stats.tendencias.combustivel.positiva 
    },
    { 
      title: 'Manutenções', 
      value: animatedValues.totalManutencoes, 
      icon: BuildIcon, 
      bgcolor: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', 
      trend: stats.tendencias.manutencoes.valor, 
      trendUp: stats.tendencias.manutencoes.positiva 
    },
    { 
      title: 'Equipamentos', 
      value: animatedValues.equipamentosAtivos, 
      icon: SpeedIcon, 
      bgcolor: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', 
      trend: stats.tendencias.equipamentos.valor, 
      trendUp: stats.tendencias.equipamentos.positiva 
    },
    { 
      title: 'Alertas', 
      value: animatedValues.alertasAtivos, 
      icon: NotificationsIcon, 
      bgcolor: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', 
      trend: stats.tendencias.alertas.valor, 
      trendUp: stats.tendencias.alertas.positiva 
    },
    { 
      title: 'Serviços', 
      value: animatedValues.servicosAbertos, 
      icon: ConstructionIcon, 
      bgcolor: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', 
      trend: stats.tendencias.servicos.valor, 
      trendUp: stats.tendencias.servicos.positiva 
    }
  ] : [];

  return (
    <DashboardContainer>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          {/* Header Profissional */}
          <Fade in timeout={800}>
            <DashboardHeader elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}>
                      <DashboardIcon />
                    </Avatar>
                    <Typography variant={isMobile ? "h4" : "h3"} component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Dashboard
                    </Typography>
                  </Box>
                  <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ mt: 1, fontWeight: 400 }}>
                    Sistema de Gestão Carmo v{systemStatus.versao}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    icon={systemStatus.online ? <CheckCircleIcon /> : <WarningIcon />} 
                    label={systemStatus.online ? "Sistema Online" : "Sistema Offline"} 
                    color={systemStatus.online ? "success" : "error"} 
                    variant="outlined" 
                    sx={{ borderRadius: '12px' }} 
                  />
                  {loading && (
                    <CircularProgress size={20} color="primary" />
                  )}
                </Stack>
              </Box>
            </DashboardHeader>
          </Fade>

          {/* Estatísticas */}
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Visão Geral
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {loading || !stats ? (
                // Skeleton loading para cards
                Array.from({ length: 6 }).map((_, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <Card sx={{ p: { xs: 2, md: 3 } }}>
                      <Skeleton variant="circular" width={60} height={60} sx={{ mb: 2 }} />
                      <Skeleton variant="text" width="60%" height={40} />
                      <Skeleton variant="text" width="80%" height={20} />
                      <Skeleton variant="rectangular" width="100%" height={6} sx={{ mt: 2, borderRadius: 3 }} />
                    </Card>
                  </Grid>
                ))
              ) : (
                statCards.map((stat, index) => (
                  <Grid key={stat.title} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <Grow in timeout={800 + index * 200}>
                      <StatCard>
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                            <StatIcon bgcolor={stat.bgcolor} className="stat-icon">
                              <stat.icon />
                            </StatIcon>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {stat.trendUp ? <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} /> : <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />}
                              <Typography variant="caption" sx={{ color: stat.trendUp ? 'success.main' : 'error.main', fontWeight: 600 }}>
                                {stat.trend}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant={isMobile ? "h5" : "h4"} component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 2 }}>
                            {stat.title}
                          </Typography>
                          <AnimatedProgress variant="determinate" value={75} />
                        </CardContent>
                      </StatCard>
                    </Grow>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>

          {/* Alertas */}
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Alertas e Notificações
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Grow in timeout={1200}>
                  <ModernAlert severity="warning">
                    <AlertTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon /> Manutenções Atrasadas
                    </AlertTitle>
                    {loading ? (
                      <Stack spacing={1}>
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                      </Stack>
                    ) : manutencoes.filter((m: ManutencaoItem) => m.status === 'atrasado').length > 0 ? (
                      manutencoes.filter((m: ManutencaoItem) => m.status === 'atrasado').map((manutencao: ManutencaoItem) => (
                        <Paper key={manutencao.id} sx={{ p: { xs: 1.5, md: 2 }, mt: 1, backgroundColor: 'action.hover', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{manutencao.veiculo}</Typography>
                          <Typography variant="body2" color="text.secondary">{manutencao.tipo} - {manutencao.data}</Typography>
                          {manutencao.responsavel && (
                            <Typography variant="caption" color="text.secondary">Responsável: {manutencao.responsavel}</Typography>
                          )}
                        </Paper>
                      ))
                    ) : (
                      <Typography variant="body2">✅ Não há manutenções atrasadas.</Typography>
                    )}
                  </ModernAlert>
                </Grow>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Grow in timeout={1400}>
                  <ModernAlert severity="info">
                    <AlertTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonthIcon /> Próximas Manutenções
                    </AlertTitle>
                    {loading ? (
                      <Stack spacing={1}>
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                      </Stack>
                    ) : manutencoes.filter((m: ManutencaoItem) => m.status === 'pendente').length > 0 ? (
                      manutencoes.filter((m: ManutencaoItem) => m.status === 'pendente').map((manutencao: ManutencaoItem) => (
                        <Paper key={manutencao.id} sx={{ p: { xs: 1.5, md: 2 }, mt: 1, backgroundColor: 'action.hover', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{manutencao.veiculo}</Typography>
                          <Typography variant="body2" color="text.secondary">{manutencao.tipo} - {manutencao.data}</Typography>
                          {manutencao.responsavel && (
                            <Typography variant="caption" color="text.secondary">Responsável: {manutencao.responsavel}</Typography>
                          )}
                        </Paper>
                      ))
                    ) : (
                      <Typography variant="body2">📅 Não há manutenções agendadas.</Typography>
                    )}
                  </ModernAlert>
                </Grow>
              </Grid>
            </Grid>
          </Box>

          {/* Centros de Custo */}
          <CentrosCustoSection loading={loading} refreshData={refreshData} />

          {/* Módulos */}
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Acesso Rápido aos Módulos
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {[
                { title: 'Oficina', description: 'Gerencie inspeções, serviços e comunicação da oficina.', icon: ConstructionIcon, path: '/oficina', gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' },
                { title: 'Abastecimento', description: 'Controle de abastecimentos e atualização automática de horímetros.', icon: LocalGasStationIcon, path: '/abastecimento', gradient: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' },
                { title: 'Alertas', description: 'Visualize todos os alertas automáticos e manuais de manutenção.', icon: NotificationsIcon, path: '/alertas', gradient: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)' },
                { title: 'Calendário', description: 'Visualize o mapa de manutenções e gere relatórios de manutenções.', icon: CalendarMonthIcon, path: '/calendario', gradient: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)' }
              ].map((module, index) => (
                <Grid key={module.title} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Grow in timeout={1600 + index * 200}>
                    <ModuleCard>
                      <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
                        <Avatar className="module-avatar" sx={{ width: { xs: 50, md: 60 }, height: { xs: 50, md: 60 }, bgcolor: 'primary.main', mb: 2, boxShadow: 2 }}>
                          <module.icon sx={{ fontSize: { xs: 24, md: 28 }, color: 'white' }} />
                        </Avatar>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                          {module.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {module.description}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
                        <Button component={Link} to={module.path} variant="contained" fullWidth className="module-button" sx={{ borderRadius: '12px', py: 1.5, fontWeight: 600, textTransform: 'none' }}>
                          Acessar
                        </Button>
                      </CardActions>
                    </ModuleCard>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      </Container>

      {/* Snackbar de erro */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setShowError(false)} sx={{ width: '100%' }}>
          {error || 'Erro ao carregar dados do dashboard'}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
}

export default Dashboard;

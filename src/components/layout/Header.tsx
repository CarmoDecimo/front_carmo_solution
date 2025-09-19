import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';

interface HeaderProps {
  toggleDrawer: () => void;
}

interface NotificationData {
  id: number;
  tipo: 'manutencao' | 'abastecimento' | 'alerta' | 'sistema';
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  prioridade: 'alta' | 'media' | 'baixa';
}

function Header({ toggleDrawer }: HeaderProps) {
  const { user, logout } = useAuth();
  
  // Estado das notificações
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLButtonElement | null>(null);
  const notificationOpen = Boolean(notificationAnchor);

  const handleLogout = () => {
    logout();
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, lida: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const refreshNotifications = () => {
    fetchNotifications();
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'manutencao': return <BuildIcon sx={{ fontSize: 18 }} />;
      case 'abastecimento': return <LocalGasStationIcon sx={{ fontSize: 18 }} />;
      case 'alerta': return <WarningIcon sx={{ fontSize: 18 }} />;
      default: return <InfoIcon sx={{ fontSize: 18 }} />;
    }
  };

  const getNotificationColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      default: return '#2196f3';
    }
  };

  // Buscar notificações dinâmicas baseadas em dados reais
  const fetchNotifications = async () => {
    try {
      const notifications: NotificationData[] = [];
      let notificationId = 1;

      // 1. Buscar equipamentos com alertas de manutenção
      try {
        const response = await fetch('http://localhost:3001/api/equipamentos/alertas', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          const alertas = result.success ? result.data : [];
          
          // Separar por urgência
          const alertasAtrasados = alertas.filter((alerta: any) => alerta.horas_para_vencer <= 0);
          const alertasUrgentes = alertas.filter((alerta: any) => alerta.horas_para_vencer > 0 && alerta.horas_para_vencer <= 50);
          
          // Notificação para manutenções atrasadas
          if (alertasAtrasados.length > 0) {
            notifications.push({
              id: notificationId++,
              tipo: 'manutencao',
              titulo: 'Manutenções Atrasadas',
              mensagem: `${alertasAtrasados.length} equipamento(s) com manutenção atrasada`,
              data: new Date().toISOString(),
              lida: false,
              prioridade: 'alta'
            });
          }

          // Notificação para manutenções urgentes
          if (alertasUrgentes.length > 0) {
            notifications.push({
              id: notificationId++,
              tipo: 'manutencao',
              titulo: 'Manutenções Urgentes',
              mensagem: `${alertasUrgentes.length} equipamento(s) precisam de manutenção em breve`,
              data: new Date().toISOString(),
              lida: false,
              prioridade: 'media'
            });
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar alertas de manutenção:', error);
      }

      // 2. Buscar estatísticas de abastecimentos para verificar estoque
      try {
        const response = await fetch('http://localhost:3001/api/abastecimentos', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          const abastecimentos = result.success ? result.data : [];
          
          // Calcular total de combustível dos últimos abastecimentos
          const totalCombustivel = abastecimentos.reduce((total: number, abast: any) => {
            return total + (abast.quantidade_combustivel || 0);
          }, 0);

          // Notificação se estoque baixo (menos de 1000L)
          if (totalCombustivel < 1000) {
            notifications.push({
              id: notificationId++,
              tipo: 'abastecimento',
              titulo: 'Estoque de Combustível Baixo',
              mensagem: `Apenas ${totalCombustivel}L disponíveis no sistema`,
              data: new Date().toISOString(),
              lida: false,
              prioridade: 'media'
            });
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar dados de abastecimento:', error);
      }

      // 3. Buscar equipamentos inativos
      try {
        const response = await fetch('http://localhost:3001/api/equipamentos', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          const equipamentos = result.success ? result.data : [];
          
          const equipamentosInativos = equipamentos.filter((eq: any) => 
            eq.status_equipamento === 'inativo' || eq.status_equipamento === 'manutencao'
          );

          // Notificação se muitos equipamentos inativos
          if (equipamentosInativos.length > 3) {
            notifications.push({
              id: notificationId++,
              tipo: 'alerta',
              titulo: 'Equipamentos Inativos',
              mensagem: `${equipamentosInativos.length} equipamentos estão inativos ou em manutenção`,
              data: new Date().toISOString(),
              lida: false,
              prioridade: 'media'
            });
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar equipamentos:', error);
      }

      // 4. Sempre adicionar notificação de sistema online (se não houver problemas críticos)
      const problemasAltos = notifications.filter(n => n.prioridade === 'alta').length;
      if (problemasAltos === 0) {
        notifications.push({
          id: notificationId++,
          tipo: 'sistema',
          titulo: 'Sistema Operacional',
          mensagem: 'Todos os sistemas funcionando normalmente',
          data: new Date().toISOString(),
          lida: false,
          prioridade: 'baixa'
        });
      }

      // Ordenar por prioridade (alta -> média -> baixa) e data
      const prioridadeOrdem = { 'alta': 3, 'media': 2, 'baixa': 1 };
      notifications.sort((a, b) => {
        const prioA = prioridadeOrdem[a.prioridade];
        const prioB = prioridadeOrdem[b.prioridade];
        if (prioA !== prioB) return prioB - prioA;
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });

      setNotifications(notifications);
      console.log('🔔 Notificações dinâmicas carregadas:', notifications);

    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      // Fallback para notificação básica em caso de erro
      setNotifications([{
        id: 1,
        tipo: 'sistema',
        titulo: 'Sistema Online',
        mensagem: 'Sistema funcionando normalmente',
        data: new Date().toISOString(),
        lida: false,
        prioridade: 'baixa'
      }]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Atualizar notificações a cada 5 minutos
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <IconButton
          color="inherit"
          aria-label="abrir menu"
          edge="start"
          onClick={toggleDrawer}
          sx={{ 
            mr: 2,
            display: { xs: 'block', md: 'none' },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {/* Logo e Título */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                width: 40,
                height: 40,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <BusinessIcon sx={{ color: 'white', fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}
              >
                Sistema Carmo
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.75rem',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Gestão de Frotas e Equipamentos
              </Typography>
            </Box>
          </Box>

          {/* Área do Usuário */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user && (
              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <AccountCircleIcon sx={{ color: 'white', fontSize: 18 }} />
                  </Avatar>
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 500, lineHeight: 1 }}>
                      Olá, {(user.nome || user.email || '').split(' ')[0]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', lineHeight: 1 }}>
                      Administrador
                    </Typography>
                  </Box>
                }
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  height: 'auto',
                  py: 0.5,
                  display: { xs: 'none', sm: 'flex' },
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            )}
            
            {/* Botão de Notificações */}
            <IconButton
              onClick={handleNotificationClick}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Badge 
                badgeContent={notifications.filter(n => !n.lida).length} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    minWidth: '18px',
                    height: '18px'
                  }
                }}
              >
                <NotificationsIcon 
                  sx={{ 
                    color: 'white',
                    fontSize: 20
                  }} 
                />
              </Badge>
            </IconButton>
            
            {/* Botão de Logout */}
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                px: 2,
                py: 1,
                color: 'white',
                fontWeight: 500,
                textTransform: 'none',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Sair
            </Button>
            
            {/* Ícone de Logout para mobile */}
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{ 
                display: { xs: 'flex', sm: 'none' },
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
      
      {/* Popover de Notificações */}
      <Popover
        open={notificationOpen}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 1,
          '& .MuiPopover-paper': {
            width: { xs: '90vw', sm: 400 },
            maxWidth: 400,
            maxHeight: 500,
            borderRadius: '16px',
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(33, 33, 33, 0.95) 0%, rgba(66, 66, 66, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(248, 249, 250, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.4)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            background: 'transparent',
            borderRadius: 0
          }}
        >
          {/* Header do Popover */}
          <Box 
            sx={{ 
              p: 2, 
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              Notificações
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {notifications.filter(n => !n.lida).length} não lidas
            </Typography>
          </Box>
          
          {/* Lista de Notificações */}
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <ListItem sx={{ py: 3, textAlign: 'center' }}>
                <ListItemText 
                  primary="Nenhuma notificação"
                  secondary="Você está em dia!"
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            ) : (
              notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    onClick={() => markAsRead(notification.id)}
                    sx={{
                      cursor: 'pointer',
                      py: 2,
                      px: 2,
                      backgroundColor: notification.lida ? 'transparent' : 'rgba(25, 118, 210, 0.05)',
                      borderLeft: `4px solid ${getNotificationColor(notification.prioridade)}`,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: getNotificationColor(notification.prioridade),
                          fontSize: '0.8rem'
                        }}
                      >
                        {getNotificationIcon(notification.tipo)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: notification.lida ? 400 : 600,
                              color: notification.lida ? 'text.secondary' : 'text.primary',
                              fontSize: '0.875rem'
                            }}
                          >
                            {notification.titulo}
                          </Typography>
                          {!notification.lida && (
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: getNotificationColor(notification.prioridade),
                                ml: 1,
                                mt: 0.5
                              }} 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              mb: 0.5,
                              lineHeight: 1.3
                            }}
                          >
                            {notification.mensagem}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.disabled',
                              fontSize: '0.7rem'
                            }}
                          >
                            {new Date(notification.data).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Divider sx={{ mx: 2, opacity: 0.3 }} />
                  )}
                </Box>
              ))
            )}
          </List>
          
          {/* Footer do Popover */}
          {notifications.length > 0 && (
            <Box 
              sx={{ 
                p: 1.5, 
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'rgba(0, 0, 0, 0.02)'
              }}
            >
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button
                  size="small"
                  onClick={markAllAsRead}
                  sx={{ 
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    color: 'primary.main'
                  }}
                >
                  Marcar todas como lidas
                </Button>
                <Button
                  size="small"
                  onClick={refreshNotifications}
                  sx={{ 
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    color: 'secondary.main'
                  }}
                >
                  Atualizar
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>
      </Popover>
    </AppBar>
  );
}

export default Header;

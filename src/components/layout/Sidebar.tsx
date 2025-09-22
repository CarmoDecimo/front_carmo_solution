import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
// Typography removed - not used
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ConstructionIcon from '@mui/icons-material/Construction';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ForumIcon from '@mui/icons-material/Forum';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/auth/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  divider?: boolean;
  subItems?: MenuItem[];
}

const DRAWER_WIDTH = 240;

function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };
  
  // Função para expandir/retrair um item do menu
  const handleToggleExpand = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    setExpandedItems(prev => {
      if (prev.includes(index)) {
        return prev.filter(item => item !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  // Auto-expande o menu quando um subitem está ativo
  useEffect(() => {
    menuItems.forEach((item, index) => {
      if (item.subItems && item.subItems.some(sub => location.pathname === sub.path)) {
        setExpandedItems(prev => {
          if (!prev.includes(index)) {
            return [...prev, index];
          }
          return prev;
        });
      }
    });
  }, [location.pathname]);
  
  const menuItems: MenuItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Centro de custo', icon: <AccountBalanceIcon />, path: '/centro-custo' },
    
    // Módulo 2: Abastecimento (movido para depois do Centro de custo)
    { text: 'Centro de abastecimento', icon: <LocalGasStationIcon />, path: '/abastecimento' },
    
    // Módulo Equipamentos
    { 
      text: 'Equipamentos', 
      icon: <ConstructionIcon />, 
      path: '/equipamentos',
      divider: true,
      subItems: [
        { text: 'Categoria de equipamento', icon: <CategoryIcon />, path: '/categorias' },
        { text: 'Equipamentos', icon: <ConstructionIcon />, path: '/equipamentos' },
      ]
    },
    
    // Módulo 1: Oficina
    { 
      text: 'Oficina', 
      icon: <ConstructionIcon />, 
      path: '/oficina',
      subItems: [
        { text: 'Ficha de Inspeção', icon: <AssignmentIcon />, path: '/oficina/inspecao' },
        { text: 'Ficha de Serviços', icon: <AssignmentIcon />, path: '/oficina/servicos' },
        { text: 'Ficha de Comunicação', icon: <ForumIcon />, path: '/oficina/comunicacao' },
        { text: 'Relatório de Manutenção', icon: <SummarizeIcon />, path: '/oficina/relatorio' },
      ]
    },
    
    // Módulo 4: Calendário de Manutenção
    { 
      text: 'Calendário de Manutenção', 
      icon: <CalendarMonthIcon />, 
      path: '/calendario',
      subItems: [
        { text: 'Mapa de Manutenções', icon: <CalendarMonthIcon />, path: '/calendario/mapa' },
        { text: 'Relatório de Manutenções', icon: <SummarizeIcon />, path: '/calendario/relatorios' },
      ]
    },
    
    // Módulo 3: Alertas (depois do Calendário)
    { text: 'Alertas', icon: <NotificationsActiveIcon />, path: '/alertas' },
    
    // Módulo 5: Gestão de Usuários
    { text: 'Gestão de Usuários', icon: <PeopleIcon />, path: '/usuarios' }
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Toolbar /> {/* Espaço para o cabeçalho */}
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
        <List>
        {menuItems.map((item, index) => {
          const isItemExpanded = expandedItems.includes(index);
          const isActive = location.pathname === item.path;
          const hasActiveChild = item.subItems && item.subItems.some(sub => location.pathname === sub.path);
          
          // O estado de expansão é controlado pelo useEffect no nível do componente
          
          return (
            <React.Fragment key={index}>
              {/* Módulo principal */}
              <ListItem 
                disablePadding 
                sx={{ 
                  color: 'inherit',
                  mt: index > 0 ? 1 : 0, // Espaçamento superior para separar módulos
                  backgroundColor: isActive ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
                }}
              >
                {item.subItems ? (
                  // Para itens com subitens: área clicável dividida
                  <Box sx={{ display: 'flex', width: '100%' }}>
                    {/* Área principal - navega para o módulo */}
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      sx={{ 
                        flex: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(96, 165, 250, 0.05)'
                        }
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: isActive || hasActiveChild ? 'primary.main' : 'text.secondary' 
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        sx={{ 
                          color: isActive || hasActiveChild ? 'primary.main' : 'inherit',
                          fontWeight: 500
                        }}
                      />
                    </ListItemButton>
                    
                    {/* Área do ícone - expande/colapsa */}
                    <Box
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => handleToggleExpand(index, e)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(96, 165, 250, 0.1)'
                        }
                      }}
                    >
                      {isItemExpanded 
                        ? <ExpandMoreIcon sx={{ color: hasActiveChild ? 'primary.main' : 'text.secondary', fontSize: 20 }} />
                        : <ChevronRightIcon sx={{ color: hasActiveChild ? 'primary.main' : 'text.secondary', fontSize: 20 }} />
                      }
                    </Box>
                  </Box>
                ) : (
                  // Para itens sem subitens: comportamento normal
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{ 
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(96, 165, 250, 0.05)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: isActive || hasActiveChild ? 'primary.main' : 'text.secondary' 
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{ 
                        color: isActive || hasActiveChild ? 'primary.main' : 'inherit',
                        fontWeight: 500
                      }}
                    />
                  </ListItemButton>
                )}
              </ListItem>
              
              {/* Subitens com animação de collapse */}
              {item.subItems && (
                <Collapse in={isItemExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem, subIndex) => {
                      const isSubItemActive = location.pathname === subItem.path;
                      return (
                        <ListItem 
                          key={`${index}-${subIndex}`}
                          disablePadding 
                          component={Link} 
                          to={subItem.path}
                          sx={{ 
                            color: 'inherit', 
                            textDecoration: 'none',
                            backgroundColor: isSubItemActive ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
                            pl: 2 // Indentação para submenu
                          }}
                        >
                          <ListItemButton sx={{ 
                            pl: 4,
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: 'rgba(96, 165, 250, 0.05)'
                            }
                          }}>
                            <ListItemIcon sx={{ 
                              color: isSubItemActive ? 'primary.main' : 'text.secondary',
                              minWidth: '40px' // Ícone menor para subitens
                            }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.text} 
                              sx={{ 
                                color: isSubItemActive ? 'primary.main' : 'inherit',
                                '& .MuiTypography-root': { 
                                  fontSize: '0.9rem'  // Texto menor para subitens
                                }
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            
            {/* Divisor opcional */}
            {item.divider && (
              <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
            )}
          </React.Fragment>
          );
        })}
        </List>
      </Box>
      
      {/* Footer com informações do sistema e logout */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: 'divider' }} />
        
        
        {/* Botão de logout */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.main',
              backgroundColor: 'transparent',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'error.main',
                '& .MuiListItemIcon-root': {
                  color: 'error.contrastText'
                },
                '& .MuiListItemText-root': {
                  color: 'error.contrastText'
                }
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: 'error.main',
              transition: 'color 0.2s'
            }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Fazer Logout" 
              sx={{ 
                color: 'error.main',
                transition: 'color 0.2s',
                '& .MuiTypography-root': {
                  fontWeight: 500
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' }, // Mostra em xs, sm e oculta em md+
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
            backgroundColor: 'background.paper',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' }, // Oculta em xs, sm e mostra em md+
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
            backgroundColor: 'background.paper',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default Sidebar;

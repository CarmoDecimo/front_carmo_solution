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
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SpeedIcon from '@mui/icons-material/Speed';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import ConstructionIcon from '@mui/icons-material/Construction';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ForumIcon from '@mui/icons-material/Forum';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
    { text: 'Autenticação', icon: <PersonIcon />, path: '/auth', divider: true },
    
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
    
    // Módulo 2: Abastecimento
    { 
      text: 'Abastecimento', 
      icon: <LocalGasStationIcon />, 
      path: '/abastecimento',
      subItems: [
        { text: 'Controle de Abastecimento', icon: <AssignmentIcon />, path: '/abastecimento/controle' },
        { text: 'Horímetros', icon: <SpeedIcon />, path: '/horimetros' },
      ]
    },
    
    // Módulo 3: Alertas
    { 
      text: 'Alertas', 
      icon: <NotificationsIcon />, 
      path: '/alertas',
      subItems: [
        { text: 'Todos os Alertas', icon: <NotificationsIcon />, path: '/alertas/todos' },
        { text: 'Alertas Automáticos', icon: <NotificationsIcon />, path: '/alertas/automaticos' },
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
    }
  ];

  const drawer = (
    <div>
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
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
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
          display: { xs: 'block', sm: 'none' },
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
          display: { xs: 'none', sm: 'block' },
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

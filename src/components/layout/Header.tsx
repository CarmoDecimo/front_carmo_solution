import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import Box from '@mui/material/Box';
import { useAuth } from '../../contexts/auth/AuthContext';

interface HeaderProps {
  toggleDrawer: () => void;
}

function Header({ toggleDrawer }: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: 'none'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="abrir menu"
          edge="start"
          onClick={toggleDrawer}
          sx={{ 
            mr: 2,
            display: { xs: 'block', md: 'none' } // Só aparece em telas pequenas (xs, sm) e oculta em médias e grandes (md, lg, xl)
          }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
           Carmon Control
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Olá, {user.nome || user.email}
              </Typography>
            )}
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ 
                display: { xs: 'none', sm: 'flex' } // Oculta em telas muito pequenas
              }}
            >
              Sair
            </Button>
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{ 
                display: { xs: 'flex', sm: 'none' } // Só aparece em telas muito pequenas
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  Alert
} from '@mui/material';
import './LoginPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!email) {
      setMessage('Email é obrigatório');
      return;
    }
    
    setLoading(true);
    
    // Simular envio de email de recuperação
    setTimeout(() => {
      setMessage('Se este email estiver cadastrado, você receberá instruções para redefinir sua senha.');
      setLoading(false);
    }, 2000);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="login-logo" 
            />
            <Typography component="h1" variant="h5" fontWeight="bold">
              Recuperar Senha
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Digite seu email para receber instruções de recuperação
            </Typography>
          </Box>

          {message && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Instruções"}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/login">
                <Typography variant="body2" color="primary">
                  Voltar para o login
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} Carmo Solutions. Todos os direitos reservados.
        </Typography>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;

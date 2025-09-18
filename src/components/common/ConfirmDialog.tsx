import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@mui/icons-material';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'error' | 'info';
  loading?: boolean;
  itemDetails?: {
    label: string;
    value: string;
  }[];
  additionalInfo?: string;
  destructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  severity = 'warning',
  loading = false,
  itemDetails = [],
  additionalInfo,
  destructive = false
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <DeleteIcon sx={{ fontSize: 48, color: 'error.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 48, color: 'warning.main' }} />;
      case 'info':
        return <InfoIcon sx={{ fontSize: 48, color: 'info.main' }} />;
      default:
        return <WarningIcon sx={{ fontSize: 48, color: 'warning.main' }} />;
    }
  };

  const getAlertSeverity = () => {
    if (destructive) return 'error';
    return severity;
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getIcon()}
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta ação requer confirmação
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Alert 
          severity={getAlertSeverity()} 
          sx={{ mb: 2 }}
          variant="outlined"
        >
          {message}
        </Alert>

        {itemDetails.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Detalhes do item:
            </Typography>
            <Box sx={{ 
              bgcolor: 'background.default', 
              p: 2, 
              borderRadius: 1, 
              mb: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              {itemDetails.map((detail, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {detail.label}:
                  </Typography>
                  <Chip 
                    label={detail.value} 
                    size="small" 
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}

        {additionalInfo && (
          <>
            <Divider sx={{ my: 2 }} />
            <Alert severity="info" variant="outlined">
              <Typography variant="body2">
                {additionalInfo}
              </Typography>
            </Alert>
          </>
        )}

        {destructive && (
          <Alert severity="error" sx={{ mt: 2 }} variant="filled">
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ⚠️ Esta ação é irreversível e não pode ser desfeita!
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={destructive ? 'error' : severity === 'error' ? 'error' : 'primary'}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Processando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

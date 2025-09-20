import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved ? JSON.parse(saved) : true; // Default to dark mode
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#60a5fa',
      },
      secondary: {
        main: isDarkMode ? '#9fb4d6' : '#6b7280',
      },
      background: {
        default: isDarkMode ? '#0f1724' : '#f8fafc',
        paper: isDarkMode ? '#0b1220' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#e6eef8' : '#1f2937',
        secondary: isDarkMode ? '#9fb4d6' : '#6b7280',
      },
    },
    typography: {
      fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
      h1: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: isDarkMode 
              ? '0 6px 20px rgba(2, 6, 23, 0.6)' 
              : '0 6px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            background: isDarkMode ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.9)',
          }
        }
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              color: isDarkMode ? '#9fb4d6' : '#6b7280',
              fontWeight: 600,
            }
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDarkMode 
              ? '1px dashed rgba(255, 255, 255, 0.02)' 
              : '1px dashed rgba(0, 0, 0, 0.05)',
          }
        }
      }
    },
  });

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
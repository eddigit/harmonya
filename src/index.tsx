import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

// Thème dark apaisant avec palette sombre élégante
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6', // Violet lumineux
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    secondary: {
      main: '#06b6d4', // Cyan moderne
      light: '#67e8f9',
      dark: '#0891b2',
    },
    background: {
      default: '#0f0f23', // Bleu très sombre
      paper: '#1a1a2e', // Bleu sombre pour les cartes
    },
    text: {
      primary: '#e2e8f0', // Blanc cassé
      secondary: '#94a3b8', // Gris clair
    },
    divider: '#334155', // Gris foncé pour les séparateurs
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: '0 4px 14px 0 rgb(139 92 246 / 0.2)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgb(139 92 246 / 0.3)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 32px 0 rgb(0 0 0 / 0.3), 0 0 0 1px rgb(255 255 255 / 0.05)',
          borderRadius: 16,
          border: '1px solid rgba(139, 92, 246, 0.1)',
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(26, 26, 46, 0.95) 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
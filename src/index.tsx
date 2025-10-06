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
      main: '#ffffff', // Blanc pur Tesla
      light: '#f8fafc',
      dark: '#e2e8f0',
    },
    secondary: {
      main: '#64748b', // Gris moderne
      light: '#94a3b8',
      dark: '#475569',
    },
    background: {
      default: '#0a0a0a', // Noir profond Tesla
      paper: '#1a1a1a', // Gris très sombre pour les cartes
    },
    text: {
      primary: '#ffffff', // Blanc pur
      secondary: '#94a3b8', // Gris clair
    },
    divider: '#2d2d2d', // Gris foncé pour les séparateurs
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
          borderRadius: 6,
          padding: '12px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 8,
          border: '1px solid #2d2d2d',
          background: '#1a1a1a',
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
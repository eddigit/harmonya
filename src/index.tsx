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
      main: '#4CA7D8', // Couleur background bouton
    },
    secondary: {
      main: '#FFFFFF', // Texte blanc
    },
    background: {
      default: '#25282F', // Background général
      paper: '#2F353B', // Background des widgets et éléments
    },
    text: {
      primary: '#FFFFFF', // Couleur texte blanc
      secondary: '#CCCCCC', // Texte secondaire plus clair
    },
    divider: '#3A3F45', // Bordures légèrement plus claires
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
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '12px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          background: '#4CA7D8',
          color: '#FFFFFF',
          '&:hover': {
            background: '#3A96C7',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #3A3F45',
          background: '#2F353B',
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
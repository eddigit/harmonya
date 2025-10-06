import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface HeaderProps {
  onFrequencyGuideOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onFrequencyGuideOpen }) => {

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, #1a1d23 0%, #25282f 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid #3A3F45'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        {/* Logo et titre */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2
            }}
          >
            <Box
              component="img"
              src="/logo.svg"
              alt="Harmonya Logo"
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                filter: 'drop-shadow(0 2px 8px rgba(76, 167, 216, 0.3))'
              }}
            />
            <Typography
              variant="h5"
              component="h1"
              sx={{
                color: '#FFFFFF',
                fontFamily: 'Comfortaa, Poppins, Inter, sans-serif',
                fontWeight: 500,
                letterSpacing: '0.5px',
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                textShadow: '0 2px 8px rgba(76, 167, 216, 0.3)'
              }}
            >
              Harmonya
            </Typography>
          </Box>
        </motion.div>

        {/* Bouton Guide des Fréquences */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button
            onClick={onFrequencyGuideOpen}
            startIcon={<InfoIcon />}
            sx={{
              color: '#4CA7D8',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              px: { xs: 2, sm: 3 },
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(76, 167, 216, 0.1)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              Guide des Fréquences
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              Guide
            </Box>
          </Button>
        </motion.div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
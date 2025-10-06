import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  LinearProgress,
  Grid,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PerformanceMetrics } from '../hooks/usePerformanceOptimization';

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  warnings: string[];
  recommendations: string[];
  isOptimizing: boolean;
  onOptimizeMemory: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  metrics,
  warnings,
  recommendations,
  isOptimizing,
  onOptimizeMemory
}) => {
  const formatFileSize = (sizeMB: number) => {
    if (sizeMB < 1) {
      return `${(sizeMB * 1024).toFixed(1)} KB`;
    }
    return `${sizeMB.toFixed(1)} MB`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const getMemoryStatus = () => {
    if (metrics.memoryUsage < 100) return { color: '#4caf50', label: 'Optimal' };
    if (metrics.memoryUsage < 300) return { color: '#ff9800', label: 'Modéré' };
    return { color: '#f44336', label: 'Élevé' };
  };

  const getWarningMessage = (warning: string) => {
    switch (warning) {
      case 'large-file':
        return 'Fichier volumineux détecté - Le traitement peut être plus lent';
      case 'very-large-file':
        return 'Fichier très volumineux - Risque de problèmes de performance';
      case 'high-memory':
        return 'Utilisation mémoire élevée - Considérez optimiser';
      default:
        return warning;
    }
  };

  const memoryStatus = getMemoryStatus();

  return (
    <Box>
      {/* Alertes de performance */}
      {warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {warnings.map((warning, index) => (
            <Alert 
              key={warning}
              severity={warning.includes('very-large') ? 'error' : 'warning'}
              sx={{ mb: 2 }}
              icon={<WarningIcon />}
            >
              {getWarningMessage(warning)}
            </Alert>
          ))}
        </motion.div>
      )}

      {/* Métriques de performance */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ mr: 2, color: '#64b5f6' }} />
              <Typography variant="h6" sx={{ color: '#fff' }}>
                Métriques de Performance
              </Typography>
            </Box>
            
            <Tooltip title="Optimiser la mémoire">
              <IconButton
                onClick={onOptimizeMemory}
                sx={{ 
                  color: '#64b5f6',
                  '&:hover': { backgroundColor: 'rgba(100, 181, 246, 0.1)' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={3}>
            {/* Utilisation mémoire */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <MemoryIcon sx={{ fontSize: 40, color: memoryStatus.color, mb: 1 }} />
                <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                  {metrics.memoryUsage.toFixed(1)} MB
                </Typography>
                <Typography variant="body2" sx={{ color: memoryStatus.color, mb: 2 }}>
                  Mémoire - {memoryStatus.label}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((metrics.memoryUsage / 500) * 100, 100)}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: memoryStatus.color
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Taille du fichier */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <StorageIcon sx={{ fontSize: 40, color: '#64b5f6', mb: 1 }} />
                <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                  {formatFileSize(metrics.fileSize)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64b5f6', mb: 2 }}>
                  Taille du fichier
                </Typography>
                <Chip
                  label={metrics.isLargeFile ? 'Gros fichier' : 'Taille normale'}
                  color={metrics.isLargeFile ? 'warning' : 'success'}
                  size="small"
                />
              </Box>
            </Grid>

            {/* Temps de traitement */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <SpeedIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                  {metrics.processingTime > 0 
                    ? formatTime(metrics.processingTime)
                    : formatTime(metrics.estimatedProcessingTime)
                  }
                </Typography>
                <Typography variant="body2" sx={{ color: '#4caf50', mb: 2 }}>
                  {metrics.processingTime > 0 ? 'Temps écoulé' : 'Temps estimé'}
                </Typography>
                {isOptimizing && (
                  <LinearProgress
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Informations techniques */}
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <strong>Chunk Size Recommandé:</strong> {metrics.recommendedChunkSize} MB
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <strong>Statut:</strong> {isOptimizing ? 'En cours d\'optimisation' : 'Prêt'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Recommandations */}
      {recommendations.length > 0 && (
        <Card sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon sx={{ mr: 2, color: '#64b5f6' }} />
              <Typography variant="h6" sx={{ color: '#fff' }}>
                Recommandations
              </Typography>
            </Box>
            
            <List dense>
              {recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={recommendation}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '0.9rem'
                        }
                      }}
                    />
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PerformanceMonitor;
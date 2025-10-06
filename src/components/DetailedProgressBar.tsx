import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  Grid
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Analytics as AnalyzeIcon,
  Tune as ProcessIcon,
  Download as ExportIcon,
  CheckCircle as CompleteIcon,
  RadioButtonUnchecked as PendingIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

export interface ProgressStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress?: number;
  duration?: number;
  icon?: React.ReactNode;
}

interface DetailedProgressBarProps {
  steps: ProgressStep[];
  currentStep: string;
  overallProgress: number;
  title?: string;
  subtitle?: string;
  showTimeEstimate?: boolean;
  estimatedTimeRemaining?: number;
}

const DetailedProgressBar: React.FC<DetailedProgressBarProps> = ({
  steps,
  currentStep,
  overallProgress,
  title = "Traitement en cours",
  subtitle,
  showTimeEstimate = true,
  estimatedTimeRemaining
}) => {
  const getStepIcon = (step: ProgressStep) => {
    if (step.icon) return step.icon;
    
    switch (step.id) {
      case 'upload': return <UploadIcon />;
      case 'analyze': return <AnalyzeIcon />;
      case 'process': return <ProcessIcon />;
      case 'export': return <ExportIcon />;
      default: return <PendingIcon />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CompleteIcon sx={{ color: '#4CAF50' }} />;
      case 'active': return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <ProcessIcon sx={{ color: '#4CA7D8' }} />
        </motion.div>
      );
      case 'error': return <CompleteIcon sx={{ color: '#F44336' }} />;
      default: return <PendingIcon sx={{ color: '#666' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'active': return '#4CA7D8';
      case 'error': return '#F44336';
      default: return '#666';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const activeStep = steps.find(step => step.id === currentStep);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        sx={{ 
          background: 'linear-gradient(135deg, #2F353B 0%, #25282F 100%)',
          border: '1px solid #3A3F45',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 1 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Barre de progression globale */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 500 }}>
                Progression globale
              </Typography>
              <Typography variant="body2" sx={{ color: '#4CA7D8', fontWeight: 600 }}>
                {Math.round(overallProgress)}%
              </Typography>
            </Box>
            
            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={overallProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#3A3F45',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #4CA7D8 0%, #5BB3E0 50%, #6BC5E8 100%)',
                    borderRadius: 4,
                  }
                }}
              />
              
              {/* Animation de brillance */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '30px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  borderRadius: 4,
                }}
                animate={{
                  x: [-30, overallProgress * 3, -30]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </Box>
          </Box>

          {/* Estimation du temps */}
          {showTimeEstimate && estimatedTimeRemaining && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Chip
                label={`Temps restant estimé: ${formatTime(estimatedTimeRemaining)}`}
                size="small"
                sx={{
                  backgroundColor: '#3A3F45',
                  color: '#4CA7D8',
                  fontWeight: 500
                }}
              />
            </Box>
          )}

          {/* Étapes détaillées */}
          <Grid container spacing={2}>
            {steps.map((step, index) => (
              <Grid item xs={12} key={step.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: step.status === 'active' ? 'rgba(76, 167, 216, 0.1)' : 'transparent',
                      border: step.status === 'active' ? '1px solid #4CA7D8' : '1px solid transparent',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Icône de statut */}
                    <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                      {getStatusIcon(step.status)}
                    </Box>

                    {/* Contenu de l'étape */}
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: step.status === 'active' ? '#4CA7D8' : '#FFFFFF',
                          fontWeight: step.status === 'active' ? 600 : 400,
                          mb: 0.5
                        }}
                      >
                        {step.label}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mb: step.status === 'active' && step.progress !== undefined ? 1 : 0 }}
                      >
                        {step.description}
                      </Typography>

                      {/* Barre de progression de l'étape */}
                      {step.status === 'active' && step.progress !== undefined && (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Progression de l'étape
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#4CA7D8', fontWeight: 600 }}>
                              {Math.round(step.progress)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={step.progress}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: '#3A3F45',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#4CA7D8',
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Box>
                      )}

                      {/* Durée de l'étape */}
                      {step.duration && step.status === 'completed' && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Terminé en {formatTime(step.duration)}
                        </Typography>
                      )}
                    </Box>

                    {/* Icône de l'étape */}
                    <Box sx={{ ml: 2, opacity: 0.7 }}>
                      {getStepIcon(step)}
                    </Box>
                  </Box>
                </motion.div>

                {/* Connecteur entre les étapes */}
                {index < steps.length - 1 && (
                  <Box
                    sx={{
                      width: 2,
                      height: 20,
                      backgroundColor: step.status === 'completed' ? '#4CAF50' : '#3A3F45',
                      ml: 3,
                      my: 0.5,
                      transition: 'background-color 0.3s ease'
                    }}
                  />
                )}
              </Grid>
            ))}
          </Grid>

          {/* Étape actuelle en détail */}
          <AnimatePresence>
            {activeStep && activeStep.status === 'active' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(76, 167, 216, 0.05)',
                    border: '1px solid rgba(76, 167, 216, 0.2)'
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#4CA7D8', fontWeight: 600, mb: 1 }}>
                    🔄 En cours: {activeStep.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeStep.description}
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DetailedProgressBar;
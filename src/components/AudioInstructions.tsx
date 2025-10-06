import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Equalizer as EqualizerIcon,
  VolumeUp as VolumeIcon,
  Tune as TuneIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lightbulb as TipIcon,
  MusicNote as MusicIcon,
  Headset as HeadsetIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface AudioInstructionsProps {
  currentTab: number;
  onTabChange: (tab: number) => void;
  equalizerEnabled: boolean;
  hasAudioFile: boolean;
}

const AudioInstructions: React.FC<AudioInstructionsProps> = ({
  currentTab,
  onTabChange,
  equalizerEnabled,
  hasAudioFile
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showTips, setShowTips] = useState(false);

  const steps = [
    {
      label: 'Chargez votre fichier audio',
      description: 'Commencez par importer un fichier audio (MP3, WAV, etc.)',
      action: 'Retour à l\'upload',
      completed: hasAudioFile,
      icon: <MusicIcon />,
      tab: -1
    },
    {
      label: 'Activez l\'égaliseur',
      description: 'Rendez-vous dans l\'onglet Égaliseur et activez le traitement audio',
      action: 'Aller à l\'Égaliseur',
      completed: equalizerEnabled,
      icon: <EqualizerIcon />,
      tab: 1
    },
    {
      label: 'Testez la lecture',
      description: 'Lancez la lecture pour entendre les modifications en temps réel',
      action: 'Aller à la Prévisualisation',
      completed: false,
      icon: <PlayIcon />,
      tab: 0
    },
    {
      label: 'Ajustez les paramètres',
      description: 'Modifiez les bandes de fréquences et le volume selon vos préférences',
      action: 'Personnaliser',
      completed: false,
      icon: <TuneIcon />,
      tab: 1
    }
  ];

  const tips = [
    {
      title: 'Utilisez des écouteurs',
      description: 'Pour une meilleure expérience, utilisez un casque ou des écouteurs de qualité',
      icon: <HeadsetIcon />
    },
    {
      title: 'Commencez doucement',
      description: 'Commencez avec des ajustements légers (±3 dB) puis augmentez progressivement',
      icon: <VolumeIcon />
    },
    {
      title: 'Testez les préréglages',
      description: 'Essayez les préréglages (Rock, Pop, Jazz) comme point de départ',
      icon: <EqualizerIcon />
    },
    {
      title: 'Écoutez en boucle',
      description: 'Répétez la même section pour mieux percevoir les changements',
      icon: <PlayIcon />
    }
  ];

  const handleStepClick = (step: number) => {
    setActiveStep(step);
    const targetTab = steps[step].tab;
    if (targetTab >= 0) {
      onTabChange(targetTab);
    }
  };

  const getStepStatus = (step: typeof steps[0]) => {
    if (step.completed) return 'completed';
    if (steps.indexOf(step) === activeStep) return 'active';
    return 'pending';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid #3A3F45',
        mb: 3
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
              <TipIcon sx={{ mr: 1, color: '#64b5f6' }} />
              Guide d'utilisation
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowTips(!showTips)}
              endIcon={showTips ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ 
                color: '#64b5f6', 
                borderColor: '#64b5f6',
                '&:hover': { backgroundColor: 'rgba(100, 181, 246, 0.1)' }
              }}
            >
              Conseils
            </Button>
          </Box>

          {/* Conseils dépliables */}
          <Collapse in={showTips}>
            <Alert severity="info" sx={{ mb: 3, backgroundColor: 'rgba(100, 181, 246, 0.1)' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                💡 Conseils pour une meilleure expérience :
              </Typography>
              <List dense>
                {tips.map((tip, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {React.cloneElement(tip.icon, { sx: { color: '#64b5f6', fontSize: 20 } })}
                    </ListItemIcon>
                    <ListItemText
                      primary={tip.title}
                      secondary={tip.description}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Alert>
          </Collapse>

          {/* Étapes */}
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label} completed={step.completed}>
                <StepLabel
                  icon={
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: step.completed 
                          ? '#4caf50' 
                          : index === activeStep 
                            ? '#64b5f6' 
                            : '#3A3F45',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => handleStepClick(index)}
                    >
                      {step.completed ? <CheckIcon /> : step.icon}
                    </Box>
                  }
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: '#fff',
                      fontWeight: step.completed ? 'bold' : 'normal'
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: '#fff' }}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                    {step.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {step.tab >= 0 && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => onTabChange(step.tab)}
                        sx={{
                          backgroundColor: '#64b5f6',
                          '&:hover': { backgroundColor: '#42a5f5' }
                        }}
                      >
                        {step.action}
                      </Button>
                    )}
                    
                    <Chip
                      label={getStepStatus(step)}
                      size="small"
                      color={step.completed ? 'success' : index === activeStep ? 'primary' : 'default'}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {/* CTA principal */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(100, 181, 246, 0.1)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: '#64b5f6', mb: 1 }}>
              🎵 Prêt à commencer ?
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
              {!hasAudioFile 
                ? "Commencez par charger un fichier audio pour découvrir les fonctionnalités de l'égaliseur."
                : !equalizerEnabled
                  ? "Activez l'égaliseur pour commencer à modifier votre audio en temps réel."
                  : "Parfait ! Vous pouvez maintenant ajuster les paramètres et écouter les modifications."
              }
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {!hasAudioFile ? (
                <Button
                  variant="contained"
                  startIcon={<MusicIcon />}
                  onClick={() => window.history.back()}
                  sx={{ backgroundColor: '#64b5f6' }}
                >
                  Charger un fichier
                </Button>
              ) : !equalizerEnabled ? (
                <Button
                  variant="contained"
                  startIcon={<EqualizerIcon />}
                  onClick={() => onTabChange(1)}
                  sx={{ backgroundColor: '#64b5f6' }}
                >
                  Activer l'égaliseur
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={() => onTabChange(0)}
                    sx={{ backgroundColor: '#4caf50' }}
                  >
                    Écouter
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TuneIcon />}
                    onClick={() => onTabChange(1)}
                    sx={{ 
                      color: '#64b5f6', 
                      borderColor: '#64b5f6',
                      '&:hover': { backgroundColor: 'rgba(100, 181, 246, 0.1)' }
                    }}
                  >
                    Ajuster
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AudioInstructions;
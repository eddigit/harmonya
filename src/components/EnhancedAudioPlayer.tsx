import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Slider,
  Chip,
  LinearProgress,
  Alert,
  Button
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
  GraphicEq as WaveIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AudioFile } from '../types';
import { formatTime } from '../utils/polyfills';
import { useAudioProcessor } from '../hooks/useAudioProcessor';
import { EqualizerBand } from './AudioEqualizer';

interface EnhancedAudioPlayerProps {
  audioFile: AudioFile;
  title?: string;
  subtitle?: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  equalizerBands: EqualizerBand[];
  equalizerEnabled: boolean;
  showInstructions?: boolean;
}

const EnhancedAudioPlayer: React.FC<EnhancedAudioPlayerProps> = ({ 
  audioFile, 
  title = "Lecteur Audio Avancé",
  subtitle,
  volume,
  onVolumeChange,
  muted,
  onMutedChange,
  equalizerBands,
  equalizerEnabled,
  showInstructions = false
}) => {
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showHelp, setShowHelp] = useState(showInstructions);

  const {
    state,
    loadAudioFile,
    play,
    pause,
    stop,
    seek,
    setVolume,
    setMuted,
    applyEqualizer
  } = useAudioProcessor({
    onTimeUpdate: (time) => {
      // Optionnel: callback pour les mises à jour de temps
    },
    onEnded: () => {
      console.log('Lecture terminée');
    },
    onError: (error) => {
      console.error('Erreur audio:', error);
    }
  });

  // Charger le fichier audio au montage
  useEffect(() => {
    if (audioFile?.file) {
      loadAudioFile(audioFile.file);
    }
  }, [audioFile?.file, audioFile?.name]); // Dépendances spécifiques

  // Synchroniser le volume avec les props
  useEffect(() => {
    const targetVolume = volume / 100;
    if (Math.abs(state.volume - targetVolume) > 0.01) {
      setVolume(targetVolume);
    }
  }, [volume, state.volume]); // Inclure state.volume pour éviter les boucles

  // Synchroniser le mode muet avec les props
  useEffect(() => {
    if (state.muted !== muted) {
      setMuted(muted);
    }
  }, [muted, state.muted]); // Inclure state.muted pour éviter les boucles

  // Appliquer l'égaliseur quand les bandes changent
  useEffect(() => {
    if (equalizerEnabled) {
      applyEqualizer(equalizerBands);
    } else {
      // Réinitialiser l'égaliseur
      const resetBands = equalizerBands.map(band => ({ ...band, gain: 0 }));
      applyEqualizer(resetBands);
    }
  }, [equalizerBands, equalizerEnabled]); // Retirer applyEqualizer des dépendances

  const togglePlay = async () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }

    try {
      if (state.isPlaying) {
        pause();
      } else {
        await play();
      }
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
    }
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      seek(newValue);
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      onVolumeChange(newValue * 100);
    }
  };

  const toggleMute = () => {
    onMutedChange(!muted);
  };

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Instructions d'utilisation */}
      {showHelp && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setShowHelp(false)}
            >
              Compris
            </Button>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            🎵 Comment utiliser l'égaliseur :
          </Typography>
          <Typography variant="body2" component="div">
            1. <strong>Activez l'égaliseur</strong> dans l'onglet "Égaliseur"<br/>
            2. <strong>Ajustez les bandes de fréquences</strong> selon vos préférences<br/>
            3. <strong>Utilisez les préréglages</strong> (Rock, Pop, Jazz, etc.) pour des effets rapides<br/>
            4. <strong>Lancez la lecture</strong> pour entendre les modifications en temps réel<br/>
            5. <strong>Modifiez le volume</strong> et testez différents réglages
          </Typography>
        </Alert>
      )}

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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WaveIcon sx={{ color: '#4CA7D8', mr: 1 }} />
              <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                {title}
              </Typography>
            </Box>
            
            <IconButton
              onClick={() => setShowHelp(!showHelp)}
              sx={{ color: '#4CA7D8' }}
              size="small"
            >
              <InfoIcon />
            </IconButton>
          </Box>

          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {subtitle}
            </Typography>
          )}

          {/* Statut de l'égaliseur */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            <Chip 
              label={audioFile.name} 
              size="small" 
              sx={{ 
                backgroundColor: '#3A3F45', 
                color: '#FFFFFF',
                maxWidth: '200px'
              }} 
            />
            <Chip 
              label={formatTime(state.duration || audioFile.duration)} 
              size="small" 
              sx={{ backgroundColor: '#4CA7D8', color: '#FFFFFF' }} 
            />
            <Chip 
              label={`${audioFile.bpm} BPM`} 
              size="small" 
              sx={{ backgroundColor: '#5BB3E0', color: '#FFFFFF' }} 
            />
            <Chip 
              label={audioFile.key} 
              size="small" 
              sx={{ backgroundColor: '#6BC5E8', color: '#FFFFFF' }} 
            />
            <Chip 
              label={equalizerEnabled ? "Égaliseur ON" : "Égaliseur OFF"} 
              size="small" 
              sx={{ 
                backgroundColor: equalizerEnabled ? '#4caf50' : '#f44336', 
                color: '#FFFFFF' 
              }} 
            />
          </Box>

          {/* Message d'interaction utilisateur */}
          {!hasUserInteracted && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Cliquez sur lecture pour activer le traitement audio en temps réel
            </Alert>
          )}

          {/* Contrôles de lecture */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <motion.div whileTap={{ scale: 0.95 }}>
              <IconButton
                onClick={togglePlay}
                disabled={state.isLoading}
                sx={{
                  backgroundColor: '#4CA7D8',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#3A96C7',
                    transform: 'scale(1.05)'
                  },
                  '&:disabled': {
                    backgroundColor: '#555',
                    color: '#888'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {state.isLoading ? (
                  <LinearProgress />
                ) : state.isPlaying ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon />
                )}
              </IconButton>
            </motion.div>

            <IconButton
              onClick={stop}
              sx={{ color: '#4CA7D8' }}
            >
              <StopIcon />
            </IconButton>

            {/* Barre de progression */}
            <Box sx={{ flex: 1, mx: 2 }}>
              <Slider
                value={state.currentTime}
                max={state.duration || audioFile.duration}
                onChange={handleSeek}
                sx={{
                  color: '#4CA7D8',
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#4CA7D8',
                    '&:hover': {
                      boxShadow: '0 0 0 8px rgba(76, 167, 216, 0.16)'
                    }
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#4CA7D8'
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: '#3A3F45'
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(state.currentTime)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(state.duration || audioFile.duration)}
                </Typography>
              </Box>
            </Box>

            {/* Contrôles de volume */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
              <IconButton
                onClick={toggleMute}
                size="small"
                sx={{ color: '#4CA7D8' }}
              >
                {muted || volume === 0 ? <VolumeOffIcon /> : <VolumeIcon />}
              </IconButton>
              <Slider
                value={muted ? 0 : volume}
                max={100}
                onChange={handleVolumeChange}
                sx={{
                  color: '#4CA7D8',
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#4CA7D8'
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#4CA7D8'
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: '#3A3F45'
                  }
                }}
              />
            </Box>
          </Box>

          {/* Barre de progression visuelle */}
          <Box sx={{ position: 'relative', height: 4, backgroundColor: '#3A3F45', borderRadius: 2 }}>
            <motion.div
              style={{
                height: '100%',
                background: equalizerEnabled 
                  ? 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)'
                  : 'linear-gradient(90deg, #4CA7D8 0%, #5BB3E0 100%)',
                borderRadius: 2,
                width: `${progress}%`
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedAudioPlayer;
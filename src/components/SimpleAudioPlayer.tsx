import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Slider,
  Chip,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AudioFile } from '../types';
import { formatTime } from '../utils/polyfills';

interface SimpleAudioPlayerProps {
  audioFile: AudioFile;
  title?: string;
  subtitle?: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  equalizerEnabled: boolean;
  showInstructions?: boolean;
}

const SimpleAudioPlayer: React.FC<SimpleAudioPlayerProps> = ({ 
  audioFile, 
  title = "Lecteur Audio",
  subtitle,
  volume,
  onVolumeChange,
  muted,
  onMutedChange,
  equalizerEnabled,
  showInstructions = false
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Charger le fichier audio
  useEffect(() => {
    if (audioFile?.file && audioRef.current) {
      setIsLoading(true);
      const url = URL.createObjectURL(audioFile.file);
      audioRef.current.src = url;
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioFile?.file]);

  // Synchroniser le volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume / 100;
    }
  }, [volume, muted]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number' && audioRef.current) {
      const seekTime = (newValue / 100) * duration;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      onVolumeChange(newValue);
    }
  };

  const toggleMute = () => {
    onMutedChange(!muted);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Audio HTML5 caché */}
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Instructions d'utilisation */}
      {showInstructions && (
        <Alert 
          severity="info" 
          sx={{ mb: 2, backgroundColor: 'rgba(100, 181, 246, 0.1)' }}
        >
          <Typography variant="body2">
            💡 <strong>Conseil :</strong> {equalizerEnabled 
              ? "L'égaliseur est activé ! Ajustez les bandes de fréquences pour modifier le son."
              : "Activez l'égaliseur dans l'onglet correspondant pour modifier le son en temps réel."
            }
          </Typography>
        </Alert>
      )}

      <Card sx={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid #3A3F45'
      }}>
        <CardContent>
          {/* En-tête */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#fff' }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            <Chip
              label={equalizerEnabled ? "Égaliseur ON" : "Égaliseur OFF"}
              color={equalizerEnabled ? "success" : "default"}
              size="small"
            />
          </Box>

          {/* Informations du fichier */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              📁 {audioFile.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Durée: {formatTime(duration)} • 
              {audioFile.bpm && ` BPM: ${audioFile.bpm} •`}
              {audioFile.key && ` Tonalité: ${audioFile.key}`}
            </Typography>
          </Box>

          {/* Contrôles de lecture */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <IconButton
              onClick={togglePlay}
              disabled={isLoading}
              sx={{ 
                color: '#64b5f6',
                '&:hover': { backgroundColor: 'rgba(100, 181, 246, 0.1)' }
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            
            <IconButton
              onClick={handleStop}
              disabled={isLoading}
              sx={{ 
                color: '#64b5f6',
                '&:hover': { backgroundColor: 'rgba(100, 181, 246, 0.1)' }
              }}
            >
              <StopIcon />
            </IconButton>

            <Box sx={{ flex: 1, mx: 2 }}>
              <Slider
                value={progress}
                onChange={handleSeek}
                disabled={isLoading}
                sx={{
                  color: '#64b5f6',
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#64b5f6',
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#64b5f6',
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {formatTime(duration)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Contrôles de volume */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={toggleMute}
              sx={{ 
                color: muted ? '#f44336' : '#64b5f6',
                '&:hover': { backgroundColor: 'rgba(100, 181, 246, 0.1)' }
              }}
            >
              {muted ? <VolumeOffIcon /> : <VolumeIcon />}
            </IconButton>
            
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={100}
              sx={{
                width: 100,
                color: '#64b5f6',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#64b5f6',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#64b5f6',
                }
              }}
            />
            
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', minWidth: 35 }}>
              {muted ? '0%' : `${Math.round(volume)}%`}
            </Typography>
          </Box>

          {isLoading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Chargement de l'audio...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SimpleAudioPlayer;
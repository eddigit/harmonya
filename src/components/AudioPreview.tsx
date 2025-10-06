import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Slider,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
  GraphicEq as WaveIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AudioFile } from '../types';
import { formatTime } from '../utils/polyfills';

interface AudioPreviewProps {
  audioFile: AudioFile;
  title?: string;
  subtitle?: string;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({ 
  audioFile, 
  title = "Aperçu Audio",
  subtitle 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrl = useRef<string | null>(null);

  useEffect(() => {
    if (audioFile?.file) {
      // Créer l'URL pour le fichier audio
      audioUrl.current = URL.createObjectURL(audioFile.file);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl.current;
        audioRef.current.volume = volume;
      }
    }

    return () => {
      // Nettoyer l'URL quand le composant est démonté
      if (audioUrl.current) {
        URL.revokeObjectURL(audioUrl.current);
      }
    };
  }, [audioFile]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

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
      console.error('Erreur lors de la lecture audio:', error);
    }
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    if (audioRef.current && typeof newValue === 'number') {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setVolume(newValue);
      if (audioRef.current) {
        audioRef.current.volume = newValue;
      }
      if (newValue === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const progress = audioFile.duration > 0 ? (currentTime / audioFile.duration) * 100 : 0;

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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WaveIcon sx={{ color: '#4CA7D8', mr: 1 }} />
            <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>

          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {subtitle}
            </Typography>
          )}

          {/* Informations du fichier */}
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
              label={formatTime(audioFile.duration)} 
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
          </Box>

          {/* Contrôles de lecture */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <motion.div whileTap={{ scale: 0.95 }}>
              <IconButton
                onClick={togglePlay}
                disabled={isLoading}
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
                {isLoading ? (
                  <LinearProgress size={24} />
                ) : isPlaying ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon />
                )}
              </IconButton>
            </motion.div>

            {/* Barre de progression */}
            <Box sx={{ flex: 1, mx: 2 }}>
              <Slider
                value={currentTime}
                max={audioFile.duration}
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
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(audioFile.duration)}
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
                {isMuted || volume === 0 ? <VolumeOffIcon /> : <VolumeIcon />}
              </IconButton>
              <Slider
                value={isMuted ? 0 : volume}
                max={1}
                step={0.1}
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
                background: 'linear-gradient(90deg, #4CA7D8 0%, #5BB3E0 100%)',
                borderRadius: 2,
                width: `${progress}%`
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </Box>
        </CardContent>

        {/* Audio element caché */}
        <audio ref={audioRef} preload="metadata" />
      </Card>
    </motion.div>
  );
};

export default AudioPreview;
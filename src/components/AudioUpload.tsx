import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Chip,
  Grid
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AudioFile as AudioFileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AudioFile, ProcessingStatus } from '../types';
import { formatTime, getObjectValues } from '../utils/polyfills';
import { usePerformanceOptimization } from '../hooks/usePerformanceOptimization';
import PerformanceMonitor from './PerformanceMonitor';

interface AudioUploadProps {
  onFileUpload: (file: AudioFile) => void;
  processingStatus: ProcessingStatus;
}

const ACCEPTED_FORMATS = {
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/flac': ['.flac'],
  'audio/aac': ['.aac'],
  'audio/x-m4a': ['.m4a']
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_DURATION = 10 * 60; // 10 minutes

const AudioUpload: React.FC<AudioUploadProps> = ({ onFileUpload, processingStatus }) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Hook d'optimisation des performances
  const {
    metrics,
    warnings,
    isOptimizing,
    analyzeFile,
    optimizeMemory,
    getRecommendations
  } = usePerformanceOptimization({
    maxFileSize: 100, // 100 MB
    enableMemoryMonitoring: true,
    enableProgressiveLoading: true
  });

  const analyzeAudioFile = async (file: File): Promise<AudioFile> => {
    // Analyser les performances du fichier
    const performanceMetrics = analyzeFile(file);
    
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        
        if (duration > MAX_DURATION) {
          reject(new Error(`La durée du fichier (${Math.round(duration / 60)} min) dépasse la limite de 10 minutes`));
          return;
        }

        // Simulation de l'analyse BPM (en réalité, cela serait fait côté serveur)
        const estimatedBPM = Math.floor(Math.random() * (140 - 60) + 60);
        
        const audioFile: AudioFile = {
          file,
          name: file.name,
          duration,
          size: file.size,
          format: file.type,
          bpm: estimatedBPM,
          key: 'C' // Simulation de détection de tonalité
        };

        resolve(audioFile);
        URL.revokeObjectURL(url);
      });

      audio.addEventListener('error', () => {
        reject(new Error('Impossible de lire le fichier audio'));
        URL.revokeObjectURL(url);
      });

      audio.src = url;
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadError(null);
    
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validation de la taille
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`Le fichier est trop volumineux (${Math.round(file.size / 1024 / 1024)} MB). Limite : 100 MB`);
      return;
    }

    try {
      setIsAnalyzing(true);
      const audioFile = await analyzeAudioFile(file);
      onFileUpload(audioFile);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Erreur lors de l\'analyse du fichier');
    } finally {
      setIsAnalyzing(false);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxFiles: 1,
    multiple: false
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };



  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom align="center" color="primary">
        Upload de votre fichier audio
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Glissez-déposez votre fichier audio ou cliquez pour le sélectionner
      </Typography>

      {/* Zone de drop améliorée */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        animate={{
          borderColor: isDragActive ? '#4CA7D8' : isDragReject ? '#f44336' : '#3A3F45'
        }}
        transition={{ duration: 0.2 }}
      >
        <Card
          {...getRootProps()}
          sx={{
            p: 6,
            textAlign: 'center',
            cursor: 'pointer',
            border: '3px dashed',
            borderColor: isDragActive 
              ? 'primary.main' 
              : isDragReject 
                ? 'error.main' 
                : '#3A3F45',
            borderRadius: 4,
            backgroundColor: isDragActive 
              ? 'primary.50' 
              : isDragReject 
                ? 'error.50' 
                : 'background.paper',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.50'
            }
          }}
        >
          <input {...getInputProps()} />
          
          <motion.div
            animate={{ 
              scale: isDragActive ? 1.1 : 1,
              rotate: isDragActive ? 5 : 0 
            }}
            transition={{ duration: 0.2 }}
          >
            <CloudUploadIcon 
              sx={{ 
                fontSize: 64, 
                color: isDragActive ? 'primary.main' : isDragReject ? 'error.main' : '#4CA7D8',
                mb: 2,
                filter: 'drop-shadow(0 4px 8px rgba(76, 167, 216, 0.3))'
              }} 
            />
          </motion.div>
          
          {isDragActive ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
                🎵 Déposez le fichier ici...
              </Typography>
            </motion.div>
          ) : isDragReject ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Typography variant="h6" color="error">
                ❌ Format de fichier non supporté
              </Typography>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                🎵 Glissez-déposez votre fichier audio ici
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                ou cliquez pour parcourir vos fichiers
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  mt: 1,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #4CA7D8 0%, #5BB3E0 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3A96C7 0%, #4AA2CF 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(76, 167, 216, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                📁 Parcourir les fichiers
              </Button>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Formats acceptés */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Formats acceptés :
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
          {[].concat(...getObjectValues(ACCEPTED_FORMATS)).map((format: string) => (
            <Chip 
              key={format} 
              label={format.toUpperCase()} 
              size="small" 
              variant="outlined" 
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Taille max : 100 MB • Durée max : 10 minutes
        </Typography>
      </Box>

      {/* Barre de progression pour l'analyse */}
      {isAnalyzing && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            Analyse du fichier audio...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {/* Erreurs */}
      {uploadError && (
        <Alert 
          severity="error" 
          sx={{ mt: 3 }}
          icon={<ErrorIcon />}
        >
          {uploadError}
        </Alert>
      )}

      {/* Moniteur de performances */}
      {(metrics.fileSize > 0 || warnings.length > 0) && (
        <Box sx={{ mt: 4 }}>
          <PerformanceMonitor
            metrics={metrics}
            warnings={warnings}
            recommendations={getRecommendations()}
            isOptimizing={isOptimizing}
            onOptimizeMemory={optimizeMemory}
          />
        </Box>
      )}

      {/* Informations sur l'audio processing */}
      <Box sx={{ mt: 4 }}>
        <Card sx={{ backgroundColor: 'info.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="info.main">
              ℹ️ Que va-t-il se passer ?
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AudioFileIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="body2">
                    <strong>Analyse automatique</strong>
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Détection du BPM, de la tonalité et des caractéristiques audio
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="body2">
                    <strong>Questionnaire guidé</strong>
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Sélection de votre intention émotionnelle pour personnaliser la transformation
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CloudUploadIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="body2">
                    <strong>Transformation</strong>
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Application des fréquences thérapeutiques selon votre intention
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AudioUpload;
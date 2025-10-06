import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Grid,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  AudioFile as AudioFileIcon,
  HighQuality as HighQualityIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AudioFile, TransformationSettings, ProcessingStatus } from '../types';

interface AudioExportProps {
  audioFile: AudioFile | null;
  transformationSettings: TransformationSettings;
  processingStatus: ProcessingStatus;
  onBack: () => void;
  onReset: () => void;
}

interface ExportSettings {
  format: 'wav' | 'mp3';
  quality: 'standard' | 'high';
}

const AudioExport: React.FC<AudioExportProps> = ({
  audioFile,
  transformationSettings,
  processingStatus,
  onBack,
  onReset
}) => {
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'wav',
    quality: 'high'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = async () => {
    if (processingStatus.status !== 'completed') {
      alert('Veuillez d\'abord terminer la transformation audio');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simuler le progrès d'export
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Récupérer le task_id depuis le processingStatus ou le localStorage
      const taskId = localStorage.getItem('currentTaskId');
      if (!taskId) {
        throw new Error('Aucune tâche de traitement trouvée');
      }

      const response = await fetch(`/api/export/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportSettings)
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harmonya_export_${Date.now()}.${exportSettings.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportComplete(true);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du fichier');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDirectDownload = async () => {
    try {
      const taskId = localStorage.getItem('currentTaskId');
      if (!taskId) {
        throw new Error('Aucune tâche de traitement trouvée');
      }

      const response = await fetch(`/api/download/${taskId}`);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harmonya_transformed_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: '#FFFFFF', textAlign: 'center', mb: 4 }}>
          🎵 Export de votre Musique Transformée
        </Typography>

        {/* Résumé de la transformation */}
        <Card sx={{ mb: 3, backgroundColor: '#2F353B' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF' }}>
              📊 Résumé de la Transformation
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fichier original
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
                    {audioFile?.name || 'Fichier audio'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Accordage
                  </Typography>
                  <Chip 
                    label={`${transformationSettings.tuning} Hz`} 
                    color="primary" 
                    size="small" 
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Ajustement BPM
                  </Typography>
                  <Chip 
                    label={`${transformationSettings.bpmAdjustment > 0 ? '+' : ''}${transformationSettings.bpmAdjustment}%`} 
                    color="secondary" 
                    size="small" 
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fréquence thérapeutique
                  </Typography>
                  <Chip 
                    label={`${transformationSettings.therapeuticFrequency} Hz`} 
                    color="success" 
                    size="small" 
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Battements binauraux
                  </Typography>
                  <Chip 
                    label={transformationSettings.binauralBeat.enabled ? 
                      `${transformationSettings.binauralBeat.type.toUpperCase()} activé` : 
                      'Désactivé'
                    } 
                    color={transformationSettings.binauralBeat.enabled ? "info" : "default"}
                    size="small" 
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Intention
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
                    {transformationSettings.intention || 'Non spécifiée'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Options d'export */}
        <Card sx={{ mb: 3, backgroundColor: '#2F353B' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF' }}>
              ⚙️ Options d'Export
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#FFFFFF' }}>Format</InputLabel>
                  <Select
                    value={exportSettings.format}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value as 'wav' | 'mp3' }))}
                    sx={{ color: '#FFFFFF' }}
                  >
                    <MenuItem value="wav">WAV (Qualité maximale)</MenuItem>
                    <MenuItem value="mp3">MP3 (Taille réduite)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#FFFFFF' }}>Qualité</InputLabel>
                  <Select
                    value={exportSettings.quality}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, quality: e.target.value as 'standard' | 'high' }))}
                    sx={{ color: '#FFFFFF' }}
                  >
                    <MenuItem value="high">Haute qualité</MenuItem>
                    <MenuItem value="standard">Qualité standard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>WAV :</strong> Format non compressé, qualité maximale, fichier plus volumineux<br/>
                <strong>MP3 :</strong> Format compressé, bonne qualité, fichier plus léger
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* Progrès d'export */}
        {isExporting && (
          <Card sx={{ mb: 3, backgroundColor: '#2F353B' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF' }}>
                📤 Export en cours...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={exportProgress} 
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Préparation du fichier pour le téléchargement...
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Confirmation d'export */}
        {exportComplete && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body1">
              <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Export terminé avec succès ! Le téléchargement a commencé automatiquement.
            </Typography>
          </Alert>
        )}

        {/* Boutons d'action */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            sx={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}
          >
            Retour au traitement
          </Button>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              startIcon={<AudioFileIcon />}
              onClick={handleDirectDownload}
              variant="outlined"
              color="secondary"
              disabled={processingStatus.status !== 'completed'}
            >
              Téléchargement direct (WAV)
            </Button>
            
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              variant="contained"
              color="primary"
              disabled={processingStatus.status !== 'completed' || isExporting}
            >
              {isExporting ? 'Export...' : 'Exporter avec options'}
            </Button>
            
            <Button
              onClick={onReset}
              variant="contained"
              color="success"
            >
              Nouvelle transformation
            </Button>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default AudioExport;
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Slider,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  VolumeUp as VolumeIcon,
  Tune as TuneIcon,
  Speed as SpeedIcon,
  Waves as WavesIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon,
  GraphicEq as PreviewIcon,
  Equalizer as EqualizerIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import WaveSurfer from 'wavesurfer.js';
import { AudioFile, TransformationSettings, ProcessingStatus, BrainwaveType } from '../types';
import { formatTime } from '../utils/polyfills';
import AudioExport from './AudioExport';
import AudioPreview from './AudioPreview';
import DetailedProgressBar, { ProgressStep } from './DetailedProgressBar';
import AudioEqualizer, { EqualizerBand } from './AudioEqualizer';
import { usePerformanceOptimization } from '../hooks/usePerformanceOptimization';
import PerformanceMonitor from './PerformanceMonitor';

interface AudioProcessorProps {
  audioFile: AudioFile | null;
  transformationSettings: TransformationSettings;
  onSettingsChange: (settings: TransformationSettings) => void;
  processingStatus: ProcessingStatus;
  onProcessingStatusChange: (status: ProcessingStatus) => void;
  onBack: () => void;
  onNext: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ backgroundColor: '#25282F' }}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const AudioProcessor: React.FC<AudioProcessorProps> = ({
  audioFile,
  transformationSettings,
  onSettingsChange,
  processingStatus,
  onProcessingStatusChange,
  onBack,
  onNext
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<'original' | 'transformed'>('original');
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showExport, setShowExport] = useState(false);
  
  // États pour l'égaliseur
  const [muted, setMuted] = useState(false);
  const [equalizerEnabled, setEqualizerEnabled] = useState(false);
  const [equalizerBands, setEqualizerBands] = useState<EqualizerBand[]>([
    { frequency: 60, gain: 0, label: '60 Hz' },
    { frequency: 170, gain: 0, label: '170 Hz' },
    { frequency: 310, gain: 0, label: '310 Hz' },
    { frequency: 600, gain: 0, label: '600 Hz' },
    { frequency: 1000, gain: 0, label: '1 kHz' },
    { frequency: 3000, gain: 0, label: '3 kHz' },
    { frequency: 6000, gain: 0, label: '6 kHz' },
    { frequency: 12000, gain: 0, label: '12 kHz' }
  ]);

  // Hook d'optimisation des performances
  const {
    metrics,
    warnings,
    isOptimizing,
    analyzeFile,
    optimizeMemory,
    startOptimization,
    stopOptimization,
    getRecommendations
  } = usePerformanceOptimization({
    maxFileSize: 100, // 100 MB
    enableMemoryMonitoring: true,
    enableProgressiveLoading: true,
    enableChunkedProcessing: true
  });

  const originalWaveformRef = useRef<HTMLDivElement>(null);
  const transformedWaveformRef = useRef<HTMLDivElement>(null);
  const originalWaveSurferRef = useRef<WaveSurfer | null>(null);
  const transformedWaveSurferRef = useRef<WaveSurfer | null>(null);

  // Initialisation des waveforms
  useEffect(() => {
    if (!audioFile) return;

    // Analyser les performances du fichier
    analyzeFile(audioFile.file);
    
    // Démarrer l'optimisation pour les gros fichiers
    if (audioFile.file.size > 50 * 1024 * 1024) { // > 50MB
      startOptimization();
    }

    const initWaveSurfer = async () => {
      // WaveSurfer original
      if (originalWaveformRef.current) {
        originalWaveSurferRef.current = WaveSurfer.create({
          container: originalWaveformRef.current,
          waveColor: '#6366f1',
          progressColor: '#4338ca',
          cursorColor: '#1e293b',
          barWidth: 2,
          barRadius: 3,
          height: 80,
          normalize: true
        });

        const url = URL.createObjectURL(audioFile.file);
        await originalWaveSurferRef.current.load(url);
        setDuration(originalWaveSurferRef.current.getDuration());

        originalWaveSurferRef.current.on('audioprocess', () => {
          setCurrentTime(originalWaveSurferRef.current?.getCurrentTime() || 0);
        });

        originalWaveSurferRef.current.on('play', () => setIsPlaying(true));
        originalWaveSurferRef.current.on('pause', () => setIsPlaying(false));
      }

      // WaveSurfer transformé (simulation)
      if (transformedWaveformRef.current) {
        transformedWaveSurferRef.current = WaveSurfer.create({
          container: transformedWaveformRef.current,
          waveColor: '#10b981',
          progressColor: '#047857',
          cursorColor: '#1e293b',
          barWidth: 2,
          barRadius: 3,
          height: 80,
          normalize: true
        });

        // Pour la démo, on utilise le même fichier
        const url = URL.createObjectURL(audioFile.file);
        await transformedWaveSurferRef.current.load(url);

        transformedWaveSurferRef.current.on('audioprocess', () => {
          setCurrentTime(transformedWaveSurferRef.current?.getCurrentTime() || 0);
        });

        transformedWaveSurferRef.current.on('play', () => setIsPlaying(true));
        transformedWaveSurferRef.current.on('pause', () => setIsPlaying(false));
      }
    };

    initWaveSurfer();

    return () => {
      originalWaveSurferRef.current?.destroy();
      transformedWaveSurferRef.current?.destroy();
    };
  }, [audioFile]);

  const handlePlayPause = () => {
    const waveSurfer = currentPlayer === 'original' 
      ? originalWaveSurferRef.current 
      : transformedWaveSurferRef.current;

    if (waveSurfer) {
      waveSurfer.playPause();
    }
  };

  const handleStop = () => {
    const waveSurfer = currentPlayer === 'original' 
      ? originalWaveSurferRef.current 
      : transformedWaveSurferRef.current;

    if (waveSurfer) {
      waveSurfer.stop();
      setIsPlaying(false);
    }
  };

  const handlePlayerSwitch = (player: 'original' | 'transformed') => {
    // Arrêter l'autre lecteur
    if (currentPlayer !== player) {
      const otherWaveSurfer = currentPlayer === 'original' 
        ? originalWaveSurferRef.current 
        : transformedWaveSurferRef.current;
      otherWaveSurfer?.pause();
    }
    setCurrentPlayer(player);
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const vol = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(vol);
    originalWaveSurferRef.current?.setVolume(vol);
    transformedWaveSurferRef.current?.setVolume(vol);
  };

  const handleSettingChange = (key: keyof TransformationSettings, value: any) => {
    onSettingsChange({
      ...transformationSettings,
      [key]: value
    });
  };

  const handleBinauralBeatChange = (key: string, value: any) => {
    onSettingsChange({
      ...transformationSettings,
      binauralBeat: {
        ...transformationSettings.binauralBeat,
        [key]: value
      }
    });
  };

  // Créer les étapes de progression détaillée
  const createProgressSteps = (): ProgressStep[] => {
    const steps: ProgressStep[] = [
      {
        id: 'analyze',
        label: 'Analyse Audio',
        description: 'Analyse des caractéristiques du fichier audio',
        status: 'completed'
      },
      {
        id: 'prepare',
        label: 'Préparation',
        description: 'Configuration des paramètres de transformation',
        status: 'completed'
      },
      {
        id: 'frequency',
        label: 'Ajustement Fréquentiel',
        description: `Application de la fréquence thérapeutique ${transformationSettings.therapeuticFrequency} Hz`,
        status: processingStatus.status === 'processing' ? 'active' : 
               processingStatus.status === 'completed' ? 'completed' : 'pending',
        progress: processingStatus.status === 'processing' ? Math.min(processingStatus.progress * 0.4, 40) : 
                 processingStatus.status === 'completed' ? 100 : 0
      },
      {
        id: 'tuning',
        label: 'Accordage',
        description: `Ajustement à ${transformationSettings.tuning} Hz`,
        status: processingStatus.status === 'processing' && processingStatus.progress > 25 ? 'active' :
               processingStatus.status === 'completed' ? 'completed' : 'pending',
        progress: processingStatus.status === 'processing' && processingStatus.progress > 25 ? 
                 Math.min((processingStatus.progress - 25) * 1.33, 100) : 
                 processingStatus.status === 'completed' ? 100 : 0
      },
      {
        id: 'tempo',
        label: 'Ajustement Tempo',
        description: `Modification BPM: ${transformationSettings.bpmAdjustment > 0 ? '+' : ''}${transformationSettings.bpmAdjustment}%`,
        status: processingStatus.status === 'processing' && processingStatus.progress > 50 ? 'active' :
               processingStatus.status === 'completed' ? 'completed' : 'pending',
        progress: processingStatus.status === 'processing' && processingStatus.progress > 50 ? 
                 Math.min((processingStatus.progress - 50) * 2, 100) : 
                 processingStatus.status === 'completed' ? 100 : 0
      }
    ];

    // Ajouter l'étape des battements binauraux si activée
    if (transformationSettings.binauralBeat.enabled) {
      steps.push({
        id: 'binaural',
        label: 'Battements Binauraux',
        description: `Application des ondes ${transformationSettings.binauralBeat.type}`,
        status: processingStatus.status === 'processing' && processingStatus.progress > 75 ? 'active' :
               processingStatus.status === 'completed' ? 'completed' : 'pending',
        progress: processingStatus.status === 'processing' && processingStatus.progress > 75 ? 
                 Math.min((processingStatus.progress - 75) * 4, 100) : 
                 processingStatus.status === 'completed' ? 100 : 0
      });
    }

    steps.push({
      id: 'finalize',
      label: 'Finalisation',
      description: 'Optimisation et préparation du fichier final',
      status: processingStatus.status === 'processing' && processingStatus.progress > 90 ? 'active' :
             processingStatus.status === 'completed' ? 'completed' : 'pending',
      progress: processingStatus.status === 'processing' && processingStatus.progress > 90 ? 
               Math.min((processingStatus.progress - 90) * 10, 100) : 
               processingStatus.status === 'completed' ? 100 : 0
    });

    return steps;
  };



  const handleProcessTransformation = async () => {
    if (!audioFile) return;

    try {
      onProcessingStatusChange({
        status: 'processing',
        progress: 0,
        message: 'Upload du fichier vers le serveur...'
      });

      // Étape 1: Upload du fichier
      const formData = new FormData();
      formData.append('file', audioFile.file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Erreur lors de l\'upload du fichier');
      }

      const uploadResult = await uploadResponse.json();
      const fileId = uploadResult.file_id;

      onProcessingStatusChange({
        status: 'processing',
        progress: 20,
        message: 'Démarrage du traitement audio...'
      });

      // Étape 2: Démarrer le traitement
      const processResponse = await fetch(`/api/process/${fileId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tuning: transformationSettings.tuning,
          bpm_adjustment: transformationSettings.bpmAdjustment,
          binaural_beat: {
            enabled: transformationSettings.binauralBeat.enabled,
            type: transformationSettings.binauralBeat.type,
            volume: transformationSettings.binauralBeat.volume
          },
          therapeutic_frequency: transformationSettings.therapeuticFrequency,
          intention: transformationSettings.intention
        })
      });

      if (!processResponse.ok) {
        throw new Error('Erreur lors du démarrage du traitement');
      }

      const processResult = await processResponse.json();
      const taskId = processResult.task_id;
      
      // Sauvegarder le task_id pour l'export
      localStorage.setItem('currentTaskId', taskId);

      // Étape 3: Polling du statut
      const pollStatus = async () => {
        try {
          const statusResponse = await fetch(`/api/status/${taskId}`);
          if (!statusResponse.ok) {
            throw new Error('Erreur lors de la récupération du statut');
          }

          const status = await statusResponse.json();

          onProcessingStatusChange({
            status: status.status,
            progress: status.progress,
            message: status.message || 'Traitement en cours...'
          });

          if (status.status === 'processing') {
            setTimeout(pollStatus, 1000);
          } else if (status.status === 'completed') {
            // Charger l'audio traité dans WaveSurfer
            const audioUrl = `/api/download/${taskId}`;
            if (transformedWaveSurferRef.current) {
              try {
                await transformedWaveSurferRef.current.load(audioUrl);
                onProcessingStatusChange({
                  status: 'completed',
                  progress: 100,
                  message: 'Transformation terminée avec succès ! Vous pouvez maintenant écouter le résultat.'
                });
              } catch (loadError) {
                console.error('Erreur lors du chargement de l\'audio traité:', loadError);
                onProcessingStatusChange({
                  status: 'error',
                  progress: 0,
                  message: 'Erreur lors du chargement de l\'audio traité'
                });
              }
            }
          } else if (status.status === 'error') {
            onProcessingStatusChange({
              status: 'error',
              progress: 0,
              message: status.message || 'Erreur lors du traitement'
            });
          }
        } catch (pollError) {
          console.error('Erreur lors du polling:', pollError);
          onProcessingStatusChange({
            status: 'error',
            progress: 0,
            message: 'Erreur de communication avec le serveur'
          });
        }
      };

      pollStatus();

    } catch (error: any) {
      console.error('Erreur lors du traitement:', error);
      onProcessingStatusChange({
        status: 'error',
        progress: 0,
        message: `Erreur: ${error?.message || 'Erreur inconnue'}`
      });
    }
  };

  if (!audioFile) {
    return (
      <Alert severity="error">
        Aucun fichier audio sélectionné
      </Alert>
    );
  }

  const mainContent = (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom align="center" color="primary">
        🎛️ Transformation Audio
      </Typography>

      {/* Informations du fichier */}
      <Card sx={{ mb: 3, backgroundColor: 'primary.50' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary">
                📁 {audioFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Durée: {formatTime(audioFile.duration)} • 
                Taille: {Math.round(audioFile.size / 1024 / 1024)} MB • 
                BPM: {audioFile.bpm} • 
                Tonalité: {audioFile.key}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${transformationSettings.therapeuticFrequency} Hz`} 
                  color="primary" 
                  size="small" 
                />
                <Chip 
                  label={`${transformationSettings.tuning} Hz`} 
                  color="secondary" 
                  size="small" 
                />
                <Chip 
                  label={`${transformationSettings.bpmAdjustment > 0 ? '+' : ''}${transformationSettings.bpmAdjustment}% BPM`} 
                  color="info" 
                  size="small" 
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lecteur A/B */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎵 Lecteur A/B - Comparaison Original vs Transformé
          </Typography>
          
          <Grid container spacing={3}>
            {/* Lecteur Original */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: currentPlayer === 'original' ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  backgroundColor: currentPlayer === 'original' ? 'primary.50' : 'background.paper'
                }}
              >
                <Typography variant="subtitle1" gutterBottom color="primary">
                  🎵 Original
                </Typography>
                <div ref={originalWaveformRef} style={{ marginBottom: '16px', backgroundColor: '#25282F', borderRadius: '4px', padding: '8px' }} />
                <Button
                  variant={currentPlayer === 'original' ? 'contained' : 'outlined'}
                  onClick={() => handlePlayerSwitch('original')}
                  fullWidth
                  size="small"
                >
                  Sélectionner Original
                </Button>
              </Box>
            </Grid>

            {/* Lecteur Transformé */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: currentPlayer === 'transformed' ? 'secondary.main' : 'grey.300',
                  borderRadius: 2,
                  backgroundColor: currentPlayer === 'transformed' ? 'secondary.50' : 'background.paper'
                }}
              >
                <Typography variant="subtitle1" gutterBottom color="secondary">
                  ✨ Transformé
                </Typography>
                <div ref={transformedWaveformRef} style={{ marginBottom: '16px', backgroundColor: '#25282F', borderRadius: '4px', padding: '8px' }} />
                <Button
                  variant={currentPlayer === 'transformed' ? 'contained' : 'outlined'}
                  color="secondary"
                  onClick={() => handlePlayerSwitch('transformed')}
                  fullWidth
                  size="small"
                >
                  Sélectionner Transformé
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Contrôles de lecture */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
            <IconButton onClick={handlePlayPause} color="primary" size="large">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <IconButton onClick={handleStop} color="primary">
              <StopIcon />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: '80px' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>
            <VolumeIcon />
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.1}
              sx={{ width: 100 }}
            />
            <Chip 
              label={currentPlayer === 'original' ? 'Original' : 'Transformé'} 
              color={currentPlayer === 'original' ? 'primary' : 'secondary'}
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Contrôles de transformation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab icon={<PreviewIcon />} label="Prévisualisation" />
              <Tab icon={<EqualizerIcon />} label="Égaliseur" />
              <Tab icon={<TuneIcon />} label="Accordage" />
              <Tab icon={<SpeedIcon />} label="Tempo" />
              <Tab icon={<WavesIcon />} label="Battements Binauraux" />
              <Tab icon={<InfoIcon />} label="Informations" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              🎵 Prévisualisation Audio
            </Typography>
            {audioFile && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <AudioPreview 
                    audioFile={audioFile}
                    title="Audio Original"
                    subtitle="Écoutez votre fichier audio avant transformation"
                  />
                </Grid>
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              🎛️ Contrôles Audio et Égaliseur
            </Typography>
            <AudioEqualizer
              volume={volume * 100}
              onVolumeChange={(vol) => setVolume(vol / 100)}
              muted={muted}
              onMutedChange={setMuted}
              equalizerBands={equalizerBands}
              onEqualizerChange={setEqualizerBands}
              equalizerEnabled={equalizerEnabled}
              onEqualizerEnabledChange={setEqualizerEnabled}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              🎼 Accordage et Fréquence Thérapeutique
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Accordage de base: {transformationSettings.tuning} Hz
                </Typography>
                <Slider
                  value={transformationSettings.tuning}
                  onChange={(_, value) => handleSettingChange('tuning', value)}
                  min={430}
                  max={450}
                  step={1}
                  marks={[
                    { value: 432, label: '432 Hz' },
                    { value: 440, label: '440 Hz' }
                  ]}
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  432 Hz: Accordage naturel • 440 Hz: Accordage standard
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Fréquence thérapeutique: {transformationSettings.therapeuticFrequency} Hz
                </Typography>
                <Alert severity="info" sx={{ mt: 1 }}>
                  Cette fréquence a été sélectionnée automatiquement selon votre intention émotionnelle.
                </Alert>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              ⚡ Ajustement du Tempo
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography gutterBottom>
                  Ajustement BPM: {transformationSettings.bpmAdjustment > 0 ? '+' : ''}{transformationSettings.bpmAdjustment}%
                </Typography>
                <Slider
                  value={transformationSettings.bpmAdjustment}
                  onChange={(_, value) => handleSettingChange('bpmAdjustment', value)}
                  min={-20}
                  max={20}
                  step={1}
                  marks={[
                    { value: -20, label: '-20%' },
                    { value: 0, label: '0%' },
                    { value: 20, label: '+20%' }
                  ]}
                  valueLabelDisplay="auto"
                />
                <Typography variant="body2" color="text.secondary">
                  BPM original: {audioFile.bpm} → 
                  BPM transformé: {Math.round(audioFile.bpm! * (1 + transformationSettings.bpmAdjustment / 100))}
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              🧠 Battements Binauraux
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={transformationSettings.binauralBeat.enabled}
                      onChange={(e) => handleBinauralBeatChange('enabled', e.target.checked)}
                    />
                  }
                  label="Activer les battements binauraux"
                />
                
                {transformationSettings.binauralBeat.enabled && (
                  <>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>Type d'onde cérébrale</InputLabel>
                      <Select
                        value={transformationSettings.binauralBeat.type}
                        onChange={(e) => handleBinauralBeatChange('type', e.target.value)}
                        label="Type d'onde cérébrale"
                      >
                        <MenuItem value="delta">Delta (0.5-4 Hz) - Sommeil profond</MenuItem>
                        <MenuItem value="theta">Theta (4-8 Hz) - Méditation</MenuItem>
                        <MenuItem value="alpha">Alpha (8-13 Hz) - Relaxation</MenuItem>
                        <MenuItem value="beta">Beta (13-30 Hz) - Concentration</MenuItem>
                        <MenuItem value="gamma">Gamma (30-100 Hz) - Conscience élargie</MenuItem>
                      </Select>
                    </FormControl>

                    <Typography gutterBottom sx={{ mt: 2 }}>
                      Volume des battements: {Math.round(transformationSettings.binauralBeat.volume * 100)}%
                    </Typography>
                    <Slider
                      value={transformationSettings.binauralBeat.volume}
                      onChange={(_, value) => handleBinauralBeatChange('volume', value)}
                      min={0}
                      max={1}
                      step={0.1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                    />
                  </>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Battements binauraux :</strong> Technique qui utilise deux fréquences légèrement différentes 
                    dans chaque oreille pour synchroniser les ondes cérébrales et induire des états de conscience spécifiques.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Typography variant="h6" gutterBottom>
              📊 Informations sur la Transformation
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: 'primary.50' }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      Fréquence Thérapeutique
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {transformationSettings.therapeuticFrequency} Hz
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fréquence du Solfège Sacré sélectionnée selon votre intention émotionnelle
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: 'secondary.50' }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="secondary" gutterBottom>
                      Onde Cérébrale
                    </Typography>
                    <Typography variant="h4" color="secondary">
                      {transformationSettings.binauralBeat.type.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type d'onde cérébrale ciblée pour votre état de conscience désiré
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Moniteur de performances */}
            {(metrics.fileSize > 0 || warnings.length > 0) && (
              <Box sx={{ mt: 3 }}>
                <PerformanceMonitor
                  metrics={metrics}
                  warnings={warnings}
                  recommendations={getRecommendations()}
                  onOptimizeMemory={optimizeMemory}
                />
              </Box>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Traitement */}
      {processingStatus.status === 'processing' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <DetailedProgressBar
              steps={createProgressSteps()}
              overallProgress={processingStatus.progress}
              currentMessage={processingStatus.message}
              estimatedTimeRemaining={Math.max(0, Math.round((100 - processingStatus.progress) * 0.5))}
            />
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          variant="outlined"
        >
          Retour au questionnaire
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleProcessTransformation}
            disabled={processingStatus.status === 'processing'}
          >
            {processingStatus.status === 'processing' ? 'Traitement...' : 'Appliquer la transformation'}
          </Button>
          
          <Button
            startIcon={<ArrowForwardIcon />}
            onClick={() => setShowExport(true)}
            variant="contained"
            disabled={processingStatus.status !== 'completed'}
          >
            Exporter
          </Button>
        </Box>
      </Box>
    </Box>
  );

  // Afficher le composant d'export si demandé
  if (showExport) {
    return (
      <AudioExport
        audioFile={audioFile}
        transformationSettings={transformationSettings}
        processingStatus={processingStatus}
        onBack={() => setShowExport(false)}
        onReset={() => {
          setShowExport(false);
          onProcessingStatusChange({ status: 'idle', progress: 0, message: '' });
          // Réinitialiser les lecteurs audio
          if (originalWaveSurferRef.current) {
            originalWaveSurferRef.current.stop();
          }
          if (transformedWaveSurferRef.current) {
            transformedWaveSurferRef.current.stop();
          }
          setIsPlaying(false);
          setCurrentPlayer('original');
        }}
      />
    );
  }

  return mainContent;
};

export default AudioProcessor;
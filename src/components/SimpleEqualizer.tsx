import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Button,
  ButtonGroup,
  Switch,
  FormControlLabel,
  Chip,
  Alert
} from '@mui/material';
import {
  GraphicEq as EqualizerIcon,
  VolumeUp as VolumeIcon,
  Refresh as ResetIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export interface SimpleEqualizerBand {
  frequency: number;
  gain: number;
  label: string;
}

interface SimpleEqualizerProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  bands: SimpleEqualizerBand[];
  onBandsChange: (bands: SimpleEqualizerBand[]) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
}

// Presets d'égalisation
const EQUALIZER_PRESETS = {
  flat: {
    name: "Plat",
    description: "Son naturel sans modification",
    gains: [0, 0, 0, 0, 0]
  },
  rock: {
    name: "Rock",
    description: "Basses et aigus renforcés",
    gains: [5, 3, -1, 2, 6]
  },
  pop: {
    name: "Pop",
    description: "Médiums clairs, basses présentes",
    gains: [2, 4, 3, 1, 3]
  },
  jazz: {
    name: "Jazz",
    description: "Médiums chauds, aigus doux",
    gains: [1, 2, 4, 2, 1]
  },
  classical: {
    name: "Classique",
    description: "Équilibre naturel, dynamique préservée",
    gains: [0, 1, 2, 1, 2]
  },
  bass_boost: {
    name: "Basses+",
    description: "Renforcement des basses fréquences",
    gains: [8, 6, 2, 0, 0]
  }
};

const SimpleEqualizer: React.FC<SimpleEqualizerProps> = ({
  enabled,
  onEnabledChange,
  bands,
  onBandsChange,
  volume,
  onVolumeChange,
  muted,
  onMutedChange
}) => {
  const [activePreset, setActivePreset] = useState<string>('flat');

  // Appliquer un preset
  const applyPreset = (presetKey: string) => {
    const preset = EQUALIZER_PRESETS[presetKey as keyof typeof EQUALIZER_PRESETS];
    if (!preset) return;

    const newBands = bands.map((band, index) => ({
      ...band,
      gain: preset.gains[index] || 0
    }));

    onBandsChange(newBands);
    setActivePreset(presetKey);
  };

  // Réinitialiser l'égaliseur
  const resetEqualizer = () => {
    applyPreset('flat');
  };

  // Modifier une bande
  const handleBandChange = (index: number, gain: number) => {
    const newBands = [...bands];
    newBands[index] = { ...newBands[index], gain };
    onBandsChange(newBands);
    setActivePreset('custom');
  };

  // Calculer l'intensité globale de l'égalisation
  const getEqualizerIntensity = () => {
    const totalGain = bands.reduce((sum, band) => sum + Math.abs(band.gain), 0);
    return Math.min(totalGain / 10, 1); // Normaliser entre 0 et 1
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: enabled ? '2px solid #64b5f6' : '1px solid #3A3F45',
        transition: 'border-color 0.3s ease'
      }}>
        <CardContent>
          {/* En-tête avec activation */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EqualizerIcon sx={{ color: enabled ? '#64b5f6' : '#666', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#fff' }}>
                  Égaliseur Audio
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {enabled ? 'Actif - Modifie le son en temps réel' : 'Inactif - Son naturel'}
                </Typography>
              </Box>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={enabled}
                  onChange={(e) => onEnabledChange(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#64b5f6',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#64b5f6',
                    },
                  }}
                />
              }
              label=""
            />
          </Box>

          {/* Indicateur d'intensité */}
          {enabled && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3, 
                backgroundColor: 'rgba(100, 181, 246, 0.1)',
                border: '1px solid rgba(100, 181, 246, 0.3)'
              }}
            >
              <Typography variant="body2">
                🎵 <strong>Égaliseur actif !</strong> Intensité: {Math.round(getEqualizerIntensity() * 100)}%
                {getEqualizerIntensity() > 0.5 && " - Modification importante du son"}
              </Typography>
            </Alert>
          )}

          {/* Presets */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#fff', mb: 2 }}>
              🎛️ Presets Rapides
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(EQUALIZER_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  variant={activePreset === key ? "contained" : "outlined"}
                  size="small"
                  onClick={() => applyPreset(key)}
                  disabled={!enabled}
                  sx={{
                    color: activePreset === key ? '#000' : '#64b5f6',
                    borderColor: '#64b5f6',
                    backgroundColor: activePreset === key ? '#64b5f6' : 'transparent',
                    '&:hover': {
                      backgroundColor: activePreset === key ? '#5aa3f0' : 'rgba(100, 181, 246, 0.1)',
                    },
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    px: 2
                  }}
                >
                  {preset.name}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Bandes d'égalisation */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#fff' }}>
                🎚️ Fréquences
              </Typography>
              <Button
                size="small"
                startIcon={<ResetIcon />}
                onClick={resetEqualizer}
                disabled={!enabled}
                sx={{ color: '#64b5f6', fontSize: '0.75rem' }}
              >
                Reset
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'end' }}>
              {bands.map((band, index) => (
                <Box key={band.frequency} sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1, display: 'block' }}>
                    {band.label}
                  </Typography>
                  <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Slider
                      orientation="vertical"
                      value={band.gain}
                      onChange={(_, value) => handleBandChange(index, value as number)}
                      min={-12}
                      max={12}
                      step={1}
                      disabled={!enabled}
                      sx={{
                        color: enabled ? '#64b5f6' : '#666',
                        height: 100,
                        '& .MuiSlider-thumb': {
                          backgroundColor: enabled ? '#64b5f6' : '#666',
                          width: 16,
                          height: 16,
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: enabled ? '#64b5f6' : '#666',
                          width: 4,
                        },
                        '& .MuiSlider-rail': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          width: 4,
                        }
                      }}
                    />
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: band.gain === 0 ? 'rgba(255, 255, 255, 0.5)' : '#64b5f6',
                      fontWeight: band.gain !== 0 ? 'bold' : 'normal'
                    }}
                  >
                    {band.gain > 0 ? '+' : ''}{band.gain}dB
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Contrôles de volume */}
          <Box sx={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            pt: 2,
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            <VolumeIcon sx={{ color: muted ? '#f44336' : '#64b5f6' }} />
            <Slider
              value={volume}
              onChange={(_, value) => onVolumeChange(value as number)}
              min={0}
              max={100}
              sx={{
                flex: 1,
                color: '#64b5f6',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#64b5f6',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#64b5f6',
                }
              }}
            />
            <Typography variant="body2" sx={{ color: '#fff', minWidth: 50 }}>
              {muted ? 'Muet' : `${Math.round(volume)}%`}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onMutedChange(!muted)}
              sx={{
                color: muted ? '#f44336' : '#64b5f6',
                borderColor: muted ? '#f44336' : '#64b5f6',
                minWidth: 60
              }}
            >
              {muted ? 'Unmute' : 'Mute'}
            </Button>
          </Box>

          {/* Informations sur le preset actuel */}
          {activePreset !== 'custom' && enabled && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(100, 181, 246, 0.05)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: '#64b5f6' }}>
                <strong>{EQUALIZER_PRESETS[activePreset as keyof typeof EQUALIZER_PRESETS].name}:</strong>{' '}
                {EQUALIZER_PRESETS[activePreset as keyof typeof EQUALIZER_PRESETS].description}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SimpleEqualizer;
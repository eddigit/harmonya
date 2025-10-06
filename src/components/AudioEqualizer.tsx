import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Chip,
  Button,
  ButtonGroup
} from '@mui/material';
import {
  VolumeUp as VolumeIcon,
  VolumeDown as VolumeDownIcon,
  VolumeMute as VolumeMuteIcon,
  VolumeOff as VolumeOffIcon,
  Equalizer as EqualizerIcon,
  RestartAlt as ResetIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export interface EqualizerBand {
  frequency: number;
  gain: number;
  label: string;
}

export interface AudioEqualizerProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  equalizerBands: EqualizerBand[];
  onEqualizerChange: (bands: EqualizerBand[]) => void;
  equalizerEnabled: boolean;
  onEqualizerEnabledChange: (enabled: boolean) => void;
}

const AudioEqualizer: React.FC<AudioEqualizerProps> = ({
  volume,
  onVolumeChange,
  muted,
  onMutedChange,
  equalizerBands,
  onEqualizerChange,
  equalizerEnabled,
  onEqualizerEnabledChange
}) => {
  const [localVolume, setLocalVolume] = useState(volume);

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const vol = newValue as number;
    setLocalVolume(vol);
    onVolumeChange(vol);
  };

  const handleBandChange = (index: number, gain: number) => {
    const newBands = [...equalizerBands];
    newBands[index] = { ...newBands[index], gain };
    onEqualizerChange(newBands);
  };

  const resetEqualizer = () => {
    const resetBands = equalizerBands.map(band => ({ ...band, gain: 0 }));
    onEqualizerChange(resetBands);
  };

  const getVolumeIcon = () => {
    if (muted || localVolume === 0) return <VolumeOffIcon />;
    if (localVolume < 30) return <VolumeMuteIcon />;
    if (localVolume < 70) return <VolumeDownIcon />;
    return <VolumeIcon />;
  };

  const presets = [
    { name: 'Plat', gains: [0, 0, 0, 0, 0, 0, 0, 0] },
    { name: 'Rock', gains: [4, 3, -1, -2, 1, 2, 4, 5] },
    { name: 'Pop', gains: [-1, 2, 4, 4, 1, -1, -2, -1] },
    { name: 'Jazz', gains: [3, 2, 1, 2, -1, -1, 2, 3] },
    { name: 'Classique', gains: [4, 3, 2, 1, -1, -1, 2, 4] },
    { name: 'Vocal', gains: [-2, -1, 2, 4, 4, 2, 1, -1] }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    const newBands = equalizerBands.map((band, index) => ({
      ...band,
      gain: preset.gains[index] || 0
    }));
    onEqualizerChange(newBands);
  };

  return (
    <Box>
      {/* Contrôles de Volume */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <VolumeIcon sx={{ mr: 2, color: '#64b5f6' }} />
            <Typography variant="h6" sx={{ color: '#fff' }}>
              Contrôle du Volume
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={muted ? "Activer le son" : "Couper le son"}>
              <IconButton
                onClick={() => onMutedChange(!muted)}
                sx={{ 
                  color: muted ? '#f44336' : '#64b5f6',
                  '&:hover': { backgroundColor: 'rgba(100, 181, 246, 0.1)' }
                }}
              >
                {getVolumeIcon()}
              </IconButton>
            </Tooltip>
            
            <Box sx={{ flex: 1, mx: 2 }}>
              <Slider
                value={muted ? 0 : localVolume}
                onChange={handleVolumeChange}
                min={0}
                max={100}
                disabled={muted}
                sx={{
                  color: '#64b5f6',
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#64b5f6',
                    '&:hover': { boxShadow: '0 0 0 8px rgba(100, 181, 246, 0.16)' }
                  },
                  '& .MuiSlider-track': { backgroundColor: '#64b5f6' },
                  '& .MuiSlider-rail': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
              />
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                minWidth: '40px', 
                textAlign: 'center',
                color: '#fff',
                fontWeight: 'bold'
              }}
            >
              {muted ? '0' : Math.round(localVolume)}%
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Égaliseur */}
      <Card sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EqualizerIcon sx={{ mr: 2, color: '#64b5f6' }} />
              <Typography variant="h6" sx={{ color: '#fff' }}>
                Égaliseur Audio
              </Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={equalizerEnabled}
                  onChange={(e) => onEqualizerEnabledChange(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#64b5f6' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#64b5f6' }
                  }}
                />
              }
              label={<Typography sx={{ color: '#fff' }}>Activé</Typography>}
            />
          </Box>

          {equalizerEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Presets */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 2 }}>
                  Préréglages :
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {presets.map((preset) => (
                    <Chip
                      key={preset.name}
                      label={preset.name}
                      onClick={() => applyPreset(preset)}
                      sx={{
                        backgroundColor: 'rgba(100, 181, 246, 0.1)',
                        color: '#64b5f6',
                        border: '1px solid rgba(100, 181, 246, 0.3)',
                        '&:hover': {
                          backgroundColor: 'rgba(100, 181, 246, 0.2)',
                          cursor: 'pointer'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Bandes d'égalisation */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {equalizerBands.map((band, index) => (
                  <Grid item xs={12/equalizerBands.length} key={band.frequency}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold',
                          display: 'block',
                          mb: 1
                        }}
                      >
                        {band.label}
                      </Typography>
                      
                      <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                        <Slider
                          orientation="vertical"
                          value={band.gain}
                          onChange={(_, value) => handleBandChange(index, value as number)}
                          min={-12}
                          max={12}
                          step={0.5}
                          marks={[
                            { value: -12, label: '-12' },
                            { value: 0, label: '0' },
                            { value: 12, label: '+12' }
                          ]}
                          sx={{
                            color: '#64b5f6',
                            '& .MuiSlider-thumb': {
                              backgroundColor: '#64b5f6',
                              '&:hover': { boxShadow: '0 0 0 8px rgba(100, 181, 246, 0.16)' }
                            },
                            '& .MuiSlider-track': { backgroundColor: '#64b5f6' },
                            '& .MuiSlider-rail': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                            '& .MuiSlider-mark': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                            '& .MuiSlider-markLabel': { color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.7rem' }
                          }}
                        />
                      </Box>
                      
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: band.gain > 0 ? '#4caf50' : band.gain < 0 ? '#f44336' : '#fff',
                          fontWeight: 'bold',
                          display: 'block',
                          mt: 1
                        }}
                      >
                        {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)} dB
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Bouton Reset */}
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  startIcon={<ResetIcon />}
                  onClick={resetEqualizer}
                  variant="outlined"
                  sx={{
                    color: '#64b5f6',
                    borderColor: '#64b5f6',
                    '&:hover': {
                      backgroundColor: 'rgba(100, 181, 246, 0.1)',
                      borderColor: '#64b5f6'
                    }
                  }}
                >
                  Réinitialiser
                </Button>
              </Box>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AudioEqualizer;
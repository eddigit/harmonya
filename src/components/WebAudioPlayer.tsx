import React, { useRef, useEffect, useState } from 'react';
import { SimpleEqualizerBand } from './SimpleEqualizer';

interface WebAudioPlayerProps {
  audioFile: File | null;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  loading: boolean;
  equalizerBands: SimpleEqualizerBand[];
  equalizerEnabled: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onLoadingChange: (loading: boolean) => void;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
}

const WebAudioPlayer: React.FC<WebAudioPlayerProps> = ({
  audioFile,
  isPlaying,
  volume,
  muted,
  equalizerBands,
  equalizerEnabled,
  onTimeUpdate,
  onDurationChange,
  onLoadingChange,
  onPlay,
  onPause,
  onSeek,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const equalizerNodesRef = useRef<BiquadFilterNode[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialiser le contexte audio
  const initializeAudioContext = async () => {
    if (!audioRef.current || isInitialized) return;

    try {
      // Créer le contexte audio
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Reprendre le contexte si suspendu
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Créer le nœud source
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      
      // Créer le nœud de gain
      gainNodeRef.current = audioContextRef.current.createGain();
      
      // Créer les filtres d'égalisation
      equalizerNodesRef.current = equalizerBands.map((band, index) => {
        const filter = audioContextRef.current!.createBiquadFilter();
        
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === equalizerBands.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.setValueAtTime(1, audioContextRef.current!.currentTime);
        }
        
        filter.frequency.setValueAtTime(band.frequency, audioContextRef.current!.currentTime);
        filter.gain.setValueAtTime(band.gain, audioContextRef.current!.currentTime);
        return filter;
      });

      // Connecter les nœuds
      let currentNode: AudioNode = sourceNodeRef.current;
      
      if (equalizerEnabled) {
        equalizerNodesRef.current.forEach(filter => {
          currentNode.connect(filter);
          currentNode = filter;
        });
      }
      
      currentNode.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      setIsInitialized(true);
      console.log('✅ Contexte audio initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation audio:', error);
    }
  };

  // Charger le fichier audio
  useEffect(() => {
    if (!audioFile || !audioRef.current) return;

    onLoadingChange(true);
    const url = URL.createObjectURL(audioFile);
    audioRef.current.src = url;

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        onDurationChange(audioRef.current.duration);
        onLoadingChange(false);
      }
    };

    const handleError = () => {
      console.error('❌ Erreur chargement audio');
      onLoadingChange(false);
    };

    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioRef.current.addEventListener('error', handleError);

    return () => {
      URL.revokeObjectURL(url);
      if (audioRef.current) {
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, [audioFile, onDurationChange, onLoadingChange]);

  // Gérer la lecture/pause
  useEffect(() => {
    if (!audioRef.current) return;

    const playAudio = async () => {
      try {
        if (!isInitialized) {
          await initializeAudioContext();
        }
        
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        await audioRef.current!.play();
        onPlay();
      } catch (error) {
        console.error('❌ Erreur lecture:', error);
      }
    };

    const pauseAudio = () => {
      try {
        audioRef.current!.pause();
        onPause();
      } catch (error) {
        console.error('❌ Erreur pause:', error);
      }
    };

    if (isPlaying) {
      playAudio();
    } else {
      pauseAudio();
    }
  }, [isPlaying, isInitialized, onPlay, onPause]);

  // Mettre à jour le volume
  useEffect(() => {
    if (gainNodeRef.current) {
      const volumeValue = muted ? 0 : volume;
      gainNodeRef.current.gain.setValueAtTime(volumeValue, audioContextRef.current!.currentTime);
    }
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // Mettre à jour l'égaliseur
  useEffect(() => {
    if (equalizerNodesRef.current.length > 0 && audioContextRef.current) {
      equalizerBands.forEach((band, index) => {
        if (equalizerNodesRef.current[index]) {
          const filter = equalizerNodesRef.current[index];
          filter.gain.setValueAtTime(
            equalizerEnabled ? band.gain : 0,
            audioContextRef.current!.currentTime
          );
        }
      });
    }
  }, [equalizerBands, equalizerEnabled]);

  // Mettre à jour le temps
  useEffect(() => {
    if (!audioRef.current) return;

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        onTimeUpdate(audioRef.current.currentTime);
      }
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [onTimeUpdate]);

  // Gérer le seek
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 1) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <audio
      ref={audioRef}
      style={{ display: 'none' }}
      preload="metadata"
    />
  );
};

export default WebAudioPlayer;
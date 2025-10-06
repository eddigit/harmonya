import { useState, useCallback, useRef } from 'react';
import { AudioFile } from '../types';

export interface SimpleAudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  isLoading: boolean;
}

export interface SimpleAudioOptions {
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

export const useSimpleAudioProcessor = (options: SimpleAudioOptions = {}) => {
  const [state, setState] = useState<SimpleAudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    muted: false,
    isLoading: false
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioFileRef = useRef<AudioFile | null>(null);

  // Charger un fichier audio
  const loadAudioFile = useCallback(async (audioFile: AudioFile) => {
    if (!audioFile?.file) return;

    setState(prev => ({ ...prev, isLoading: true }));
    audioFileRef.current = audioFile;

    try {
      // Créer un élément audio temporaire pour obtenir la durée
      const audio = new Audio();
      const url = URL.createObjectURL(audioFile.file);
      
      audio.src = url;
      
      await new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => {
          setState(prev => ({ 
            ...prev, 
            duration: audio.duration,
            isLoading: false,
            currentTime: 0,
            isPlaying: false
          }));
          resolve(void 0);
        });
        
        audio.addEventListener('error', reject);
      });

      // Nettoyer l'URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du chargement du fichier audio:', error);
      options.onError?.(error as Error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [options]);

  // Jouer l'audio
  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  // Mettre en pause
  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // Arrêter
  const stop = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      currentTime: 0 
    }));
  }, []);

  // Changer le volume
  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  // Basculer le mode muet
  const setMuted = useCallback((muted: boolean) => {
    setState(prev => ({ ...prev, muted }));
  }, []);

  // Chercher une position
  const seek = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(time, state.duration));
    setState(prev => ({ ...prev, currentTime: clampedTime }));
  }, [state.duration]);

  // Mettre à jour le temps (appelé par le composant)
  const updateCurrentTime = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
    options.onTimeUpdate?.(time);
  }, [options]);

  // Signaler la fin de lecture
  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    options.onEnded?.();
  }, [options]);

  return {
    state,
    loadAudioFile,
    play,
    pause,
    stop,
    setVolume,
    setMuted,
    seek,
    updateCurrentTime,
    handleEnded,
    audioFile: audioFileRef.current
  };
};
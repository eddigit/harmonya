import { useState, useRef, useCallback, useEffect } from 'react';
import { EqualizerBand } from '../components/AudioEqualizer';

export interface AudioProcessorState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  isLoading: boolean;
}

export interface UseAudioProcessorOptions {
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

export const useAudioProcessor = (options: UseAudioProcessorOptions = {}) => {
  const [state, setState] = useState<AudioProcessorState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    muted: false,
    isLoading: false
  });

  // Références Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const equalizerNodesRef = useRef<BiquadFilterNode[]>([]);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  
  // Références pour le timing
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Initialiser le contexte audio
  const initializeAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Créer le nœud de gain principal
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = 0.7; // Valeur par défaut
      
      // Créer l'analyseur pour la visualisation
      analyserNodeRef.current = audioContextRef.current.createAnalyser();
      analyserNodeRef.current.fftSize = 256;
      
      // Créer les filtres d'égalisation (8 bandes)
      const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000];
      equalizerNodesRef.current = frequencies.map(freq => {
        const filter = audioContextRef.current!.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;
        return filter;
      });
      
      // Connecter les nœuds en chaîne
      let previousNode: AudioNode = gainNodeRef.current;
      equalizerNodesRef.current.forEach(filter => {
        previousNode.connect(filter);
        previousNode = filter;
      });
      
      // Connecter à l'analyseur et à la destination
      previousNode.connect(analyserNodeRef.current);
      analyserNodeRef.current.connect(audioContextRef.current.destination);
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []); // Pas de dépendances

  // Charger un fichier audio
  const loadAudioFile = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await initializeAudioContext();
      
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      
      audioBufferRef.current = audioBuffer;
      setState(prev => ({ 
        ...prev, 
        duration: audioBuffer.duration,
        isLoading: false 
      }));
      
    } catch (error) {
      console.error('Erreur lors du chargement du fichier audio:', error);
      options.onError?.(error as Error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [initializeAudioContext, options]);

  // Mettre à jour le temps de lecture
  const updateTime = useCallback(() => {
    if (state.isPlaying && audioContextRef.current && startTimeRef.current > 0) {
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current + pauseTimeRef.current;
      const newTime = Math.min(elapsed, state.duration);
      
      setState(prev => ({ ...prev, currentTime: newTime }));
      options.onTimeUpdate?.(newTime);
      
      if (newTime >= state.duration) {
        stop();
        options.onEnded?.();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    }
  }, [state.isPlaying, state.duration, options]);

  // Jouer l'audio
  const play = useCallback(async () => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    
    try {
      await initializeAudioContext();
      
      // Arrêter la source précédente si elle existe
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      }
      
      // Créer une nouvelle source
      sourceNodeRef.current = audioContextRef.current.createBufferSource();
      sourceNodeRef.current.buffer = audioBufferRef.current;
      
      // Connecter la source au gain
      sourceNodeRef.current.connect(gainNodeRef.current!);
      
      // Démarrer la lecture
      const offset = pauseTimeRef.current;
      sourceNodeRef.current.start(0, offset);
      startTimeRef.current = audioContextRef.current.currentTime - offset;
      
      setState(prev => ({ ...prev, isPlaying: true }));
      
      // Démarrer la mise à jour du temps
      updateTime();
      
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
      options.onError?.(error as Error);
    }
  }, [initializeAudioContext, updateTime, options]);

  // Mettre en pause
  const pause = useCallback(() => {
    if (sourceNodeRef.current && audioContextRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
      
      pauseTimeRef.current = state.currentTime;
      setState(prev => ({ ...prev, isPlaying: false }));
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [state.currentTime]);

  // Arrêter
  const stop = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    
    pauseTimeRef.current = 0;
    startTimeRef.current = 0;
    setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Chercher à une position spécifique
  const seek = useCallback((time: number) => {
    const wasPlaying = state.isPlaying;
    
    if (wasPlaying) {
      pause();
    }
    
    pauseTimeRef.current = Math.max(0, Math.min(time, state.duration));
    setState(prev => ({ ...prev, currentTime: pauseTimeRef.current }));
    
    if (wasPlaying) {
      setTimeout(() => play(), 50);
    }
  }, [state.isPlaying, state.duration, pause, play]);

  // Changer le volume
  const setVolume = useCallback((volume: number) => {
    const newVolume = Math.max(0, Math.min(1, volume));
    setState(prev => ({ ...prev, volume: newVolume }));
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = state.muted ? 0 : newVolume;
    }
  }, [state.muted]);

  // Basculer le mode muet
  const setMuted = useCallback((muted: boolean) => {
    setState(prev => ({ ...prev, muted }));
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = muted ? 0 : state.volume;
    }
  }, [state.volume]);

  // Appliquer les paramètres d'égalisation
  const applyEqualizer = useCallback((bands: EqualizerBand[]) => {
    if (equalizerNodesRef.current.length === bands.length) {
      bands.forEach((band, index) => {
        const filter = equalizerNodesRef.current[index];
        if (filter) {
          filter.gain.value = band.gain;
        }
      });
    }
  }, []);

  // Obtenir les données de l'analyseur pour la visualisation
  const getAnalyserData = useCallback(() => {
    if (!analyserNodeRef.current) return null;
    
    const bufferLength = analyserNodeRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNodeRef.current.getByteFrequencyData(dataArray);
    
    return dataArray;
  }, []);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    state,
    loadAudioFile,
    play,
    pause,
    stop,
    seek,
    setVolume,
    setMuted,
    applyEqualizer,
    getAnalyserData
  };
};
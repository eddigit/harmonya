/**
 * Utilitaires pour l'optimisation du traitement audio des gros fichiers
 */

export interface AudioChunk {
  data: ArrayBuffer;
  startTime: number;
  endTime: number;
  index: number;
}

export interface ProcessingOptions {
  chunkSize: number; // Taille des chunks en secondes
  overlap: number; // Chevauchement entre chunks en secondes
  maxConcurrentChunks: number; // Nombre max de chunks traités simultanément
  enableWebWorkers: boolean; // Utiliser des Web Workers
}

export class AudioOptimizer {
  private static instance: AudioOptimizer;
  private audioContext: AudioContext | null = null;
  private workers: Worker[] = [];

  private constructor() {}

  static getInstance(): AudioOptimizer {
    if (!AudioOptimizer.instance) {
      AudioOptimizer.instance = new AudioOptimizer();
    }
    return AudioOptimizer.instance;
  }

  /**
   * Initialise le contexte audio avec optimisations
   */
  async initializeAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100,
        latencyHint: 'playback'
      });
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    return this.audioContext;
  }

  /**
   * Divise un fichier audio en chunks pour traitement progressif
   */
  async chunkAudioFile(
    file: File,
    options: ProcessingOptions = {
      chunkSize: 30, // 30 secondes par chunk
      overlap: 2, // 2 secondes de chevauchement
      maxConcurrentChunks: 3,
      enableWebWorkers: true
    }
  ): Promise<AudioChunk[]> {
    const audioContext = await this.initializeAudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const chunks: AudioChunk[] = [];
    const duration = audioBuffer.duration;
    const sampleRate = audioBuffer.sampleRate;
    const channelCount = audioBuffer.numberOfChannels;

    let currentTime = 0;
    let chunkIndex = 0;

    while (currentTime < duration) {
      const startTime = Math.max(0, currentTime - options.overlap);
      const endTime = Math.min(duration, currentTime + options.chunkSize);
      
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const chunkLength = endSample - startSample;

      // Créer un nouveau AudioBuffer pour ce chunk
      const chunkBuffer = audioContext.createBuffer(channelCount, chunkLength, sampleRate);
      
      for (let channel = 0; channel < channelCount; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const chunkChannelData = chunkBuffer.getChannelData(channel);
        
        for (let i = 0; i < chunkLength; i++) {
          chunkChannelData[i] = channelData[startSample + i] || 0;
        }
      }

      // Convertir en ArrayBuffer
      const chunkArrayBuffer = this.audioBufferToArrayBuffer(chunkBuffer);

      chunks.push({
        data: chunkArrayBuffer,
        startTime,
        endTime,
        index: chunkIndex
      });

      currentTime += options.chunkSize;
      chunkIndex++;
    }

    return chunks;
  }

  /**
   * Traite les chunks audio de manière optimisée
   */
  async processChunksOptimized(
    chunks: AudioChunk[],
    processingFunction: (chunk: AudioChunk) => Promise<ArrayBuffer>,
    options: ProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<ArrayBuffer[]> {
    const results: ArrayBuffer[] = new Array(chunks.length);
    const semaphore = new Semaphore(options.maxConcurrentChunks);

    const processChunk = async (chunk: AudioChunk): Promise<void> => {
      await semaphore.acquire();
      try {
        results[chunk.index] = await processingFunction(chunk);
        if (onProgress) {
          const completed = results.filter(r => r !== undefined).length;
          onProgress((completed / chunks.length) * 100);
        }
      } finally {
        semaphore.release();
      }
    };

    // Traiter tous les chunks en parallèle avec limitation
    await Promise.all(chunks.map(processChunk));

    return results;
  }

  /**
   * Optimise la mémoire en libérant les ressources inutilisées
   */
  optimizeMemory(): void {
    // Forcer le garbage collection si disponible
    if ((window as any).gc) {
      (window as any).gc();
    }

    // Nettoyer les workers
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];

    // Suggérer au navigateur de libérer la mémoire
    if ('memory' in performance) {
      console.log('Mémoire utilisée:', (performance as any).memory.usedJSHeapSize / 1024 / 1024, 'MB');
    }
  }

  /**
   * Convertit un AudioBuffer en ArrayBuffer
   */
  private audioBufferToArrayBuffer(audioBuffer: AudioBuffer): ArrayBuffer {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;

    // Créer un buffer interleaved
    const arrayBuffer = new ArrayBuffer(length * numberOfChannels * 4); // 4 bytes per float32
    const view = new Float32Array(arrayBuffer);

    let offset = 0;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        view[offset++] = audioBuffer.getChannelData(channel)[i];
      }
    }

    return arrayBuffer;
  }

  /**
   * Estime la complexité de traitement d'un fichier
   */
  estimateProcessingComplexity(file: File): {
    complexity: 'low' | 'medium' | 'high' | 'extreme';
    estimatedTime: number; // en secondes
    recommendedChunkSize: number; // en secondes
  } {
    const fileSizeMB = file.size / (1024 * 1024);
    
    let complexity: 'low' | 'medium' | 'high' | 'extreme';
    let estimatedTime: number;
    let recommendedChunkSize: number;

    if (fileSizeMB < 10) {
      complexity = 'low';
      estimatedTime = 5;
      recommendedChunkSize = 60;
    } else if (fileSizeMB < 50) {
      complexity = 'medium';
      estimatedTime = 15;
      recommendedChunkSize = 30;
    } else if (fileSizeMB < 100) {
      complexity = 'high';
      estimatedTime = 30;
      recommendedChunkSize = 15;
    } else {
      complexity = 'extreme';
      estimatedTime = 60;
      recommendedChunkSize = 10;
    }

    return { complexity, estimatedTime, recommendedChunkSize };
  }
}

/**
 * Semaphore pour limiter la concurrence
 */
class Semaphore {
  private permits: number;
  private waitQueue: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      if (this.permits > 0) {
        this.permits--;
        resolve();
      } else {
        this.waitQueue.push(resolve);
      }
    });
  }

  release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      if (next) {
        this.permits--;
        next();
      }
    }
  }
}

/**
 * Utilitaires pour la gestion de la mémoire
 */
export class MemoryManager {
  private static readonly MAX_MEMORY_USAGE = 0.8; // 80% de la mémoire disponible

  /**
   * Vérifie si la mémoire disponible est suffisante
   */
  static checkMemoryAvailability(): {
    available: boolean;
    usagePercentage: number;
    recommendation: string;
  } {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usagePercentage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      return {
        available: usagePercentage < this.MAX_MEMORY_USAGE,
        usagePercentage: usagePercentage * 100,
        recommendation: usagePercentage > 0.7 
          ? 'Considérez optimiser la mémoire avant de continuer'
          : 'Mémoire suffisante disponible'
      };
    }

    return {
      available: true,
      usagePercentage: 0,
      recommendation: 'Impossible de déterminer l\'usage mémoire'
    };
  }

  /**
   * Optimise automatiquement la mémoire
   */
  static async optimizeMemory(): Promise<void> {
    // Forcer le garbage collection
    if ((window as any).gc) {
      (window as any).gc();
    }

    // Attendre un peu pour que le GC fasse son travail
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export default AudioOptimizer;
import { useState, useEffect, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  memoryUsage: number;
  processingTime: number;
  fileSize: number;
  isLargeFile: boolean;
  recommendedChunkSize: number;
  estimatedProcessingTime: number;
}

export interface PerformanceOptimizationOptions {
  maxFileSize: number; // en MB
  chunkSize: number; // en MB
  enableMemoryMonitoring: boolean;
  enableProgressiveLoading: boolean;
}

const defaultOptions: PerformanceOptimizationOptions = {
  maxFileSize: 100, // 100 MB
  chunkSize: 10, // 10 MB
  enableMemoryMonitoring: true,
  enableProgressiveLoading: true
};

export const usePerformanceOptimization = (
  options: Partial<PerformanceOptimizationOptions> = {}
) => {
  const opts = { ...defaultOptions, ...options };
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    processingTime: 0,
    fileSize: 0,
    isLargeFile: false,
    recommendedChunkSize: opts.chunkSize,
    estimatedProcessingTime: 0
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const processingStartTime = useRef<number>(0);
  const memoryMonitorInterval = useRef<number | null>(null);

  // Surveillance de la mémoire
  const startMemoryMonitoring = useCallback(() => {
    if (!opts.enableMemoryMonitoring) return;

    memoryMonitorInterval.current = setInterval(() => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024); // MB
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage
        }));

        // Avertissement si la mémoire dépasse 500 MB
        if (memoryUsage > 500) {
          setWarnings(prev => {
            if (!prev.includes('high-memory')) {
              return [...prev, 'high-memory'];
            }
            return prev;
          });
        }
      }
    }, 1000);
  }, [opts.enableMemoryMonitoring]);

  const stopMemoryMonitoring = useCallback(() => {
    if (memoryMonitorInterval.current) {
      clearInterval(memoryMonitorInterval.current);
      memoryMonitorInterval.current = null;
    }
  }, []);

  // Analyse des performances du fichier
  const analyzeFile = useCallback((file: File) => {
    const fileSizeMB = file.size / (1024 * 1024);
    const isLargeFile = fileSizeMB > opts.maxFileSize;
    
    // Calcul du chunk size recommandé basé sur la taille du fichier
    let recommendedChunkSize = opts.chunkSize;
    if (fileSizeMB > 200) {
      recommendedChunkSize = 5; // Chunks plus petits pour très gros fichiers
    } else if (fileSizeMB > 100) {
      recommendedChunkSize = 8;
    }

    // Estimation du temps de traitement (approximatif)
    const estimatedProcessingTime = Math.max(5, fileSizeMB * 0.5); // 0.5 sec par MB minimum 5 sec

    const newMetrics: PerformanceMetrics = {
      memoryUsage: metrics.memoryUsage,
      processingTime: 0,
      fileSize: fileSizeMB,
      isLargeFile,
      recommendedChunkSize,
      estimatedProcessingTime
    };

    setMetrics(newMetrics);

    // Avertissements
    const newWarnings: string[] = [];
    if (isLargeFile) {
      newWarnings.push('large-file');
    }
    if (fileSizeMB > 500) {
      newWarnings.push('very-large-file');
    }
    
    setWarnings(newWarnings);

    return newMetrics;
  }, [opts.maxFileSize, opts.chunkSize, metrics.memoryUsage]);

  // Démarrage de l'optimisation
  const startOptimization = useCallback(() => {
    setIsOptimizing(true);
    processingStartTime.current = Date.now();
    startMemoryMonitoring();
  }, [startMemoryMonitoring]);

  // Arrêt de l'optimisation
  const stopOptimization = useCallback(() => {
    setIsOptimizing(false);
    const processingTime = (Date.now() - processingStartTime.current) / 1000;
    
    setMetrics(prev => ({
      ...prev,
      processingTime
    }));

    stopMemoryMonitoring();
  }, [stopMemoryMonitoring]);

  // Optimisation de la mémoire
  const optimizeMemory = useCallback(() => {
    // Force le garbage collection si disponible
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }

    // Nettoyage des URLs d'objets
    const objectUrls = document.querySelectorAll('audio, video, img');
    objectUrls.forEach(element => {
      const src = element.getAttribute('src');
      if (src && src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
    });
  }, []);

  // Traitement par chunks pour gros fichiers
  const processInChunks = useCallback(async <T>(
    data: ArrayBuffer,
    processor: (chunk: ArrayBuffer, index: number) => Promise<T>,
    onProgress?: (progress: number) => void
  ): Promise<T[]> => {
    const chunkSizeBytes = metrics.recommendedChunkSize * 1024 * 1024;
    const chunks: ArrayBuffer[] = [];
    
    // Découpage en chunks
    for (let i = 0; i < data.byteLength; i += chunkSizeBytes) {
      const chunk = data.slice(i, i + chunkSizeBytes);
      chunks.push(chunk);
    }

    const results: T[] = [];
    
    // Traitement séquentiel des chunks
    for (let i = 0; i < chunks.length; i++) {
      const result = await processor(chunks[i], i);
      results.push(result);
      
      if (onProgress) {
        onProgress((i + 1) / chunks.length * 100);
      }

      // Pause pour permettre au navigateur de respirer
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return results;
  }, [metrics.recommendedChunkSize]);

  // Nettoyage à la destruction
  useEffect(() => {
    return () => {
      stopMemoryMonitoring();
    };
  }, [stopMemoryMonitoring]);

  // Recommandations basées sur les métriques
  const getRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics.isLargeFile) {
      recommendations.push('Utilisez le traitement par chunks pour éviter les problèmes de mémoire');
    }

    if (metrics.memoryUsage > 300) {
      recommendations.push('Considérez fermer d\'autres onglets pour libérer de la mémoire');
    }

    if (metrics.fileSize > 200) {
      recommendations.push('Le traitement peut prendre plusieurs minutes');
      recommendations.push('Évitez de naviguer vers d\'autres pages pendant le traitement');
    }

    return recommendations;
  }, [metrics]);

  return {
    metrics,
    isOptimizing,
    warnings,
    analyzeFile,
    startOptimization,
    stopOptimization,
    optimizeMemory,
    processInChunks,
    getRecommendations
  };
};
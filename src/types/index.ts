// Types pour les fréquences thérapeutiques et intentions émotionnelles

export interface TherapeuticFrequency {
  frequency: number;
  name: string;
  description: string;
  benefits: string[];
  category: 'solfege' | 'brainwave' | 'tuning';
}

export interface EmotionalIntention {
  id: string;
  name: string;
  description: string;
  frequencies: number[];
  bpmAdjustment: number;
  binauralBeat: BrainwaveType;
  tuning?: number;
}

export type BrainwaveType = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

export interface BrainwaveFrequency {
  type: BrainwaveType;
  range: [number, number];
  frequency: number;
  description: string;
  benefits: string[];
}

export interface AudioFile {
  file: File;
  name: string;
  duration: number;
  size: number;
  format: string;
  bpm?: number;
  key?: string;
}

export interface TransformationSettings {
  tuning: number; // 430-450 Hz
  bpmAdjustment: number; // -20% to +20%
  binauralBeat: {
    enabled: boolean;
    type: BrainwaveType;
    volume: number;
  };
  therapeuticFrequency: number;
  intention: string;
}

export interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'analyzing' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

export interface ExportSettings {
  format: 'mp3' | 'wav';
  quality: 'standard' | 'high';
  includeOriginal: boolean;
}

// Mapping des intentions vers les configurations
export const EMOTIONAL_INTENTIONS: Record<string, EmotionalIntention> = {
  healing: {
    id: 'healing',
    name: 'Guérison/Récupération',
    description: 'Soulagement de la douleur, régénération cellulaire, sommeil réparateur',
    frequencies: [174, 285],
    bpmAdjustment: -20,
    binauralBeat: 'delta',
    tuning: 432
  },
  wellbeing: {
    id: 'wellbeing',
    name: 'Bien-être/Équilibre',
    description: 'Libération des peurs, harmonie relationnelle, réduction du stress',
    frequencies: [396, 528, 639],
    bpmAdjustment: -10,
    binauralBeat: 'alpha',
    tuning: 432
  },
  energy: {
    id: 'energy',
    name: 'Énergie/Motivation',
    description: 'Concentration, créativité, euphorie, dynamisme',
    frequencies: [417],
    bpmAdjustment: 10,
    binauralBeat: 'beta',
    tuning: 440
  },
  spirituality: {
    id: 'spirituality',
    name: 'Spiritualité',
    description: 'Intuition, éveil spirituel, conscience élargie',
    frequencies: [741, 852, 963],
    bpmAdjustment: 0,
    binauralBeat: 'theta',
    tuning: 432
  }
};

export const SOLFEGE_FREQUENCIES: TherapeuticFrequency[] = [
  {
    frequency: 174,
    name: 'Ut (174 Hz)',
    description: 'Fondation, sécurité',
    benefits: ['Soulagement de la douleur', 'Sentiment de sécurité', 'Ancrage'],
    category: 'solfege'
  },
  {
    frequency: 285,
    name: 'Ré (285 Hz)',
    description: 'Régénération',
    benefits: ['Régénération des tissus', 'Guérison énergétique', 'Revitalisation'],
    category: 'solfege'
  },
  {
    frequency: 396,
    name: 'Ut (396 Hz)',
    description: 'Libération',
    benefits: ['Libération des peurs', 'Transformation des blocages', 'Confiance'],
    category: 'solfege'
  },
  {
    frequency: 417,
    name: 'Ré (417 Hz)',
    description: 'Changement',
    benefits: ['Facilite le changement', 'Créativité', 'Résolution de problèmes'],
    category: 'solfege'
  },
  {
    frequency: 528,
    name: 'Mi (528 Hz)',
    description: 'Transformation',
    benefits: ['Réparation ADN', 'Amour inconditionnel', 'Transformation'],
    category: 'solfege'
  },
  {
    frequency: 639,
    name: 'Fa (639 Hz)',
    description: 'Relations',
    benefits: ['Harmonie relationnelle', 'Communication', 'Connexion'],
    category: 'solfege'
  },
  {
    frequency: 741,
    name: 'Sol (741 Hz)',
    description: 'Expression',
    benefits: ['Expression de soi', 'Intuition', 'Éveil spirituel'],
    category: 'solfege'
  },
  {
    frequency: 852,
    name: 'La (852 Hz)',
    description: 'Intuition',
    benefits: ['Retour à l\'ordre spirituel', 'Intuition', 'Clairvoyance'],
    category: 'solfege'
  },
  {
    frequency: 963,
    name: 'Si (963 Hz)',
    description: 'Conscience',
    benefits: ['Connexion divine', 'Conscience cosmique', 'Éveil'],
    category: 'solfege'
  }
];

export const BRAINWAVE_FREQUENCIES: BrainwaveFrequency[] = [
  {
    type: 'delta',
    range: [0.5, 4],
    frequency: 2,
    description: 'Sommeil profond, guérison',
    benefits: ['Sommeil réparateur', 'Régénération', 'Guérison profonde']
  },
  {
    type: 'theta',
    range: [4, 8],
    frequency: 6,
    description: 'Méditation profonde, créativité',
    benefits: ['Méditation', 'Créativité', 'Intuition', 'Rêves lucides']
  },
  {
    type: 'alpha',
    range: [8, 13],
    frequency: 10,
    description: 'Relaxation, apprentissage',
    benefits: ['Relaxation', 'Apprentissage', 'Concentration détendue']
  },
  {
    type: 'beta',
    range: [13, 30],
    frequency: 20,
    description: 'Concentration, éveil',
    benefits: ['Concentration', 'Résolution de problèmes', 'Éveil mental']
  },
  {
    type: 'gamma',
    range: [30, 100],
    frequency: 40,
    description: 'Conscience élargie, euphorie',
    benefits: ['Conscience élargie', 'Euphorie', 'Perception accrue']
  }
];
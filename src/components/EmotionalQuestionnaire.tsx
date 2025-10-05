import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Button,
  Chip,
  Fade,
  Alert,
  Divider
} from '@mui/material';
import {
  Healing as HealingIcon,
  SelfImprovement as WellbeingIcon,
  Bolt as EnergyIcon,
  Psychology as SpiritualityIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { EMOTIONAL_INTENTIONS, SOLFEGE_FREQUENCIES, BRAINWAVE_FREQUENCIES } from '../types';
import type { TransformationSettings } from '../types';

interface EmotionalQuestionnaireProps {
  onIntentionSelect: (settings: Partial<TransformationSettings>) => void;
  onBack: () => void;
}

interface IntentionOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  subOptions?: SubOption[];
}

interface SubOption {
  id: string;
  title: string;
  description: string;
  frequency: number;
  benefits: string[];
}

const mainIntentions: IntentionOption[] = [
  {
    id: 'healing',
    title: 'Guérison / Récupération',
    description: 'Soulagement de la douleur, régénération cellulaire, sommeil réparateur',
    icon: <HealingIcon sx={{ fontSize: 40 }} />,
    color: '#10b981',
    subOptions: [
      {
        id: 'pain_relief',
        title: 'Soulagement de la douleur',
        description: 'Réduction des douleurs physiques et tensions',
        frequency: 174,
        benefits: ['Analgésie naturelle', 'Détente musculaire', 'Apaisement']
      },
      {
        id: 'regeneration',
        title: 'Régénération cellulaire',
        description: 'Stimulation de la guérison et régénération des tissus',
        frequency: 285,
        benefits: ['Guérison accélérée', 'Revitalisation', 'Énergie cellulaire']
      },
      {
        id: 'deep_sleep',
        title: 'Sommeil profond',
        description: 'Amélioration de la qualité du sommeil',
        frequency: 174,
        benefits: ['Sommeil réparateur', 'Relaxation profonde', 'Récupération']
      }
    ]
  },
  {
    id: 'wellbeing',
    title: 'Bien-être / Équilibre',
    description: 'Libération des peurs, harmonie relationnelle, réduction du stress',
    icon: <WellbeingIcon sx={{ fontSize: 40 }} />,
    color: '#6366f1',
    subOptions: [
      {
        id: 'fear_release',
        title: 'Libération des peurs',
        description: 'Transformation des blocages émotionnels',
        frequency: 396,
        benefits: ['Confiance en soi', 'Libération émotionnelle', 'Courage']
      },
      {
        id: 'stress_relief',
        title: 'Réduction du stress',
        description: 'Apaisement du système nerveux',
        frequency: 528,
        benefits: ['Calme intérieur', 'Équilibre émotionnel', 'Sérénité']
      },
      {
        id: 'relationships',
        title: 'Harmonie relationnelle',
        description: 'Amélioration des relations et communication',
        frequency: 639,
        benefits: ['Communication fluide', 'Empathie', 'Connexion']
      }
    ]
  },
  {
    id: 'energy',
    title: 'Énergie / Motivation',
    description: 'Concentration, créativité, euphorie, dynamisme',
    icon: <EnergyIcon sx={{ fontSize: 40 }} />,
    color: '#f59e0b',
    subOptions: [
      {
        id: 'concentration',
        title: 'Concentration mentale',
        description: 'Amélioration de la focus et de la productivité',
        frequency: 417,
        benefits: ['Focus laser', 'Clarté mentale', 'Efficacité']
      },
      {
        id: 'creativity',
        title: 'Créativité',
        description: 'Stimulation de l\'inspiration et de l\'innovation',
        frequency: 417,
        benefits: ['Inspiration', 'Innovation', 'Expression artistique']
      },
      {
        id: 'motivation',
        title: 'Motivation et énergie',
        description: 'Boost d\'énergie et de motivation',
        frequency: 417,
        benefits: ['Dynamisme', 'Enthousiasme', 'Action']
      }
    ]
  },
  {
    id: 'spirituality',
    title: 'Spiritualité',
    description: 'Intuition, éveil spirituel, conscience élargie',
    icon: <SpiritualityIcon sx={{ fontSize: 40 }} />,
    color: '#8b5cf6',
    subOptions: [
      {
        id: 'intuition',
        title: 'Développement de l\'intuition',
        description: 'Renforcement de la perception intuitive',
        frequency: 741,
        benefits: ['Intuition accrue', 'Guidance intérieure', 'Clairvoyance']
      },
      {
        id: 'spiritual_awakening',
        title: 'Éveil spirituel',
        description: 'Connexion avec les dimensions supérieures',
        frequency: 852,
        benefits: ['Éveil de conscience', 'Connexion divine', 'Transcendance']
      },
      {
        id: 'cosmic_consciousness',
        title: 'Conscience cosmique',
        description: 'Expansion de la conscience universelle',
        frequency: 963,
        benefits: ['Unité cosmique', 'Conscience élargie', 'Illumination']
      }
    ]
  }
];

const EmotionalQuestionnaire: React.FC<EmotionalQuestionnaireProps> = ({
  onIntentionSelect,
  onBack
}) => {
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);
  const [selectedSubOption, setSelectedSubOption] = useState<string | null>(null);
  const [step, setStep] = useState<'main' | 'sub'>('main');

  const handleMainIntentionSelect = (intentionId: string) => {
    setSelectedIntention(intentionId);
    const intention = mainIntentions.find(i => i.id === intentionId);
    if (intention?.subOptions && intention.subOptions.length > 0) {
      setStep('sub');
    } else {
      // Appliquer directement les paramètres de l'intention principale
      const emotionalIntention = EMOTIONAL_INTENTIONS[intentionId];
      if (emotionalIntention) {
        onIntentionSelect({
          intention: intentionId,
          therapeuticFrequency: emotionalIntention.frequencies[0],
          tuning: emotionalIntention.tuning || 432,
          bpmAdjustment: emotionalIntention.bpmAdjustment,
          binauralBeat: {
            enabled: true,
            type: emotionalIntention.binauralBeat,
            volume: 0.3
          }
        });
      }
    }
  };

  const handleSubOptionSelect = (subOptionId: string) => {
    setSelectedSubOption(subOptionId);
    
    if (!selectedIntention) return;

    const intention = mainIntentions.find(i => i.id === selectedIntention);
    const subOption = intention?.subOptions?.find(s => s.id === subOptionId);
    const emotionalIntention = EMOTIONAL_INTENTIONS[selectedIntention];

    if (subOption && emotionalIntention) {
      onIntentionSelect({
        intention: `${selectedIntention}_${subOptionId}`,
        therapeuticFrequency: subOption.frequency,
        tuning: emotionalIntention.tuning || 432,
        bpmAdjustment: emotionalIntention.bpmAdjustment,
        binauralBeat: {
          enabled: true,
          type: emotionalIntention.binauralBeat,
          volume: 0.3
        }
      });
    }
  };

  const handleBackToMain = () => {
    setStep('main');
    setSelectedIntention(null);
    setSelectedSubOption(null);
  };

  const getFrequencyInfo = (frequency: number) => {
    return SOLFEGE_FREQUENCIES.find(f => f.frequency === frequency);
  };

  const getBrainwaveInfo = (type: string) => {
    return BRAINWAVE_FREQUENCIES.find(b => b.type === type);
  };

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom align="center" color="primary">
        🧠 Quelle est votre intention émotionnelle ?
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        {step === 'main' 
          ? 'Sélectionnez l\'objectif principal que vous souhaitez atteindre'
          : 'Affinez votre choix pour une transformation plus précise'
        }
      </Typography>

      {step === 'main' ? (
        <Fade in={true}>
          <Grid container spacing={3}>
            {mainIntentions.map((intention, index) => (
              <Grid item xs={12} md={6} key={intention.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleMainIntentionSelect(intention.id)}
                      sx={{ height: '100%', p: 3 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                          color: intention.color
                        }}
                      >
                        {intention.icon}
                        <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                          {intention.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {intention.description}
                      </Typography>
                      {intention.subOptions && (
                        <Chip
                          label={`${intention.subOptions.length} options disponibles`}
                          size="small"
                          sx={{ mt: 2 }}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Fade>
      ) : (
        <Fade in={true}>
          <Box>
            {selectedIntention && (
              <>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Intention sélectionnée :</strong> {mainIntentions.find(i => i.id === selectedIntention)?.title}
                  </Typography>
                </Alert>

                <Grid container spacing={3}>
                  {mainIntentions
                    .find(i => i.id === selectedIntention)
                    ?.subOptions?.map((subOption, index) => {
                      const frequencyInfo = getFrequencyInfo(subOption.frequency);
                      return (
                        <Grid item xs={12} key={subOption.id}>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <Card
                              sx={{
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateX(8px)',
                                  boxShadow: 3
                                }
                              }}
                            >
                              <CardActionArea
                                onClick={() => handleSubOptionSelect(subOption.id)}
                                sx={{ p: 3 }}
                              >
                                <Grid container spacing={3} alignItems="center">
                                  <Grid item xs={12} md={8}>
                                    <Typography variant="h6" gutterBottom color="primary">
                                      {subOption.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                      {subOption.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                      {subOption.benefits.map((benefit) => (
                                        <Chip
                                          key={benefit}
                                          label={benefit}
                                          size="small"
                                          variant="outlined"
                                          color="secondary"
                                        />
                                      ))}
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="h4" color="primary" gutterBottom>
                                        {subOption.frequency} Hz
                                      </Typography>
                                      {frequencyInfo && (
                                        <Typography variant="caption" color="text.secondary">
                                          {frequencyInfo.name}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Grid>
                                </Grid>
                              </CardActionArea>
                            </Card>
                          </motion.div>
                        </Grid>
                      );
                    })}
                </Grid>
              </>
            )}
          </Box>
        </Fade>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={step === 'main' ? onBack : handleBackToMain}
          variant="outlined"
        >
          {step === 'main' ? 'Retour à l\'upload' : 'Retour aux intentions'}
        </Button>

        {step === 'sub' && (
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
            Sélectionnez une option pour continuer
          </Typography>
        )}
      </Box>

      {/* Informations sur les fréquences */}
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom color="primary">
          📚 À propos des fréquences thérapeutiques
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: 'primary.50', p: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Solfège Sacré (174-963 Hz)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Fréquences anciennes utilisées pour la guérison et l'harmonisation énergétique
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: 'secondary.50', p: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="secondary">
                Battements Binauraux
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Synchronisation des ondes cérébrales pour des états de conscience spécifiques
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default EmotionalQuestionnaire;
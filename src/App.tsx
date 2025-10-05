import React, { useState } from 'react';
import { Container, Box, Typography, Stepper, Step, StepLabel } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AudioUpload from './components/AudioUpload';
import EmotionalQuestionnaire from './components/EmotionalQuestionnaire';
import AudioProcessor from './components/AudioProcessor';
import { AudioFile, TransformationSettings, ProcessingStatus } from './types';

const steps = [
  'Upload Audio',
  'Intention Émotionnelle',
  'Transformation',
  'Export'
];

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [transformationSettings, setTransformationSettings] = useState<TransformationSettings>({
    tuning: 432,
    bpmAdjustment: 0,
    binauralBeat: {
      enabled: false,
      type: 'alpha',
      volume: 0.3
    },
    therapeuticFrequency: 528,
    intention: ''
  });
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAudioUpload = (file: AudioFile) => {
    setAudioFile(file);
    handleNext();
  };

  const handleIntentionSelect = (settings: Partial<TransformationSettings>) => {
    setTransformationSettings(prev => ({ ...prev, ...settings }));
    handleNext();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <AudioUpload
            onFileUpload={handleAudioUpload}
            processingStatus={processingStatus}
          />
        );
      case 1:
        return (
          <EmotionalQuestionnaire
            onIntentionSelect={handleIntentionSelect}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <AudioProcessor
            audioFile={audioFile}
            transformationSettings={transformationSettings}
            onSettingsChange={setTransformationSettings}
            processingStatus={processingStatus}
            onProcessingStatusChange={setProcessingStatus}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      default:
        return <div>Export en cours de développement...</div>;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              🎵 Harmonia
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 300,
                mb: 4
              }}
            >
              Transformez votre musique avec des fréquences thérapeutiques
            </Typography>
          </Box>
        </motion.div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box
            sx={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 3,
              p: 3,
              mb: 4,
              backdropFilter: 'blur(10px)'
            }}
          >
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 3,
                p: 4,
                backdropFilter: 'blur(10px)',
                minHeight: '500px'
              }}
            >
              {renderStepContent(activeStep)}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
}

export default App;
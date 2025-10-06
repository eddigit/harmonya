import React, { useState } from 'react';
import { Container, Box, Typography, Stepper, Step, StepLabel } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import AudioUpload from './components/AudioUpload';
import EmotionalQuestionnaire from './components/EmotionalQuestionnaire';
import AudioProcessor from './components/AudioProcessor';
import FrequencyGuide from './components/FrequencyGuide';
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
  const [frequencyGuideOpen, setFrequencyGuideOpen] = useState(false);
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
        return (
          <div style={{ 
            backgroundColor: '#25282F', 
            color: '#FFFFFF', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            Export en cours de développement...
          </div>
        );
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#25282F',
      }}
    >
      {/* Header avec navigation */}
      <Header onFrequencyGuideOpen={() => setFrequencyGuideOpen(true)} />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Sous-titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                color: '#CCCCCC',
                fontWeight: 300,
                mb: 4,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
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
              background: '#2F353B',
              borderRadius: 2,
              border: '1px solid #3A3F45',
              p: 3,
              mb: 3,
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
                backgroundColor: '#2F353B',
                borderRadius: 2,
                p: 4,
                minHeight: '500px',
                border: '1px solid #3A3F45'
              }}
            >
              {renderStepContent(activeStep)}
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: '1px solid #3A3F45',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#CCCCCC',
              fontSize: '0.875rem',
              fontWeight: 300,
            }}
          >
            Concepteur : Gilles KORZEC • {new Date().getFullYear()} • Version 1.0.0 • Sociétés partenaires : 
            <a 
              href="https://vybbi.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#4CA7D8', 
                textDecoration: 'none',
                marginLeft: '4px'
              }}
            >
              Vybbi.app
            </a>
            {' • '}
            <a 
              href="https://www.blazon19.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#4CA7D8', 
                textDecoration: 'none'
              }}
            >
              BLAZON XIX
            </a>
          </Typography>
        </Box>
      </Container>

      {/* Guide des fréquences */}
      <FrequencyGuide 
        open={frequencyGuideOpen}
        onClose={() => setFrequencyGuideOpen(false)}
      />
    </Box>
  );
}

export default App;
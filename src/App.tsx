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
        py: 4,
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
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 2,
                mb: 2
              }}
            >
              <Box
                component="img"
                src="/logo.svg"
                alt="Harmonya Logo"
                sx={{
                  width: 48,
                  height: 48,
                  filter: 'drop-shadow(0 2px 8px rgba(76, 167, 216, 0.3))'
                }}
              />
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 300,
                  letterSpacing: '0.5px',
                  margin: 0
                }}
              >
                Harmonya
              </Typography>
            </Box>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                color: '#CCCCCC',
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
    </Box>
  );
}

export default App;
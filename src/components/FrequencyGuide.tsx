import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  MusicNote as MusicNoteIcon,
  Work as WorkIcon,
  Healing as HealingIcon,
  Psychology as PsychologyIcon,
  SelfImprovement as SelfImprovementIcon,
  Bolt as BoltIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface FrequencyGuideProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`frequency-tabpanel-${index}`}
      aria-labelledby={`frequency-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FrequencyGuide: React.FC<FrequencyGuideProps> = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Données des fréquences sacrées
  const sacredFrequencies = [
    {
      frequency: 174,
      name: "Fondation & Sécurité",
      description: "Fréquence de base pour la sécurité et la stabilité",
      benefits: ["Soulagement de la douleur", "Sentiment de sécurité", "Ancrage énergétique"],
      applications: ["Méditation profonde", "Gestion de la douleur", "Relaxation"],
      color: "#8B4513"
    },
    {
      frequency: 285,
      name: "Régénération",
      description: "Stimule la guérison et la régénération cellulaire",
      benefits: ["Guérison accélérée", "Régénération des tissus", "Revitalisation"],
      applications: ["Récupération post-effort", "Convalescence", "Rajeunissement"],
      color: "#228B22"
    },
    {
      frequency: 396,
      name: "Libération des Peurs",
      description: "Transforme les blocages émotionnels et libère des peurs",
      benefits: ["Confiance en soi", "Libération émotionnelle", "Transformation"],
      applications: ["Thérapie émotionnelle", "Développement personnel", "Courage"],
      color: "#DC143C"
    },
    {
      frequency: 417,
      name: "Facilitation du Changement",
      description: "Stimule la créativité et facilite les transitions",
      benefits: ["Créativité accrue", "Adaptation au changement", "Innovation"],
      applications: ["Création artistique", "Résolution de problèmes", "Inspiration"],
      color: "#FF8C00"
    },
    {
      frequency: 528,
      name: "Amour & Réparation ADN",
      description: "Fréquence de l'amour, transformation et réparation",
      benefits: ["Amour inconditionnel", "Réparation ADN", "Transformation"],
      applications: ["Guérison du cœur", "Relations harmonieuses", "Évolution"],
      color: "#32CD32"
    },
    {
      frequency: 639,
      name: "Harmonie Relationnelle",
      description: "Améliore la communication et les relations",
      benefits: ["Communication fluide", "Empathie", "Connexion"],
      applications: ["Relations de couple", "Travail d'équipe", "Réconciliation"],
      color: "#4169E1"
    },
    {
      frequency: 741,
      name: "Expression & Intuition",
      description: "Développe l'expression de soi et l'intuition",
      benefits: ["Expression authentique", "Intuition développée", "Clairvoyance"],
      applications: ["Prise de parole", "Développement spirituel", "Guidance"],
      color: "#9370DB"
    },
    {
      frequency: 852,
      name: "Éveil Spirituel",
      description: "Retour à l'ordre spirituel et éveil de conscience",
      benefits: ["Éveil spirituel", "Connexion divine", "Transcendance"],
      applications: ["Méditation avancée", "Quête spirituelle", "Illumination"],
      color: "#8A2BE2"
    },
    {
      frequency: 963,
      name: "Conscience Cosmique",
      description: "Connexion avec la conscience universelle",
      benefits: ["Unité cosmique", "Conscience élargie", "Illumination"],
      applications: ["États mystiques", "Conscience universelle", "Éveil complet"],
      color: "#9932CC"
    }
  ];

  // Ondes cérébrales
  const brainwaves = [
    {
      name: "Delta (0.5-4 Hz)",
      description: "Sommeil profond et guérison",
      benefits: ["Sommeil réparateur", "Régénération", "Guérison profonde"],
      applications: ["Insomnie", "Récupération", "Méditation profonde"],
      color: "#2E8B57"
    },
    {
      name: "Theta (4-8 Hz)",
      description: "Méditation profonde et créativité",
      benefits: ["Créativité", "Intuition", "Accès à l'inconscient"],
      applications: ["Méditation", "Hypnose", "Thérapie"],
      color: "#4682B4"
    },
    {
      name: "Alpha (8-13 Hz)",
      description: "Relaxation et apprentissage",
      benefits: ["Relaxation", "Concentration", "Apprentissage"],
      applications: ["Étude", "Relaxation", "Visualisation"],
      color: "#32CD32"
    },
    {
      name: "Beta (13-30 Hz)",
      description: "Concentration et éveil mental",
      benefits: ["Concentration", "Résolution de problèmes", "Éveil"],
      applications: ["Travail intellectuel", "Prise de décision", "Focus"],
      color: "#FF6347"
    },
    {
      name: "Gamma (30-100 Hz)",
      description: "Conscience élargie et euphorie",
      benefits: ["Conscience élargie", "Euphorie", "Perception accrue"],
      applications: ["États de flow", "Performance", "Éveil spirituel"],
      color: "#FF1493"
    }
  ];

  // Applications par domaine professionnel
  const professionalApplications = [
    {
      profession: "Musiciens & DJs",
      icon: <MusicNoteIcon />,
      applications: [
        "Améliorer la créativité musicale (417 Hz)",
        "Réduire le stress de performance (528 Hz)",
        "Synchroniser avec le public (639 Hz)",
        "Inspiration artistique (741 Hz)"
      ]
    },
    {
      profession: "Thérapeutes",
      icon: <HealingIcon />,
      applications: [
        "Soulagement de la douleur (174 Hz)",
        "Guérison émotionnelle (396 Hz)",
        "Régénération cellulaire (285 Hz)",
        "Équilibre énergétique (528 Hz)"
      ]
    },
    {
      profession: "Professionnels du Bien-être",
      icon: <SelfImprovementIcon />,
      applications: [
        "Relaxation profonde (Alpha)",
        "Méditation guidée (Theta)",
        "Éveil spirituel (852 Hz)",
        "Harmonie relationnelle (639 Hz)"
      ]
    },
    {
      profession: "Coachs & Formateurs",
      icon: <PsychologyIcon />,
      applications: [
        "Faciliter le changement (417 Hz)",
        "Améliorer la communication (639 Hz)",
        "Développer la confiance (396 Hz)",
        "Stimuler la créativité (417 Hz)"
      ]
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1d23',
          color: '#ffffff',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#25282F',
        color: '#4CA7D8'
      }}>
        <Typography variant="h5" component="div" sx={{ fontFamily: 'Comfortaa, sans-serif' }}>
          🎵 Guide des Fréquences Thérapeutiques
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': { color: '#CCCCCC' },
              '& .Mui-selected': { color: '#4CA7D8' }
            }}
          >
            <Tab label="Fréquences Sacrées" />
            <Tab label="Ondes Cérébrales" />
            <Tab label="Applications Professionnelles" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom color="#4CA7D8">
            Solfège Sacré (174-963 Hz)
          </Typography>
          <Typography variant="body2" color="#CCCCCC" paragraph>
            Les fréquences sacrées sont des tonalités spécifiques qui résonnent avec notre corps énergétique 
            et peuvent induire des états de guérison, de transformation et d'éveil spirituel.
          </Typography>
          
          <Grid container spacing={2}>
            {sacredFrequencies.map((freq) => (
              <Grid item xs={12} md={6} key={freq.frequency}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    backgroundColor: '#2a2d35', 
                    border: `2px solid ${freq.color}`,
                    height: '100%'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ color: freq.color, mr: 2 }}>
                          {freq.frequency} Hz
                        </Typography>
                        <Typography variant="h6" color="#ffffff">
                          {freq.name}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="#CCCCCC" paragraph>
                        {freq.description}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="#4CA7D8" gutterBottom>
                        Bienfaits :
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {freq.benefits.map((benefit) => (
                          <Chip
                            key={benefit}
                            label={benefit}
                            size="small"
                            sx={{ 
                              m: 0.5, 
                              backgroundColor: freq.color + '20',
                              color: freq.color,
                              border: `1px solid ${freq.color}`
                            }}
                          />
                        ))}
                      </Box>
                      
                      <Typography variant="subtitle2" color="#4CA7D8" gutterBottom>
                        Applications :
                      </Typography>
                      <List dense>
                        {freq.applications.map((app) => (
                          <ListItem key={app} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <Box sx={{ 
                                width: 6, 
                                height: 6, 
                                borderRadius: '50%', 
                                backgroundColor: freq.color 
                              }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={app} 
                              primaryTypographyProps={{ 
                                variant: 'caption', 
                                color: '#CCCCCC' 
                              }} 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom color="#4CA7D8">
            Battements Binauraux & Ondes Cérébrales
          </Typography>
          <Typography variant="body2" color="#CCCCCC" paragraph>
            Les battements binauraux synchronisent les ondes cérébrales pour induire des états 
            de conscience spécifiques, de la relaxation profonde à la concentration intense.
          </Typography>
          
          <Grid container spacing={3}>
            {brainwaves.map((wave, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card sx={{ 
                    backgroundColor: '#2a2d35',
                    border: `2px solid ${wave.color}`,
                    height: '100%'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: wave.color, mb: 1 }}>
                        {wave.name}
                      </Typography>
                      <Typography variant="body2" color="#CCCCCC" paragraph>
                        {wave.description}
                      </Typography>
                      
                      <Accordion sx={{ backgroundColor: 'transparent', color: '#ffffff' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#4CA7D8' }} />}>
                          <Typography variant="subtitle2" color="#4CA7D8">
                            Voir les détails
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="subtitle2" color="#4CA7D8" gutterBottom>
                            Bienfaits :
                          </Typography>
                          {wave.benefits.map((benefit) => (
                            <Chip
                              key={benefit}
                              label={benefit}
                              size="small"
                              sx={{ 
                                m: 0.5, 
                                backgroundColor: wave.color + '20',
                                color: wave.color,
                                border: `1px solid ${wave.color}`
                              }}
                            />
                          ))}
                          
                          <Typography variant="subtitle2" color="#4CA7D8" gutterBottom sx={{ mt: 2 }}>
                            Applications :
                          </Typography>
                          <List dense>
                            {wave.applications.map((app) => (
                              <ListItem key={app} sx={{ py: 0 }}>
                                <ListItemIcon sx={{ minWidth: 20 }}>
                                  <Box sx={{ 
                                    width: 6, 
                                    height: 6, 
                                    borderRadius: '50%', 
                                    backgroundColor: wave.color 
                                  }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={app} 
                                  primaryTypographyProps={{ 
                                    variant: 'caption', 
                                    color: '#CCCCCC' 
                                  }} 
                                />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom color="#4CA7D8">
            Applications par Domaine Professionnel
          </Typography>
          <Typography variant="body2" color="#CCCCCC" paragraph>
            Découvrez comment intégrer les fréquences thérapeutiques dans votre pratique professionnelle 
            pour maximiser les bénéfices selon votre domaine d'activité.
          </Typography>
          
          <Grid container spacing={3}>
            {professionalApplications.map((prof, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card sx={{ 
                    backgroundColor: '#2a2d35',
                    border: '2px solid #4CA7D8',
                    height: '100%'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ color: '#4CA7D8', mr: 2 }}>
                          {prof.icon}
                        </Box>
                        <Typography variant="h6" color="#ffffff">
                          {prof.profession}
                        </Typography>
                      </Box>
                      
                      <List>
                        {prof.applications.map((app, appIndex) => (
                          <ListItem key={appIndex} sx={{ py: 1 }}>
                            <ListItemIcon>
                              <InfoIcon sx={{ color: '#4CA7D8', fontSize: 16 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={app} 
                              primaryTypographyProps={{ 
                                variant: 'body2', 
                                color: '#CCCCCC' 
                              }} 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4, p: 3, backgroundColor: '#25282F', borderRadius: 2 }}>
            <Typography variant="h6" color="#4CA7D8" gutterBottom>
              💡 Conseil d'utilisation
            </Typography>
            <Typography variant="body2" color="#CCCCCC">
              Pour une efficacité optimale, commencez par des sessions courtes (10-15 minutes) 
              et augmentez progressivement la durée. L'écoute au casque est recommandée pour 
              les battements binauraux, tandis que les fréquences sacrées peuvent être diffusées 
              en ambiance.
            </Typography>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ backgroundColor: '#25282F', p: 2 }}>
        <Typography variant="caption" color="#CCCCCC" sx={{ flexGrow: 1 }}>
          Harmonya - Guide des Fréquences Thérapeutiques
        </Typography>
        <Button onClick={onClose} variant="contained" sx={{ 
          backgroundColor: '#4CA7D8',
          '&:hover': { backgroundColor: '#3a8bb8' }
        }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FrequencyGuide;
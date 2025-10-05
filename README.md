# 🎵 Harmonia - Fréquences Thérapeutiques

Application web révolutionnaire permettant aux DJs, producteurs et sonothérapeutes de transformer leurs musiques en intégrant des fréquences thérapeutiques basées sur l'intention émotionnelle souhaitée.

## ✨ Fonctionnalités Principales

### 📁 Upload et Validation
- Zone drag-and-drop intuitive pour fichiers audio (MP3, WAV, FLAC, AAC)
- Validation automatique du format et de la taille
- Limite : 100 Mo ou 10 minutes
- Analyse automatique du BPM et de la tonalité

### 🧠 Questionnaire Émotionnel Intelligent
**Étape 1 - Objectif principal :**
- **Guérison/Récupération** → 174 Hz (douleur), 285 Hz (régénération), Delta (sommeil)
- **Bien-être/Équilibre** → 396 Hz (peurs), 639 Hz (relations), 528 Hz (stress), Alpha
- **Énergie/Motivation** → Beta (concentration), 417 Hz (créativité), Gamma (euphorie)
- **Spiritualité** → 741 Hz (intuition), 852 Hz (éveil), 963 Hz (conscience)

**Étape 2 - Affinage :** Options spécifiques selon le choix précédent

### 🎛️ Interface de Contrôle
- Visualisation forme d'onde avec wavesurfer.js
- Lecteur A/B (original vs transformé)
- Preset automatique + modification manuelle possible
- **Contrôles :**
  - Accordage : slider 430-450 Hz (points 432, 440 Hz)
  - Tempo : détection BPM auto + ajustement ±20%
  - Battements binauraux : activation + choix onde + volume

### 🎵 Traitement et Export
- Transformation en temps réel pour prévisualisation
- Traitement final avec barre de progression
- Export MP3/WAV avec nom automatique incluant réglages
- Pré-écoute finale avant téléchargement

## 🛠️ Architecture Technique

### Frontend
- **React.js + TypeScript** pour SPA responsive
- **Material-UI** pour design moderne et apaisant
- **wavesurfer.js** pour visualisation audio
- **Web Audio API** pour battements binauraux
- **Framer Motion** pour animations fluides

### Backend (À venir)
- **Node.js + Express** pour API Gateway
- **Python + FastAPI** pour traitement audio
- **Librairies :** librosa (analyse), pyrubberband (pitch/tempo), pydub (manipulation)

### Infrastructure (Prévue)
- **Frontend :** Vercel/Netlify
- **Backend :** AWS/Heroku avec Docker
- **Stockage :** AWS S3 (temporaire 24h)
- **Base :** PostgreSQL pour métadonnées

## 🎯 Algorithme de Mapping

```python
intentions = {
    "sommeil": {"freq": 174, "bpm": -20, "binaural": "delta"},
    "stress": {"freq": 528, "bpm": -10, "binaural": "alpha"},
    "concentration": {"freq": 440, "bpm": +5, "binaural": "beta"},
    "créativité": {"freq": 417, "bpm": +10, "binaural": "theta"}
}
```

## 📚 Base de Connaissances Intégrée

### Solfège Sacré (174-963 Hz)
- **174 Hz** - Fondation, sécurité, soulagement de la douleur
- **285 Hz** - Régénération des tissus, guérison énergétique
- **396 Hz** - Libération des peurs, transformation des blocages
- **417 Hz** - Facilite le changement, créativité
- **528 Hz** - Réparation ADN, amour inconditionnel, transformation
- **639 Hz** - Harmonie relationnelle, communication
- **741 Hz** - Expression de soi, intuition, éveil spirituel
- **852 Hz** - Retour à l'ordre spirituel, clairvoyance
- **963 Hz** - Connexion divine, conscience cosmique

### Ondes Cérébrales
- **Delta (0.5-4 Hz)** - Sommeil profond, guérison
- **Theta (4-8 Hz)** - Méditation profonde, créativité
- **Alpha (8-13 Hz)** - Relaxation, apprentissage
- **Beta (13-30 Hz)** - Concentration, éveil mental
- **Gamma (25-100 Hz)** - Conscience élargie, euphorie

### Accordage
- **432 Hz** - Accordage naturel, harmonie avec la nature
- **440 Hz** - Accordage standard moderne

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone https://github.com/votre-username/harmonia-trae.git
cd harmonia-trae

# Installer les dépendances
npm install

# Démarrer l'application en mode développement
npm start
```

L'application sera accessible sur `http://localhost:3000`

### Scripts Disponibles
- `npm start` - Démarre l'application en mode développement
- `npm build` - Construit l'application pour la production
- `npm test` - Lance les tests
- `npm eject` - Éjecte la configuration (irréversible)

## 🎨 Design et UX

### Principes UX/UI
- **Simplicité :** Questionnaire guide l'utilisateur novice
- **Design apaisant :** Palette douce (bleus/verts/violets pastel)
- **Feedback temps réel :** Visualisation immédiate des modifications
- **Mobile-first :** Interface responsive

### Palette de Couleurs
- **Primaire :** #6366f1 (Indigo doux)
- **Secondaire :** #10b981 (Vert émeraude)
- **Arrière-plan :** #f8fafc (Gris très clair)
- **Texte :** #1e293b (Gris foncé)

## 🔒 Contraintes Techniques

### Performance
- Traitement 5 min de musique en <1 min
- Optimisation des waveforms pour mobile
- Lazy loading des composants

### Sécurité
- TLS 1.3 pour toutes les communications
- Suppression automatique des fichiers après 24h
- Rate limiting pour éviter les abus
- Validation stricte des fichiers uploadés

### Compatibilité
- Chrome, Firefox, Safari, Edge (dernières versions)
- Support mobile iOS/Android
- Progressive Web App (PWA) ready

## 💰 Modèle Économique

### Gratuit
- 3 transformations par jour
- Export MP3 standard
- Accès aux fréquences de base

### Premium (À venir)
- Transformations illimitées
- Export haute qualité (WAV 24-bit)
- Presets sauvegardés
- File prioritaire de traitement
- Fréquences avancées

## 🗺️ Roadmap

### MVP (Actuel - 3-4 mois)
- ✅ Core fonctionnel
- ✅ Questionnaire émotionnel
- ✅ Interface de contrôle
- 🔄 Export MP3

### V2 (2 mois)
- 🔄 Backend Python FastAPI
- 🔄 Traitement audio réel
- 🔄 Battements binauraux fonctionnels
- 🔄 UX améliorée

### Premium (3 mois)
- 🔄 Authentification utilisateur
- 🔄 Système d'abonnements
- 🔄 Fonctionnalités avancées
- 🔄 API publique

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Communauté de la sonothérapie pour les recherches sur les fréquences
- Développeurs de wavesurfer.js pour l'excellent outil de visualisation
- Équipe Material-UI pour les composants React

---

**Harmonia révolutionne la création audio en démocratisant l'accès aux fréquences thérapeutiques via une interface intuitive guidée par l'intention émotionnelle.**
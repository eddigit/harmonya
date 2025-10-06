from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, Dict, Any, Literal
import os
import uuid
import asyncio
from pathlib import Path
import librosa
import numpy as np
import soundfile as sf
from pydub import AudioSegment
import time

app = FastAPI(title="Harmonia Audio Processing API", version="1.0.0")

# Servir les fichiers statiques React
if os.path.exists("dist"):
    app.mount("/static", StaticFiles(directory="dist/assets"), name="static")
    app.mount("/", StaticFiles(directory="dist", html=True), name="frontend")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permettre toutes les origines pour le déploiement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint de santé pour Railway
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Harmonia Audio Processing API"}

# Modèles Pydantic
class AudioAnalysisResponse(BaseModel):
    file_id: str
    filename: str
    duration: float
    bpm: Optional[float]
    key: Optional[str]
    sample_rate: int
    channels: int

class BinauralBeatSettings(BaseModel):
    enabled: bool
    type: Literal['delta', 'theta', 'alpha', 'beta', 'gamma']
    volume: float

class TransformationRequest(BaseModel):
    tuning: float = 440.0
    bpm_adjustment: float = 0.0
    binaural_beat: BinauralBeatSettings
    therapeutic_frequency: float
    intention: str

class ProcessingStatusResponse(BaseModel):
    status: Literal['idle', 'processing', 'completed', 'error']
    progress: int
    message: Optional[str] = None
    error: Optional[str] = None

class ExportRequest(BaseModel):
    format: Literal['mp3', 'wav'] = 'wav'
    quality: Literal['standard', 'high'] = 'standard'

# Stockage en mémoire pour le statut des tâches
processing_tasks: Dict[str, Dict[str, Any]] = {}

# Créer les dossiers nécessaires
UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = Path("processed")
UPLOAD_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)

# Formats audio supportés
SUPPORTED_FORMATS = {
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'audio/x-wav': ['.wav'],
    'audio/flac': ['.flac'],
    'audio/aac': ['.aac'],
    'audio/mp4': ['.m4a'],
    'audio/ogg': ['.ogg']
}

def validate_audio_file(file: UploadFile) -> bool:
    """Valider qu'un fichier uploadé est un format audio supporté"""
    if not file.content_type:
        return False
    
    if file.content_type not in SUPPORTED_FORMATS:
        return False
    
    if file.filename:
        file_ext = Path(file.filename).suffix.lower()
        allowed_extensions = SUPPORTED_FORMATS[file.content_type]
        if file_ext not in allowed_extensions:
            return False
    
    return True

def estimate_key(chroma: np.ndarray) -> str:
    """Estimer la tonalité à partir du chroma"""
    major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
    minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
    
    chroma_mean = np.mean(chroma, axis=1)
    
    major_corr = []
    minor_corr = []
    
    for i in range(12):
        major_corr.append(np.corrcoef(chroma_mean, np.roll(major_profile, i))[0, 1])
        minor_corr.append(np.corrcoef(chroma_mean, np.roll(minor_profile, i))[0, 1])
    
    major_max = np.max(major_corr)
    minor_max = np.max(minor_corr)
    
    keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    
    if major_max > minor_max:
        key_idx = np.argmax(major_corr)
        return f"{keys[key_idx]} Major"
    else:
        key_idx = np.argmax(minor_corr)
        return f"{keys[key_idx]} Minor"

def generate_binaural_beat(brainwave_type: str, duration: float, sample_rate: int) -> np.ndarray:
    """Générer un battement binaural"""
    brainwave_frequencies = {
        'delta': 2.0,
        'theta': 6.0,
        'alpha': 10.0,
        'beta': 20.0,
        'gamma': 40.0
    }
    
    carrier_frequency = 200.0
    beat_frequency = brainwave_frequencies[brainwave_type]
    
    t = np.linspace(0, duration, int(duration * sample_rate))
    
    left_freq = carrier_frequency
    right_freq = carrier_frequency + beat_frequency
    
    left_channel = np.sin(2 * np.pi * left_freq * t)
    right_channel = np.sin(2 * np.pi * right_freq * t)
    
    # Enveloppe pour éviter les clics
    fade_samples = int(0.1 * sample_rate)
    envelope = np.ones(len(t))
    if len(t) > 2 * fade_samples:
        envelope[:fade_samples] = np.linspace(0, 1, fade_samples)
        envelope[-fade_samples:] = np.linspace(1, 0, fade_samples)
    
    left_channel *= envelope
    right_channel *= envelope
    
    binaural_signal = (left_channel + right_channel) / 2
    return binaural_signal

@app.on_event("startup")
async def startup_event():
    """Nettoyage des anciens fichiers au démarrage"""
    current_time = time.time()
    max_age_seconds = 24 * 3600  # 24 heures
    
    for directory in [UPLOAD_DIR, PROCESSED_DIR]:
        if directory.exists():
            for file_path in directory.iterdir():
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > max_age_seconds:
                        try:
                            file_path.unlink()
                        except Exception:
                            pass

@app.get("/api/")
async def root():
    return {"message": "Harmonia Audio Processing API", "status": "running"}

@app.post("/api/upload", response_model=AudioAnalysisResponse)
async def upload_audio(file: UploadFile = File(...)):
    """Upload et analyse d'un fichier audio"""
    try:
        if not validate_audio_file(file):
            raise HTTPException(status_code=400, detail="Format de fichier non supporté")
        
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Analyse audio avec librosa
        y, sr = librosa.load(file_path, sr=44100)
        
        # Analyse du tempo (BPM)
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        
        # Analyse de la tonalité
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        key = estimate_key(chroma)
        
        duration = len(y) / sr
        channels = 1 if len(y.shape) == 1 else y.shape[0]
        
        return AudioAnalysisResponse(
            file_id=file_id,
            filename=file.filename,
            duration=duration,
            bpm=float(tempo),
            key=key,
            sample_rate=sr,
            channels=channels
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")

@app.post("/api/process/{file_id}")
async def process_audio(
    file_id: str,
    transformation: TransformationRequest,
    background_tasks: BackgroundTasks
):
    """Démarrer le traitement audio en arrière-plan"""
    try:
        file_path = None
        for file in UPLOAD_DIR.glob(f"{file_id}_*"):
            file_path = file
            break
        
        if not file_path:
            raise HTTPException(status_code=404, detail="Fichier non trouvé")
        
        task_id = str(uuid.uuid4())
        processing_tasks[task_id] = {
            "status": "processing",
            "progress": 0,
            "message": "Initialisation du traitement...",
            "file_id": file_id,
            "output_path": None
        }
        
        background_tasks.add_task(
            process_audio_background,
            task_id,
            file_path,
            transformation
        )
        
        return {"task_id": task_id, "status": "processing"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement: {str(e)}")

async def process_audio_background(task_id: str, file_path: Path, transformation: TransformationRequest):
    """Traitement audio en arrière-plan"""
    try:
        processing_tasks[task_id]["message"] = "Chargement de l'audio..."
        processing_tasks[task_id]["progress"] = 10
        
        # Chargement de l'audio
        y, sr = librosa.load(file_path, sr=44100)
        
        processing_tasks[task_id]["message"] = "Application des transformations..."
        processing_tasks[task_id]["progress"] = 30
        
        # Simulation du traitement (pour l'instant)
        # Dans une version complète, on utiliserait pyrubberband pour les transformations
        
        processing_tasks[task_id]["message"] = "Ajustement du tuning..."
        processing_tasks[task_id]["progress"] = 50
        
        # Simulation d'ajustement de tuning
        if transformation.tuning != 440:
            # Calcul du ratio de pitch
            pitch_ratio = transformation.tuning / 440.0
            # Pour l'instant, on garde l'audio original
            pass
        
        processing_tasks[task_id]["message"] = "Génération des battements binauraux..."
        processing_tasks[task_id]["progress"] = 70
        
        # Génération des battements binauraux
        if transformation.binaural_beat.enabled:
            duration = len(y) / sr
            binaural_audio = generate_binaural_beat(
                transformation.binaural_beat.type,
                duration,
                sr
            )
            # Mélange avec l'audio original
            min_length = min(len(y), len(binaural_audio))
            y = y[:min_length]
            binaural_audio = binaural_audio[:min_length]
            y = y + (transformation.binaural_beat.volume * binaural_audio)
            
            # Normalisation
            max_val = np.max(np.abs(y))
            if max_val > 1.0:
                y = y / max_val
        
        processing_tasks[task_id]["message"] = "Application de la fréquence thérapeutique..."
        processing_tasks[task_id]["progress"] = 90
        
        # Application de la fréquence thérapeutique
        duration = len(y) / sr
        t = np.linspace(0, duration, len(y))
        therapeutic_wave = 0.1 * np.sin(2 * np.pi * transformation.therapeutic_frequency * t)
        y = y * (1 + 0.05 * therapeutic_wave)
        
        # Sauvegarde du fichier traité
        output_filename = f"processed_{task_id}.wav"
        output_path = PROCESSED_DIR / output_filename
        sf.write(output_path, y, sr)
        
        processing_tasks[task_id]["status"] = "completed"
        processing_tasks[task_id]["progress"] = 100
        processing_tasks[task_id]["message"] = "Traitement terminé avec succès"
        processing_tasks[task_id]["output_path"] = str(output_path)
        
    except Exception as e:
        processing_tasks[task_id]["status"] = "error"
        processing_tasks[task_id]["message"] = f"Erreur: {str(e)}"

@app.get("/api/status/{task_id}", response_model=ProcessingStatusResponse)
async def get_processing_status(task_id: str):
    """Obtenir le statut d'un traitement"""
    if task_id not in processing_tasks:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    
    task = processing_tasks[task_id]
    return ProcessingStatusResponse(
        status=task["status"],
        progress=task["progress"],
        message=task.get("message"),
        error=task.get("error")
    )

@app.get("/api/download/{task_id}")
async def download_processed_audio(task_id: str):
    """Télécharger l'audio traité"""
    if task_id not in processing_tasks:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    
    task = processing_tasks[task_id]
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="Traitement non terminé")
    
    output_path = task["output_path"]
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Fichier traité non trouvé")
    
    return FileResponse(
        output_path,
        media_type="audio/wav",
        filename=f"harmonia_transformed_{task_id}.wav"
    )

@app.post("/api/export/{task_id}")
async def export_audio(task_id: str, export_settings: ExportRequest):
    """Exporter l'audio dans le format souhaité"""
    if task_id not in processing_tasks:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    
    task = processing_tasks[task_id]
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="Traitement non terminé")
    
    try:
        input_path = Path(task["output_path"])
        output_path = input_path.parent / f"{input_path.stem}_export.{export_settings.format}"
        
        if export_settings.format == "mp3":
            audio = AudioSegment.from_wav(input_path)
            bitrate = "320k" if export_settings.quality == "high" else "192k"
            audio.export(output_path, format="mp3", bitrate=bitrate)
        else:
            if export_settings.quality == "high":
                y, sr = librosa.load(input_path, sr=None)
                sf.write(output_path, y, sr, subtype='PCM_24')
            else:
                import shutil
                shutil.copy2(input_path, output_path)
        
        return FileResponse(
            output_path,
            media_type=f"audio/{export_settings.format}",
            filename=f"harmonia_export_{task_id}.{export_settings.format}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'export: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
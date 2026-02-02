import io
import json
import wave
from vosk import Model, KaldiRecognizer
import os

# Offline STT using Vosk (https://alphacephei.com/vosk/models)
# Download model: vosk-model-small-en-us-0.15 and place in ai-engine/models/vosk/

MODEL_PATH = "models/vosk/vosk-model-small-en-us-0.15"
_model_cache = None

def get_model():
    """Load and cache Vosk model once"""
    global _model_cache
    if _model_cache is None:
        if not os.path.exists(MODEL_PATH):
            print(f"[STT] Vosk model not found at {MODEL_PATH}, using mock mode")
            return None
        print(f"[STT] Loading Vosk model from {MODEL_PATH}...")
        _model_cache = Model(MODEL_PATH)
        print("[STT] Model loaded successfully")
    return _model_cache

def transcribe_wav_bytes(wav_bytes: bytes) -> str:
    """
    Transcribe WAV audio bytes using Vosk.
    Expects 16kHz mono PCM WAV format.
    """
    model = get_model()
    if model is None:
        # Fallback: return mock transcription for testing when model not available
        return "This is a test response about polymorphism in object oriented programming and encapsulation"
    model = get_model()
    if model is None:
        # Fallback: return mock transcription for testing when model not available
        return "This is a test response about polymorphism in object oriented programming and encapsulation"
    
    try:
        buf = io.BytesIO(wav_bytes)
        with wave.open(buf, 'rb') as wf:
            if wf.getnchannels() != 1 or wf.getsampwidth() != 2:
                return "[Audio must be mono PCM 16-bit]"
            
            rec = KaldiRecognizer(model, wf.getframerate())
            rec.SetWords(True)
            
            text_parts = []
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                if rec.AcceptWaveform(data):
                    result = json.loads(rec.Result())
                    text_parts.append(result.get("text", ""))
            
            final_result = json.loads(rec.FinalResult())
            text_parts.append(final_result.get("text", ""))
            
            return " ".join(text_parts).strip()
    except Exception as e:
        print(f"[STT] Transcription error: {e}")
        return "Error during transcription"


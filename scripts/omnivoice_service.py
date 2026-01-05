"""
OmniVoice TTS Microservice for LawOh Legal Platform
Powered by k2-fsa/OmniVoice Multilingual Speech Synthesis
"""

import io
import os
import sys
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

app = FastAPI(
    title="LawOh OmniVoice TTS Engine",
    description="Microservice providing high-fidelity Vietnamese text-to-speech for legal news & articles",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
model = None
device = "cpu"

def load_omnivoice():
    global model, device
    try:
        import torch
        from omnivoice import OmniVoice
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[OmniVoice] Loading model on device: {device}...")
        model = OmniVoice.from_pretrained("k2-fsa/OmniVoice")
        print("[OmniVoice] Model loaded successfully!")
    except Exception as e:
        print(f"[OmniVoice] Note: Could not pre-load model ({e}). Will load on first request or fallback.")

class TTSPayload(BaseModel):
    text: str
    language: Optional[str] = "vi"
    gender: Optional[str] = "male" # "male" | "female"
    voice: Optional[str] = "vi-VN-NamMinhNeural"
    speed: Optional[float] = 1.0

@app.on_event("startup")
async def startup_event():
    load_omnivoice()

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "engine": "OmniVoice (k2-fsa)",
        "device": device,
        "model_loaded": model is not None,
        "languages": ["vi", "en"]
    }

@app.post("/v1/tts")
async def generate_speech(payload: TTSPayload):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Văn bản không được để trống")

    cleaned_text = payload.text.strip()
    lang = payload.language or "vi"
    gender = payload.gender or ("male" if "Nam" in (payload.voice or "") else "female")

    try:
        import torch
        import torchaudio
        global model

        if model is None:
            from omnivoice import OmniVoice
            model = OmniVoice.from_pretrained("k2-fsa/OmniVoice")

        # Select speaker design attributes for Vietnamese
        # Voice Design configuration: Male newscaster vs Female announcer
        speaker_prompt = (
            "A calm, authoritative male legal newscaster with standard Vietnamese accent."
            if gender == "male"
            else "A clear, articulate female legal commentator with natural Vietnamese intonation."
        )

        wav_tensor = model.generate(
            text=cleaned_text,
            language=lang,
            voice_prompt=speaker_prompt,
        )

        buffer = io.BytesIO()
        torchaudio.save(buffer, wav_tensor, sample_rate=24000, format="wav")
        buffer.seek(0)
        audio_bytes = buffer.read()

        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={
                "Content-Type": "audio/wav",
                "Cache-Control": "public, max-age=86400",
                "X-TTS-Engine": "OmniVoice-k2-fsa",
                "X-TTS-Gender": gender,
            }
        )
    except Exception as e:
        print(f"[OmniVoice Synthesis Error] {e}")
        raise HTTPException(status_code=500, detail=f"OmniVoice synthesis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting LawOh OmniVoice Service on http://127.0.0.1:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

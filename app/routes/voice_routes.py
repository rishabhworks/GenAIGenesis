import logging
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from app.services.elevenlabs_stt_service import ElevenLabsSTTService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/workers", tags=["workers"])

# Initialize services
stt_service = ElevenLabsSTTService()


class STTResponse(BaseModel):
    text: str


@router.post("/speech-to-text", response_model=STTResponse)
async def speech_to_text(file: UploadFile = File(...)):
    """
    Convert speech audio to text using ElevenLabs STT.

    - **file**: Audio file (wav, mp3, m4a, webm, ogg, flac)
    Returns: Transcribed text
    """
    allowed_extensions = {".wav", ".mp3", ".m4a", ".webm", ".ogg", ".flac"}
    ext = "." + (file.filename or "audio.wav").rsplit(".", 1)[-1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    try:
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        transcript = stt_service.transcribe(tmp_path)
        return STTResponse(text=transcript)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        logger.error(f"STT failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

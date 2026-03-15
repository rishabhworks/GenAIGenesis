import logging
import httpx
from pathlib import Path
from app.config import settings

logger = logging.getLogger(__name__)


class ElevenLabsSTTService:
    """Speech-to-Text using ElevenLabs API"""

    API_URL = "https://api.elevenlabs.io/v1/speech-to-text"

    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        if not self.api_key:
            logger.warning("ELEVENLABS_API_KEY not set – STT will be unavailable")

    def transcribe(self, audio_path: str, language_code: str = "en") -> str:
        """
        Send an audio file to ElevenLabs STT and return the transcript.

        Args:
            audio_path: Local path to an audio file (wav, mp3, m4a, webm, etc.)
            language_code: ISO-639-1 language code (default "en")

        Returns:
            Transcribed text string.
        """
        if not self.api_key:
            raise RuntimeError("ElevenLabs API key is not configured")

        file_path = Path(audio_path)
        if not file_path.exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        # Determine MIME type from extension
        mime_map = {
            ".wav": "audio/wav",
            ".mp3": "audio/mpeg",
            ".m4a": "audio/mp4",
            ".webm": "audio/webm",
            ".ogg": "audio/ogg",
            ".flac": "audio/flac",
        }
        mime = mime_map.get(file_path.suffix.lower(), "application/octet-stream")

        with open(file_path, "rb") as f:
            files = {"file": (file_path.name, f, mime)}
            data = {"model_id": "scribe_v1", "language_code": language_code}
            headers = {"xi-api-key": self.api_key}

            response = httpx.post(
                self.API_URL,
                headers=headers,
                files=files,
                data=data,
                timeout=60.0,
            )

        if response.status_code != 200:
            logger.error(f"ElevenLabs STT error {response.status_code}: {response.text}")
            raise RuntimeError(f"ElevenLabs STT failed ({response.status_code}): {response.text}")

        result = response.json()
        transcript = result.get("text", "")
        logger.info(f"ElevenLabs STT transcribed {len(transcript)} chars from {file_path.name}")
        return transcript

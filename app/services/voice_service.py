import logging
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

class VoiceService:
    """Service for converting voice/audio to text using ElevenLabs (primary) or Gemini (fallback)"""
    
    def __init__(self):
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            logger.info("Google Gemini API client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API: {e}")

    async def transcribe_with_elevenlabs(self, audio_data: bytes, audio_format: str = "webm") -> dict:
        """
        Transcribe audio using ElevenLabs Speech-to-Text API (primary)
        Falls back to Gemini if ElevenLabs fails
        """
        try:
            from elevenlabs.client import ElevenLabs
            import io

            client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)

            audio_stream = io.BytesIO(audio_data)
            audio_stream.name = f"audio.{audio_format}"

            result = client.speech_to_text.convert(
                file=audio_stream,
                model_id="scribe_v1",
                tag_audio_events=False,
                language_code="en"
            )

            transcript = result.text.strip() if result.text else ""

            if transcript:
                logger.info(f"ElevenLabs transcription successful: {len(transcript)} chars")
                return {
                    "transcript": transcript,
                    "confidence": 0.97,
                    "status": "success"
                }
            else:
                return {"transcript": "", "confidence": 0, "status": "no_results"}

        except Exception as e:
            logger.error(f"ElevenLabs transcription failed: {e}")
            logger.info("Falling back to Gemini STT")
            return await self.transcribe_audio(audio_data, audio_format)

    async def transcribe_audio(self, audio_data: bytes, audio_format: str = "wav") -> dict:
        """
        Transcribe audio to text using Gemini API (fallback)
        """
        try:
            mime_type_map = {
                "wav": "audio/wav",
                "mp3": "audio/mpeg",
                "flac": "audio/flac",
                "opus": "audio/ogg",
                "webm": "audio/webm",
                "m4a": "audio/mp4"
            }

            mime_type = mime_type_map.get(audio_format.lower(), "audio/wav")

            from pathlib import Path
            import tempfile

            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{audio_format.lower()}") as temp_file:
                temp_file.write(audio_data)
                temp_path = temp_file.name

            audio_file = genai.upload_file(
                path=temp_path,
                mime_type=mime_type
            )

            model = genai.GenerativeModel(model_name=settings.GEMINI_MODEL)
            response = model.generate_content(
                [
                    audio_file,
                    "Please transcribe this audio accurately. Return ONLY the transcribed text, nothing else."
                ]
            )

            transcript = response.text.strip() if response.text else ""

            genai.delete_file(audio_file.name)
            Path(temp_path).unlink()

            if transcript:
                logger.info(f"Gemini transcription successful: {len(transcript)} chars")
                return {
                    "transcript": transcript,
                    "confidence": 0.95,
                    "status": "success"
                }
            else:
                return {"transcript": "", "confidence": 0, "status": "no_results"}

        except Exception as e:
            logger.error(f"Gemini transcription failed: {e}")
            return {
                "transcript": "",
                "confidence": 0,
                "status": "error",
                "error": str(e)
            }

    async def transcribe_from_file(self, file_path: str) -> dict:
        """
        Transcribe audio from file path using ElevenLabs (primary) or Gemini (fallback)
        """
        try:
            audio_format = file_path.split('.')[-1].lower()

            with open(file_path, 'rb') as audio_file:
                audio_data = audio_file.read()

            return await self.transcribe_with_elevenlabs(audio_data, audio_format)

        except FileNotFoundError:
            logger.error(f"Audio file not found: {file_path}")
            return {"transcript": "", "confidence": 0, "status": "file_not_found"}
        except Exception as e:
            logger.error(f"Failed to transcribe file: {e}")
            return {"transcript": "", "confidence": 0, "status": "error", "error": str(e)}
import logging
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

class VoiceService:
    """Service for converting voice/audio to text using Google Gemini API"""
    
    def __init__(self):
        """Initialize Gemini client"""
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            logger.info("Google Gemini API client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API: {e}")
            raise
    
    async def transcribe_audio(self, audio_data: bytes, audio_format: str = "wav") -> dict:
        """
        Transcribe audio to text using Gemini API
        
        Args:
            audio_data: Raw audio bytes
            audio_format: Audio format (wav, mp3, flac, opus, etc.)
        
        Returns:
            dict with transcript and confidence
        """
        try:
            # Map format to MIME type
            mime_type_map = {
                "wav": "audio/wav",
                "mp3": "audio/mpeg",
                "flac": "audio/flac",
                "opus": "audio/ogg",
                "webm": "audio/webm",
                "m4a": "audio/mp4"
            }
            
            mime_type = mime_type_map.get(audio_format.lower(), "audio/wav")
            
            # Create file from bytes
            from pathlib import Path
            import tempfile
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{audio_format.lower()}") as temp_file:
                temp_file.write(audio_data)
                temp_path = temp_file.name
            
            # Upload file to Gemini
            audio_file = genai.upload_file(
                path=temp_path,
                mime_type=mime_type
            )
            
            # Use model to transcribe
            model = genai.GenerativeModel(model_name=settings.GEMINI_MODEL)
            response = model.generate_content(
                [
                    audio_file,
                    "Please transcribe this audio accurately. Return ONLY the transcribed text, nothing else."
                ]
            )
            
            transcript = response.text.strip() if response.text else ""
            
            # Clean up
            genai.delete_file(audio_file.name)
            Path(temp_path).unlink()
            
            if transcript:
                logger.info(f"Transcription successful. Text length: {len(transcript)} characters")
                return {
                    "transcript": transcript,
                    "confidence": 0.95,  # Gemini doesn't return confidence score
                    "status": "success"
                }
            else:
                logger.warning("No transcription results found")
                return {
                    "transcript": "",
                    "confidence": 0,
                    "status": "no_results"
                }
                
        except Exception as e:
            logger.error(f"Audio transcription failed: {e}")
            return {
                "transcript": "",
                "confidence": 0,
                "status": "error",
                "error": str(e)
            }
    
    async def transcribe_from_file(self, file_path: str) -> dict:
        """
        Transcribe audio from file
        
        Args:
            file_path: Path to audio file
        
        Returns:
            dict with transcript and confidence
        """
        try:
            # Detect format from file extension
            audio_format = file_path.split('.')[-1].lower()
            
            with open(file_path, 'rb') as audio_file:
                audio_data = audio_file.read()
            
            return await self.transcribe_audio(audio_data, audio_format)
            
        except FileNotFoundError:
            logger.error(f"Audio file not found: {file_path}")
            return {
                "transcript": "",
                "confidence": 0,
                "status": "file_not_found"
            }
        except Exception as e:
            logger.error(f"Failed to transcribe file: {e}")
            return {
                "transcript": "",
                "confidence": 0,
                "status": "error",
                "error": str(e)
            }


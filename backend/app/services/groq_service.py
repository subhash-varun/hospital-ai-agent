"""
Groq AI service for STT, LLM, and TTS
"""
from groq import Groq
import aiohttp
from ..config import settings
import logging
import io
import base64

logger = logging.getLogger(__name__)

logger = logging.getLogger(__name__)


class GroqService:
    """Service for interacting with Groq API"""
    
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.stt_model = settings.STT_MODEL
        self.llm_model = settings.LLM_MODEL
        
        # TTS configuration
        self.elevenlabs_api_key = settings.ELEVENLABS_API_KEY
        self.elevenlabs_voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel voice (warm, professional)
        
    async def transcribe_audio(self, audio_file) -> str:
        """
        Transcribe audio to text using Groq Whisper
        
        Args:
            audio_file: Audio file object or path
            
        Returns:
            Transcribed text
        """
        try:
            transcription = self.client.audio.transcriptions.create(
                file=audio_file,
                model=self.stt_model,
                response_format="text"
            )
            return transcription
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            raise
    
    async def generate_response(self, messages: list, temperature: float = 0.7) -> str:
        """
        Generate AI response using Groq LLM
        
        Args:
            messages: List of message dictionaries with role and content
            temperature: Sampling temperature (0-2)
            
        Returns:
            Generated text response
        """
        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.llm_model,
                temperature=temperature,
                max_tokens=1024
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise
    
    async def generate_speech(self, text: str) -> str:
        """
        Generate speech audio from text using ElevenLabs TTS

        Args:
            text: Text to convert to speech

        Returns:
            Base64 encoded audio data
        """
        try:
            async with aiohttp.ClientSession() as session:
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.elevenlabs_voice_id}"

                payload = {
                    "text": text,
                    "model_id": "eleven_flash_v2_5",  # Free tier model
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.8,
                        "style": 0.0,
                        "use_speaker_boost": True
                    }
                }

                headers = {
                    "Accept": "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": self.elevenlabs_api_key
                }

                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        audio_data = await response.read()
                        logger.info(f"Audio data type: {type(audio_data)}, length: {len(audio_data)}")
                        # Return raw audio bytes
                        return audio_data
                    else:
                        error_text = await response.text()
                        logger.error(f"ElevenLabs TTS API error: {response.status} - {error_text}")
                        raise Exception(f"TTS API error: {response.status}")

        except Exception as e:
            logger.error(f"Error generating speech: {e}")
            raise
    
    async def triage_symptoms(self, symptoms: str) -> dict:
        """
        Analyze symptoms and provide triage recommendation
        
        Args:
            symptoms: Patient's described symptoms
            
        Returns:
            Dictionary with severity, advice, and recommendation
        """
        system_prompt = """You are a medical triage AI assistant for a hospital. 
Your role is to:
1. Assess symptom severity (low, moderate, high, emergency)
2. Provide appropriate home care advice for minor issues
3. Recommend whether an appointment is needed
4. Be empathetic and professional

Respond in JSON format:
{
    "severity": "low|moderate|high|emergency",
    "advice": "Home care advice or immediate action needed",
    "needs_appointment": true/false,
    "urgency": "routine|urgent|immediate",
    "department": "suggested department if appointment needed"
}"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Patient symptoms: {symptoms}"}
        ]
        
        try:
            response = await self.generate_response(messages, temperature=0.3)
            # Parse JSON response
            import json
            return json.loads(response)
        except Exception as e:
            logger.error(f"Error in symptom triage: {e}")
            # Return safe default
            return {
                "severity": "moderate",
                "advice": "Please consult with a healthcare provider.",
                "needs_appointment": True,
                "urgency": "routine",
                "department": "General Medicine"
            }
    
    async def generate_conversation_response(self, conversation_history: list) -> str:
        """
        Generate conversational response for voice interaction
        
        Args:
            conversation_history: List of previous messages
            
        Returns:
            Generated response text
        """
        system_prompt = """You are a friendly and professional hospital receptionist AI.
Your goals:
- Greet patients warmly
- Ask about their symptoms clearly
- Provide helpful advice
- Offer to schedule appointments when needed
- Be concise (2-3 sentences max per response)
- Show empathy and professionalism"""
        
        messages = [{"role": "system", "content": system_prompt}] + conversation_history
        
        return await self.generate_response(messages, temperature=0.8)


# Global instance
groq_service = GroqService()

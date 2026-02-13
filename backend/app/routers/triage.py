"""
API routes for AI-powered symptom triage
"""
from fastapi import APIRouter, HTTPException, status
from ..schemas import (
    TriageRequest,
    TriageResponse,
    ConversationRequest,
    ConversationResponse
)
from ..services import groq_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/triage", tags=["triage"])


@router.post("/analyze", response_model=TriageResponse)
async def analyze_symptoms(request: TriageRequest):
    """
    Analyze patient symptoms and provide triage recommendation
    """
    try:
        result = await groq_service.triage_symptoms(request.symptoms)
        
        return TriageResponse(
            severity=result["severity"],
            advice=result["advice"],
            needs_appointment=result["needs_appointment"],
            urgency=result["urgency"],
            department=result["department"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze symptoms: {str(e)}"
        )


@router.post("/conversation")
async def handle_conversation(request: ConversationRequest):
    """
    Handle conversational interaction with the AI assistant
    """
    try:
        # Convert Pydantic models to dictionaries
        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages
        ]
        
        response_text = await groq_service.generate_conversation_response(messages)
        
        # Generate audio if TTS is enabled
        audio_data = None
        if request.enable_tts:
            try:
                audio_bytes = await groq_service.generate_speech(response_text)
                logger.info(f"Audio bytes type: {type(audio_bytes)}, length: {len(audio_bytes) if audio_bytes else 0}")
                # Convert to base64 for JSON response
                import base64
                audio_data = base64.b64encode(audio_bytes).decode('utf-8')
                logger.info(f"Base64 audio data length: {len(audio_data)}")
            except Exception as e:
                logger.warning(f"TTS failed, continuing without audio: {e}")
        
        return {
            "response": response_text,
            "message_count": len(messages) + 1,
            "audio_data": audio_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate conversation response: {str(e)}"
        )

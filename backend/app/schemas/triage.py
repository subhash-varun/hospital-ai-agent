"""
Pydantic schemas for symptom triage
"""
from pydantic import BaseModel
from typing import Literal, Optional


class TriageRequest(BaseModel):
    """Schema for triage request"""
    symptoms: str
    patient_name: str
    patient_phone: str


class TriageResponse(BaseModel):
    """Schema for triage response"""
    severity: Literal["low", "moderate", "high", "emergency"]
    advice: str
    needs_appointment: bool
    urgency: Literal["routine", "urgent", "immediate"]
    department: str


class ConversationMessage(BaseModel):
    """Schema for conversation message"""
    role: Literal["user", "assistant", "system"]
    content: str


class ConversationRequest(BaseModel):
    """Schema for conversation request"""
    messages: list[ConversationMessage]
    enable_tts: bool = False


class ConversationResponse(BaseModel):
    """Schema for conversation response"""
    response: str
    message_count: int
    audio_data: Optional[bytes] = None

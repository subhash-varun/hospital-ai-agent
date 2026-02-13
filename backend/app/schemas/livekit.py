"""
Pydantic schemas for LiveKit operations
"""
from pydantic import BaseModel
from typing import Optional


class TokenRequest(BaseModel):
    """Schema for token generation request"""
    identity: str
    room_name: str
    name: Optional[str] = None
    metadata: Optional[str] = None


class TokenResponse(BaseModel):
    """Schema for token generation response"""
    token: str
    room_name: str
    url: str
    identity: str


class RoomInfo(BaseModel):
    """Schema for room information"""
    sid: Optional[str] = None
    name: str
    num_participants: Optional[int] = 0
    creation_time: Optional[int] = None
    max_participants: Optional[int] = 10


class PatientCallRequest(BaseModel):
    """Schema for initiating patient call"""
    patient_id: str
    patient_name: Optional[str] = None


class PatientCallResponse(BaseModel):
    """Schema for patient call response"""
    token: str
    room_name: str
    url: str
    message: str

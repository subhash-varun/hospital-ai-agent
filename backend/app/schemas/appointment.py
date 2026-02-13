"""
Pydantic schemas for appointments
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from ..models import AppointmentStatus, AppointmentType


class AppointmentBase(BaseModel):
    """Base appointment schema"""
    patient_name: str = Field(..., min_length=1, max_length=255)
    patient_phone: str = Field(..., min_length=10, max_length=20)
    patient_email: Optional[EmailStr] = None
    symptoms: Optional[str] = None
    appointment_type: AppointmentType = AppointmentType.GENERAL
    appointment_date: datetime
    doctor_name: Optional[str] = None
    department: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    """Schema for creating an appointment"""
    pass


class AppointmentUpdate(BaseModel):
    """Schema for updating an appointment"""
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None
    patient_email: Optional[EmailStr] = None
    symptoms: Optional[str] = None
    triage_notes: Optional[str] = None
    appointment_type: Optional[AppointmentType] = None
    appointment_date: Optional[datetime] = None
    status: Optional[AppointmentStatus] = None
    doctor_name: Optional[str] = None
    department: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    """Schema for appointment response"""
    id: int
    status: AppointmentStatus
    triage_notes: Optional[str] = None
    ai_recommendation: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    livekit_room_name: Optional[str] = None
    call_duration_seconds: Optional[int] = None
    
    class Config:
        from_attributes = True


class AvailableSlotsRequest(BaseModel):
    """Schema for requesting available slots"""
    date: datetime
    duration_minutes: int = Field(default=30, ge=15, le=120)


class AvailableSlotsResponse(BaseModel):
    """Schema for available slots response"""
    date: datetime
    available_slots: list[datetime]
    total_slots: int

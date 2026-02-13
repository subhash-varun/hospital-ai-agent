"""
Schemas package
"""
from .appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AvailableSlotsRequest,
    AvailableSlotsResponse
)
from .triage import (
    TriageRequest,
    TriageResponse,
    ConversationRequest,
    ConversationResponse
)

__all__ = [
    "AppointmentCreate",
    "AppointmentUpdate",
    "AppointmentResponse",
    "AvailableSlotsRequest",
    "AvailableSlotsResponse",
    "TriageRequest",
    "TriageResponse",
    "ConversationRequest",
    "ConversationResponse"
]

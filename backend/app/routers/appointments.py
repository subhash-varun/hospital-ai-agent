"""
API routes for appointment management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import AppointmentStatus
from ..schemas import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AvailableSlotsRequest,
    AvailableSlotsResponse
)
from ..services import appointment_service

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db)
):
    """Create a new appointment"""
    try:
        appointment_dict = appointment.model_dump()
        created_appointment = appointment_service.create_appointment(db, appointment_dict)
        return created_appointment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create appointment: {str(e)}"
        )


@router.get("", response_model=List[AppointmentResponse])
async def list_appointments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[AppointmentStatus] = None,
    db: Session = Depends(get_db)
):
    """List all appointments with optional filtering"""
    appointments = appointment_service.get_appointments(db, skip, limit, status)
    return appointments


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific appointment by ID"""
    appointment = appointment_service.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment {appointment_id} not found"
        )
    return appointment


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    appointment_update: AppointmentUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing appointment"""
    try:
        update_data = appointment_update.model_dump(exclude_unset=True)
        updated_appointment = appointment_service.update_appointment(
            db, appointment_id, update_data
        )
        return updated_appointment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update appointment: {str(e)}"
        )


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db)
):
    """Cancel an appointment"""
    try:
        appointment_service.cancel_appointment(db, appointment_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel appointment: {str(e)}"
        )


@router.post("/available-slots", response_model=AvailableSlotsResponse)
async def get_available_slots(
    request: AvailableSlotsRequest,
    db: Session = Depends(get_db)
):
    """Get available appointment slots for a specific date"""
    try:
        slots = appointment_service.get_available_slots(
            db,
            request.date,
            request.duration_minutes
        )
        return AvailableSlotsResponse(
            date=request.date,
            available_slots=slots,
            total_slots=len(slots)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available slots: {str(e)}"
        )

"""
API routes for LiveKit voice call operations
"""
from fastapi import APIRouter, HTTPException, status
from ..schemas import (
    TokenRequest,
    TokenResponse,
    RoomInfo,
    PatientCallRequest,
    PatientCallResponse
)
from ..services import livekit_service

router = APIRouter(prefix="/api/livekit", tags=["livekit"])


@router.post("/token", response_model=TokenResponse)
async def generate_token(request: TokenRequest):
    """Generate LiveKit access token for a participant"""
    try:
        token = livekit_service.generate_token(
            identity=request.identity,
            room_name=request.room_name,
            name=request.name,
            metadata=request.metadata
        )
        
        return TokenResponse(
            token=token,
            room_name=request.room_name,
            url=livekit_service.url,
            identity=request.identity
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate token: {str(e)}"
        )


@router.post("/room", response_model=RoomInfo)
async def create_room(room_name: str, empty_timeout: int = 300):
    """Create a new LiveKit room"""
    try:
        room = await livekit_service.create_room(room_name, empty_timeout)
        return RoomInfo(**room)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create room: {str(e)}"
        )


@router.get("/rooms", response_model=list[RoomInfo])
async def list_rooms():
    """List all active LiveKit rooms"""
    try:
        rooms = await livekit_service.list_rooms()
        return [RoomInfo(**room) for room in rooms]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list rooms: {str(e)}"
        )


@router.delete("/room/{room_name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(room_name: str):
    """Delete a LiveKit room"""
    try:
        await livekit_service.delete_room(room_name)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete room: {str(e)}"
        )


@router.post("/patient-call", response_model=PatientCallResponse)
async def initiate_patient_call(request: PatientCallRequest):
    """
    Initiate a voice call for a patient
    Returns token and room information for the patient to join
    """
    try:
        call_info = livekit_service.generate_patient_token(request.patient_id)
        
        return PatientCallResponse(
            token=call_info["token"],
            room_name=call_info["room_name"],
            url=call_info["url"],
            message=f"Call initiated for patient {request.patient_name or request.patient_id}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate patient call: {str(e)}"
        )


@router.options("/patient-call")
async def patient_call_options():
    """Handle OPTIONS preflight request for patient-call endpoint"""
    return {"message": "OK"}

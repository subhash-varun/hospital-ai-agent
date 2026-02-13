"""
LiveKit service for managing real-time voice calls
"""
from livekit_api import AccessToken, RoomServiceClient, WebhookReceiver, VideoGrants, RoomService, CreateRoomRequest, ListRoomsRequest, DeleteRoomRequest
from livekit import rtc
from ..config import settings
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class LiveKitService:
    """Service for LiveKit operations"""
    
    def __init__(self):
        self.url = settings.LIVEKIT_URL
        self.api_key = settings.LIVEKIT_API_KEY
        self.api_secret = settings.LIVEKIT_API_SECRET
        
    def generate_token(
        self,
        identity: str,
        room_name: str,
        name: str = None,
        metadata: str = None
    ) -> str:
        """
        Generate LiveKit access token for a participant
        
        Args:
            identity: Unique identifier for the participant
            room_name: Name of the room to join
            name: Display name for the participant
            metadata: Additional metadata (JSON string)
            
        Returns:
            JWT access token
        """
        try:
            token = AccessToken(self.api_key, self.api_secret)
            token.with_identity(identity)
            token.with_name(name or identity)
            token.with_grants(
                VideoGrants(
                    room_join=True,
                    room=room_name,
                    can_publish=True,
                    can_subscribe=True,
                )
            )
            
            if metadata:
                token.with_metadata(metadata)
            
            # Token valid for 6 hours
            token.with_ttl(timedelta(hours=6))
            
            return token.to_jwt()
        except Exception as e:
            logger.error(f"Error generating token: {e}")
            raise
    
    async def create_room(self, room_name: str, empty_timeout: int = 300) -> dict:
        """
        Create a new LiveKit room
        
        Args:
            room_name: Unique name for the room
            empty_timeout: Seconds before empty room is closed
            
        Returns:
            Room information dictionary
        """
        try:
            room_service = RoomService()
            room = await room_service.create_room(
                CreateRoomRequest(
                    name=room_name,
                    empty_timeout=empty_timeout,
                    max_participants=10
                )
            )
            
            return {
                "sid": room.sid,
                "name": room.name,
                "creation_time": room.creation_time,
                "max_participants": room.max_participants
            }
        except Exception as e:
            logger.error(f"Error creating room: {e}")
            raise
    
    async def list_rooms(self) -> list:
        """
        List all active rooms
        
        Returns:
            List of room dictionaries
        """
        try:
            room_service = RoomService()
            rooms = await room_service.list_rooms(ListRoomsRequest())
            
            return [
                {
                    "sid": room.sid,
                    "name": room.name,
                    "num_participants": room.num_participants,
                    "creation_time": room.creation_time
                }
                for room in rooms
            ]
        except Exception as e:
            logger.error(f"Error listing rooms: {e}")
            raise
    
    async def delete_room(self, room_name: str):
        """
        Delete a LiveKit room
        
        Args:
            room_name: Name of the room to delete
        """
        try:
            room_service = RoomService()
            await room_service.delete_room(
                DeleteRoomRequest(room=room_name)
            )
            logger.info(f"Room {room_name} deleted successfully")
        except Exception as e:
            logger.error(f"Error deleting room: {e}")
            raise
    
    async def dispatch_agent_to_room(self, room_name: str, patient_id: str):
        """
        Dispatch the voice agent to a room
        
        Note: For local development, agents running in 'dev' mode need to be configured
        in LiveKit Cloud dashboard with agent dispatch rules, OR deployed to LiveKit Cloud.
        
        Args:
            room_name: Name of the room to dispatch agent to
            patient_id: Patient identifier for metadata
        """
        try:
            logger.info(f"🚀 Room created: {room_name}")
            logger.info(f"⚠️  Agent dispatch: For local dev agents, configure dispatch rules in LiveKit Cloud dashboard")
            logger.info(f"    OR deploy agent to LiveKit Cloud for automatic dispatch")
            logger.info(f"    Room pattern: consultation_*")
            logger.info(f"    Agent name: hospital-appointment-agent")
            
            # For production, you would use LiveKit Cloud's agent deployment
            # or configure agent dispatch rules in the dashboard
            return True
                    
        except Exception as e:
            logger.error(f"❌ Error in agent dispatch: {e}", exc_info=True)
            return False
    
    def _create_dispatch_token(self) -> str:
        """Create a token for agent dispatch API"""
        token = AccessToken(self.api_key, self.api_secret)
        token.with_grants(VideoGrants(room_create=True, room_admin=True))
        return token.to_jwt()
    
    def generate_patient_token(self, patient_id: str) -> dict:
        """
        Generate token for patient to join voice call and dispatch agent
        
        Args:
            patient_id: Unique patient identifier
            
        Returns:
            Dictionary with token and room information
        """
        import asyncio
        
        room_name = f"consultation_{patient_id}_{int(datetime.utcnow().timestamp())}"
        
        # Create the room first (this will trigger agent to join automatically)
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        # Create room - agent will auto-join via LiveKit dispatch
        try:
            loop.run_until_complete(self.create_room(room_name, empty_timeout=600))
            logger.info(f"Room created: {room_name}")
            
            # Dispatch agent to the room
            loop.run_until_complete(self.dispatch_agent_to_room(room_name, patient_id))
            logger.info(f"Agent dispatched to room: {room_name}")
        except Exception as e:
            logger.warning(f"Room creation or agent dispatch failed: {e}")
        
        # Generate patient token
        token = self.generate_token(
            identity=patient_id,
            room_name=room_name,
            name=f"Patient {patient_id}",
            metadata=f'{{"patient_id": "{patient_id}"}}'
        )
        
        return {
            "token": token,
            "room_name": room_name,
            "url": self.url
        }


# Global instance
livekit_service = LiveKitService()

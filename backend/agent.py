"""
LiveKit Agent for Hospital Appointment Booking
Refactored to match working LiveKit sample architecture
"""
import logging
import os
import sys
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    room_io,
)
from livekit.plugins import (
    groq,
    cartesia,
    silero,
    noise_cancellation,
)

# Load environment variables
load_dotenv()

logger = logging.getLogger("hospital-appointment-agent")
logger.setLevel(logging.INFO)


class HospitalAppointmentAgent(Agent):
    """AI Agent for handling patient appointment bookings via voice"""
    
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are a friendly, professional AI receptionist for a hospital appointment booking system.

# Your Role
- Help patients book medical appointments efficiently
- Conduct symptom triage to determine urgency
- Collect patient information (name, phone, symptoms)
- Recommend appropriate departments and doctors
- Schedule appointments based on availability
- Be empathetic, clear, and reassuring

# Conversation Flow
1. Greet the patient warmly
2. Ask for their name and contact information
3. Inquire about their symptoms or reason for visit
4. Assess severity and urgency
5. Suggest appropriate department (e.g., Cardiology, Neurology, General Medicine)
6. Offer available appointment slots
7. Confirm booking details
8. Provide appointment confirmation

# Output Rules (Voice Interaction)
- Speak in plain text only - no markdown, JSON, or formatting
- Keep responses brief: 1-3 sentences max
- Ask one question at a time
- Spell out numbers, dates, and times clearly (e.g., "February fifteenth at two PM")
- Use natural, conversational language
- Be warm and empathetic
- Avoid medical jargon - use simple terms

# Symptom Triage Guidelines
- **Emergency symptoms** (chest pain, difficulty breathing, severe bleeding): 
  Advise immediate emergency room visit
- **Urgent symptoms** (high fever, severe pain): 
  Offer same-day or next-day appointment
- **Routine symptoms** (mild cold, check-up): 
  Schedule within 3-7 days

# Example Conversation
Agent: "Hello! Welcome to our hospital appointment system. I'm here to help you schedule an appointment. May I have your name please?"
Patient: "John Smith"
Agent: "Thank you, John. What brings you in today? Please describe your symptoms."
Patient: "I've been having headaches for three days"
Agent: "I understand. How would you rate the pain, and have you experienced any other symptoms like dizziness or vision changes?"

# Privacy & Safety
- Collect only necessary information
- Remind patients this is not emergency medical advice
- For severe symptoms, direct to emergency services immediately
- Maintain professional boundaries""",
        )

    async def on_enter(self):
        """Called when agent enters the room - initial greeting"""
        await self.session.generate_reply(
            instructions="""Greet the patient warmly and introduce yourself as the hospital appointment assistant. 
            Ask for their name to begin the appointment booking process.""",
            allow_interruptions=True,
        )

    async def on_user_speech(self, text: str):
        """Called when user speech is transcribed"""
        logger.info(f"Patient said: {text}")
        # You can add custom logic here to save transcripts to database


# Create agent server  
server = AgentServer()


def prewarm(proc: JobProcess):
    """Preload models for faster response times"""
    proc.userdata["vad"] = silero.VAD.load()
    logger.info("VAD model preloaded")


server.setup_fnc = prewarm


@server.rtc_session(agent_name="hospital-appointment-agent")
async def entrypoint(ctx: JobContext):
    """
    Main entrypoint for the LiveKit agent session
    Configures STT, LLM, TTS, and voice activity detection
    """
    logger.info(f"🎯 AGENT ENTRYPOINT CALLED - Starting agent session for room: {ctx.room.name}")
    logger.info(f"🎯 Room participants: {len(ctx.room.remote_participants)}")
    
    # Configure the agent session with STT, LLM, and TTS
    session = AgentSession(
        # Speech-to-Text: Use AssemblyAI or Groq Whisper
        stt=inference.STT(
            model="groq/whisper-large-v3-turbo",  # Fast and accurate
            language="en"
        ),
        
        # Large Language Model: Use Groq for fast inference
        llm=inference.LLM(
            model="groq/llama-3.3-70b-versatile",
            temperature=0.7,
        ),
        
        # Text-to-Speech: Use Cartesia for natural voice
        tts=inference.TTS(
            model="cartesia/sonic-3",
            voice="79a125e8-cd45-4c13-8a67-188112f4dd22",  # British Lady (professional)
            # Alternative voices:
            # "9626c31c-bec5-4cca-baa8-f8ba9e84c8bc" - Classy British Man
            # "694f9389-aac1-45b6-b726-9d9369183238" - Calm Female
            language="en"
        ),
        
        # Voice Activity Detection
        vad=ctx.proc.userdata["vad"],
        
        # Enable preemptive generation for faster responses
        preemptive_generation=True,
    )

    # Start the agent session
    logger.info("🚀 Starting agent session with room...")
    await session.start(
        agent=HospitalAppointmentAgent(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                # Apply noise cancellation for clearer audio
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )
    
    logger.info("✅ Agent session started successfully - Agent should be greeting now!")



if __name__ == "__main__":
    # Run the agent server
    # The working LiveKit sample doesn't use worker_type parameter
    logger.info("🔧 Starting LiveKit Agent for Hospital Appointment Booking")
    logger.info("⚠️  For auto-dispatch from LiveKit Cloud, make sure agent is registered")
    cli.run_app(server)

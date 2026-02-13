"""
Application configuration settings
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Groq API Configuration
    GROQ_API_KEY: str

    # ElevenLabs TTS Configuration
    ELEVENLABS_API_KEY: str

    # Database Configuration
    DATABASE_URL: str = "sqlite:///./hospital.db"
    
    # Application Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS Configuration
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000"
    ]
    
    # AI Configuration
    STT_MODEL: str = "whisper-large-v3"
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    TTS_MODEL: str = "tts-1"
    
    # Appointment Configuration
    APPOINTMENT_DURATION_MINUTES: int = 30
    WORKING_HOURS_START: int = 9  # 9 AM
    WORKING_HOURS_END: int = 17   # 5 PM
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()

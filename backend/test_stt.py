#!/usr/bin/env python3
"""
Test script for STT endpoint
"""
import requests
import io
import wave
import struct
import math

def create_test_audio_file(text="Hello, I have a headache and fever"):
    """
    Create a simple test audio file with a sine wave
    Note: This is just a placeholder - real testing would use actual audio
    """
    # Create a simple sine wave audio file
    sample_rate = 16000
    duration = 2  # seconds
    frequency = 440  # A4 note

    # Generate sine wave samples
    samples = []
    for i in range(int(sample_rate * duration)):
        sample = int(32767 * math.sin(2 * math.pi * frequency * i / sample_rate))
        samples.append(sample)

    # Create WAV file in memory
    buffer = io.BytesIO()
    with wave.open(buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(struct.pack('<' + 'h' * len(samples), *samples))

    buffer.seek(0)
    return buffer

def test_stt_endpoint():
    """Test the STT endpoint with a sample audio file"""
    url = "http://localhost:8000/api/triage/transcribe"

    # Create test audio file
    audio_buffer = create_test_audio_file()

    # Prepare the file for upload
    files = {
        'audio_file': ('test_audio.wav', audio_buffer, 'audio/wav')
    }

    try:
        print("Testing STT endpoint...")
        response = requests.post(url, files=files)

        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")

        if response.status_code == 200:
            data = response.json()
            print(f"Transcription: {data.get('transcription', 'No transcription')}")
        else:
            print(f"Error: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_stt_endpoint()

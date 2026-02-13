import requests
import json

url = 'http://localhost:8000/api/triage/conversation'
data = {
    'messages': [
        {'role': 'user', 'content': 'Hello, I have a headache'}
    ],
    'enable_tts': True
}

try:
    response = requests.post(url, json=data)
    print(f'Status Code: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print(f'Response: {result["response"]}')
        print(f'Has Audio: {bool(result.get("audio_data"))}')
        if result.get('audio_data'):
            print('✅ TTS working!')
        else:
            print('❌ No audio data')
    else:
        print(f'Error: {response.text}')
except Exception as e:
    print(f'Error: {e}')

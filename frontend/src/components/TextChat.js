import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Chat as ChatIcon, Send as SendIcon, Person as PersonIcon, SmartToy as BotIcon, VolumeUp as VolumeUpIcon, VolumeOff as VolumeOffIcon, Mic as MicIcon, MicOff as MicOffIcon } from '@mui/icons-material';
import { triageAPI } from '../services/api';

function TextChat() {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationLog, setConversationLog] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [enableTTS, setEnableTTS] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const conversationEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationLog]);

  const startChat = () => {
    if (!patientName || !patientPhone) {
      setError('Please enter your name and phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Initialize chat session
      setIsConnected(true);
      setConversationLog([]);

      // Add welcome message from AI
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: `Hello ${patientName}! I'm your AI medical assistant. I can help you with symptom assessment and appointment scheduling. How can I help you today?`,
          timestamp: new Date(),
        });
      }, 500);

    } catch (err) {
      console.error('Error starting chat:', err);
      setError('Failed to start chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const endChat = () => {
    setIsConnected(false);
    setConversationLog([]);
    setCurrentMessage('');
  };

  const addMessage = (message) => {
    setConversationLog((prev) => [...prev, message]);
  };

  const playAudio = (audioData) => {
    if (audioData) {
      // Convert base64 string to binary data
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.error('Error playing audio:', e));
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Prepare conversation history for API
      const messages = conversationLog.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await triageAPI.conversation({ 
        messages,
        enable_tts: enableTTS 
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);

      // Play audio if TTS is enabled and audio data is available
      if (enableTTS && response.data.audio_data) {
        playAudio(response.data.audio_data);
      }

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setRecordedChunks(chunks);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob) => {
    setIsTyping(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'voice_input.wav');

      const response = await triageAPI.transcribe(formData);
      const transcribedText = response.data.transcription;

      if (transcribedText && transcribedText.trim()) {
        // Add the transcribed message as user input
        const voiceMessage = {
          role: 'user',
          content: transcribedText.trim(),
          timestamp: new Date(),
          isVoice: true,
        };

        addMessage(voiceMessage);

        // Send the transcribed text to get AI response
        const messages = conversationLog.concat(voiceMessage).map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

        const aiResponse = await triageAPI.conversation({ 
          messages,
          enable_tts: enableTTS 
        });

        const assistantMessage = {
          role: 'assistant',
          content: aiResponse.data.response,
          timestamp: new Date(),
        };

        addMessage(assistantMessage);

        // Play audio if TTS is enabled and audio data is available
        if (enableTTS && aiResponse.data.audio_data) {
          playAudio(aiResponse.data.audio_data);
        }
      } else {
        setError('Could not transcribe audio. Please try speaking again or type your message.');
      }

    } catch (err) {
      console.error('Error processing voice input:', err);
      setError('Failed to process voice input. Please try again or type your message.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Text Chat Assistant
      </Typography>

      {!isConnected ? (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Start Your Consultation
          </Typography>

          <TextField
            fullWidth
            label="Your Name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Phone Number"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            margin="normal"
            required
            type="tel"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={isLoading ? <CircularProgress size={20} /> : <ChatIcon />}
            onClick={startChat}
            disabled={isLoading}
            sx={{ mt: 3 }}
          >
            {isLoading ? 'Starting Chat...' : 'Start Chat'}
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Our AI assistant will help you with symptom assessment and appointment scheduling.
          </Typography>
        </Paper>
      ) : (
        <Box>
          <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Chatting with: {patientName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableTTS}
                      onChange={(e) => setEnableTTS(e.target.checked)}
                      icon={<VolumeOffIcon />}
                      checkedIcon={<VolumeUpIcon />}
                    />
                  }
                  label="Voice Responses"
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="error"
                  onClick={endChat}
                >
                  End Chat
                </Button>
              </Box>
            </Box>

            {/* Chat status indicator */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
              <Chip
                icon={<PersonIcon />}
                label="You"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<BotIcon />}
                label={isTyping ? "AI typing..." : "AI Assistant"}
                color={isTyping ? "secondary" : "default"}
                variant={isTyping ? "filled" : "outlined"}
              />
            </Box>
          </Paper>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conversation
              </Typography>

              <Box sx={{ maxHeight: '400px', overflowY: 'auto', mt: 2, mb: 2 }}>
                {conversationLog.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Starting conversation...
                  </Typography>
                ) : (
                  conversationLog.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: message.role === 'user' ? '#e3f2fd' : '#f3e5f5',
                        ml: message.role === 'user' ? 4 : 0,
                        mr: message.role === 'assistant' ? 4 : 0,
                        borderLeft: `4px solid ${message.role === 'user' ? '#2196f3' : '#9c27b0'}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {message.role === 'user' ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          {message.role === 'user' ? 'You' : 'AI Assistant'} •{' '}
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                    </Box>
                  ))
                )}
                <div ref={conversationEndRef} />
              </Box>

              {/* Message input area */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  label="Type your message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping || isRecording}
                  sx={{ flexGrow: 1 }}
                />
                <IconButton
                  color={isRecording ? "error" : "primary"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTyping}
                  sx={{ 
                    mb: 1,
                    backgroundColor: isRecording ? '#ffebee' : 'transparent',
                    '&:hover': {
                      backgroundColor: isRecording ? '#ffcdd2' : undefined,
                    }
                  }}
                >
                  {isRecording ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isTyping || isRecording}
                  sx={{ mb: 1 }}
                >
                  <SendIcon />
                </IconButton>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  💡 <strong>Tip:</strong> Describe your symptoms clearly or use voice input. The AI can help assess your condition and schedule appointments.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}

export default TextChat;

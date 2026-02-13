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
} from '@mui/material';
import { Phone as PhoneIcon, CallEnd as CallEndIcon, Mic as MicIcon, VolumeUp as SpeakerIcon } from '@mui/icons-material';
import { LiveKitRoom, useRoomContext, useLocalParticipant, useRemoteParticipants } from '@livekit/components-react';
import '@livekit/components-styles';
import { livekitAPI, triageAPI } from '../services/api';
import { Track } from 'livekit-client';

// Component to handle transcriptions inside LiveKit room
function TranscriptionHandler({ onTranscription }) {
  const room = useRoomContext();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  useEffect(() => {
    if (!room) return;

    // Listen for transcription events
    const handleTranscription = (transcription, participant) => {
      const isAgent = participant?.identity?.includes('agent');
      const role = isAgent ? 'agent' : 'patient';
      
      if (transcription.text) {
        onTranscription({
          role: role,
          content: transcription.text,
          timestamp: new Date(),
          isFinal: transcription.final,
        });
      }
    };

    // Subscribe to local participant transcriptions (patient)
    room.localParticipant?.on('transcriptionReceived', (transcription) => {
      handleTranscription(transcription, room.localParticipant);
    });

    // Subscribe to remote participants transcriptions (agent)
    room.remoteParticipants.forEach((participant) => {
      participant.on('transcriptionReceived', (transcription) => {
        handleTranscription(transcription, participant);
      });
    });

    return () => {
      room.localParticipant?.off('transcriptionReceived', handleTranscription);
      room.remoteParticipants.forEach((participant) => {
        participant.off('transcriptionReceived', handleTranscription);
      });
    };
  }, [room, onTranscription]);

  return null;
}

function VoiceCall() {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientId, setPatientId] = useState('');
  const [token, setToken] = useState('');
  const [roomName, setRoomName] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationLog, setConversationLog] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState({ agent: false, patient: false });
  const conversationEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationLog]);

  const startCall = async () => {
    if (!patientName || !patientPhone) {
      setError('Please enter your name and phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate unique patient ID
      const id = `patient_${Date.now()}`;
      setPatientId(id);

      // Initiate patient call
      const response = await livekitAPI.initiatePatientCall({
        patient_id: id,
        patient_name: patientName,
      });

      setToken(response.data.token);
      setRoomName(response.data.room_name);
      setServerUrl(response.data.url);
      setIsConnected(true);

    } catch (err) {
      console.error('Error starting call:', err);
      setError('Failed to start call. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = () => {
    setIsConnected(false);
    setToken('');
    setRoomName('');
    setServerUrl('');
    setConversationLog([]);
  };

  const addMessage = (message) => {
    setConversationLog((prev) => {
      // If it's not final, update the last message of the same role
      if (!message.isFinal && prev.length > 0) {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === message.role && !lastMessage.isFinal) {
          return [...prev.slice(0, -1), message];
        }
      }
      return [...prev, message];
    });

    // Update speaking indicators
    if (message.isFinal) {
      setIsSpeaking({ agent: false, patient: false });
    } else {
      setIsSpeaking((prev) => ({
        ...prev,
        [message.role]: true,
      }));
    }
  };

  const handleTranscription = (transcription) => {
    addMessage(transcription);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Voice Call Assistant
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
            startIcon={isLoading ? <CircularProgress size={20} /> : <PhoneIcon />}
            onClick={startCall}
            disabled={isLoading}
            sx={{ mt: 3 }}
          >
            {isLoading ? 'Connecting...' : 'Start Call'}
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
                Connected: {patientName}
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<CallEndIcon />}
                onClick={endCall}
              >
                End Call
              </Button>
            </Box>

            <LiveKitRoom
              video={false}
              audio={true}
              token={token}
              serverUrl={serverUrl}
              onDisconnected={endCall}
              style={{
                height: '100px',
                borderRadius: '8px',
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TranscriptionHandler onTranscription={handleTranscription} />
              
              {/* Audio status indicators */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip 
                  icon={<MicIcon />} 
                  label={isSpeaking.patient ? "You're speaking..." : "Patient"} 
                  color={isSpeaking.patient ? "primary" : "default"}
                  variant={isSpeaking.patient ? "filled" : "outlined"}
                />
                <Chip 
                  icon={<SpeakerIcon />} 
                  label={isSpeaking.agent ? "Agent speaking..." : "AI Agent"} 
                  color={isSpeaking.agent ? "secondary" : "default"}
                  variant={isSpeaking.agent ? "filled" : "outlined"}
                />
              </Box>
            </LiveKitRoom>
          </Paper>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Live Conversation Transcript
              </Typography>

              <Box sx={{ maxHeight: '500px', overflowY: 'auto', mt: 2 }}>
                {conversationLog.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Start speaking to begin the conversation...
                  </Typography>
                ) : (
                  conversationLog.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: message.role === 'patient' ? '#e3f2fd' : '#f3e5f5',
                        ml: message.role === 'patient' ? 4 : 0,
                        mr: message.role === 'agent' ? 4 : 0,
                        opacity: message.isFinal ? 1 : 0.7,
                        borderLeft: `4px solid ${message.role === 'patient' ? '#2196f3' : '#9c27b0'}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {message.role === 'patient' ? <MicIcon fontSize="small" /> : <SpeakerIcon fontSize="small" />}
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          {message.role === 'patient' ? 'You' : 'AI Agent'} •{' '}
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                        {!message.isFinal && (
                          <Chip label="typing..." size="small" sx={{ height: 20 }} />
                        )}
                      </Box>
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                    </Box>
                  ))
                )}
                <div ref={conversationEndRef} />
              </Box>

              {conversationLog.length > 0 && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    💡 <strong>Tip:</strong> Speak clearly and wait for the agent to finish before responding.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}

export default VoiceCall;

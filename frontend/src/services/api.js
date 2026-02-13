import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Appointments API
export const appointmentsAPI = {
  getAll: (params) => api.get('/api/appointments', { params }),
  getById: (id) => api.get(`/api/appointments/${id}`),
  create: (data) => api.post('/api/appointments', data),
  update: (id, data) => api.put(`/api/appointments/${id}`, data),
  cancel: (id) => api.delete(`/api/appointments/${id}`),
  getAvailableSlots: (data) => api.post('/api/appointments/available-slots', data),
};

// LiveKit API
export const livekitAPI = {
  generateToken: (data) => api.post('/api/livekit/token', data),
  createRoom: (roomName, emptyTimeout) => 
    api.post('/api/livekit/room', null, { params: { room_name: roomName, empty_timeout: emptyTimeout } }),
  listRooms: () => api.get('/api/livekit/rooms'),
  deleteRoom: (roomName) => api.delete(`/api/livekit/room/${roomName}`),
  initiatePatientCall: (data) => api.post('/api/livekit/patient-call', data),
};

// Triage API
export const triageAPI = {
  analyzeSymptoms: (data) => api.post('/api/triage/analyze', data),
  conversation: (data) => api.post('/api/triage/conversation', data),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;

import api from './api';

export const aiInterviewAPI = {
    // Create new session & get LiveKit token
    createSession: (data) => api.post('/ai-interview/sessions', data),
    
    // Get session info
    getSession: (sessionId) => api.get(`/ai-interview/sessions/${sessionId}`),
    
    // Update session status & duration
    updateStatus: (sessionId, data) => api.put(`/ai-interview/sessions/${sessionId}/status`, data),
    
    // Record turn
    recordTurn: (sessionId, data) => api.post(`/ai-interview/sessions/${sessionId}/turns`, data),
    
    // Get turns
    getTurns: (sessionId) => api.get(`/ai-interview/sessions/${sessionId}/turns`),
    
    // Interactive Groq AI question generator (turn-by-turn or voice utterance)
    interact: (sessionId, data) => api.post(`/ai-interview/sessions/${sessionId}/interact`, data),
    
    // Trigger async summary pipeline
    generateSummary: (sessionId) => api.post(`/ai-interview/sessions/${sessionId}/summary`),
    
    // Get summary
    getSummary: (sessionId) => api.get(`/ai-interview/sessions/${sessionId}/summary`),
    
    // Recruiter notes
    addNote: (sessionId, data) => api.post(`/ai-interview/sessions/${sessionId}/notes`, data),
    getNotes: (sessionId) => api.get(`/ai-interview/sessions/${sessionId}/notes`),
    
    // HR Admin list sessions
    getAdminSessions: () => api.get('/ai-interview/admin/sessions'),
};

export default aiInterviewAPI;

import api from './api';

const meetingService = {
  createMeeting: async (title = 'My Meeting') => {
    const response = await api.post('/meetings/create', { title });
    return response.data;
  },

  joinMeeting: async (meetingCode) => {
    const response = await api.post('/meetings/join', { meetingCode });
    return response.data;
  },

  getMeetingDetails: async (meetingId) => {
    const response = await api.get(`/meetings/${meetingId}`);
    return response.data;
  },

  getUserMeetings: async () => {
    const response = await api.get('/meetings/user/history');
    return response.data;
  },

  endMeeting: async (meetingId) => {
    const response = await api.put(`/meetings/${meetingId}/end`);
    return response.data;
  },

  leaveMeeting: async (meetingId) => {
    const response = await api.post(`/meetings/${meetingId}/leave`);
    return response.data;
  },

  getParticipants: async (meetingId) => {
    const response = await api.get(`/meetings/${meetingId}/participants`);
    return response.data;
  },

  sendMessage: async (meetingId, message) => {
    const response = await api.post('/chat/send', { meetingId, message });
    return response.data;
  },

  getMessages: async (meetingId) => {
    const response = await api.get(`/chat/meeting/${meetingId}`);
    return response.data;
  },
};

export default meetingService;
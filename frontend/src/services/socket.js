import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

let socket = null;

export const initSocket = (token) => {
  socket = io('http://localhost:5000', {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('✅ Connected to socket server');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
  });

  socket.on('new-reaction', ({ userId, username, reaction }) => {
    // Show reaction notification
    toast(`${username} reacted ${reaction}`, {
      icon: reaction,
      duration: 2000,
      position: 'bottom-center',
    });
  });

  socket.on('user-joined', ({ username }) => {
    toast(`${username} joined the meeting`, {
      icon: '👋',
      duration: 3000,
    });
  });

  socket.on('user-left', ({ username }) => {
    toast(`${username} left the meeting`, {
      icon: '👋',
      duration: 3000,
    });
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Helper function to emit reactions
export const sendReaction = (meetingId, reaction) => {
  if (socket) {
    socket.emit('send-reaction', { meetingId, reaction });
  }
};

// Helper function to send chat messages
export const sendMessage = (meetingId, userId, username, message) => {
  if (socket) {
    socket.emit('send-message', { meetingId, userId, username, message });
  }
};

// Helper function to join meeting
export const joinMeeting = (meetingId, userId, username) => {
  if (socket) {
    socket.emit('join-meeting', { meetingId, userId, username });
  }
};

// Helper function to leave meeting
export const leaveMeeting = (meetingId, userId) => {
  if (socket) {
    socket.emit('leave-meeting', { meetingId, userId });
  }
};

// Helper function for WebRTC signaling
export const sendSignal = (to, from, signal) => {
  if (socket) {
    socket.emit('signal', { to, from, signal });
  }
};
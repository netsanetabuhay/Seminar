export const API_URL = 'http://localhost:5000/api';

export const MEETING_STATUS = {
  ACTIVE: 'active',
  ENDED: 'ended',
};

export const SOCKET_EVENTS = {
  JOIN_MEETING: 'join-meeting',
  LEAVE_MEETING: 'leave-meeting',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  SEND_MESSAGE: 'send-message',
  NEW_MESSAGE: 'new-message',
  SIGNAL: 'signal',
  MEETING_ENDED: 'meeting-ended',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please login to continue',
  MEETING_NOT_FOUND: 'Meeting not found',
  INVALID_MEETING_CODE: 'Invalid meeting code',
};
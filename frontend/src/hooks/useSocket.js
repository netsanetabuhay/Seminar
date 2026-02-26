import { useEffect, useRef } from 'react';
import { getSocket, initSocket, disconnectSocket } from '../services/socket';

export const useSocket = (meetingId, handlers = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();

    if (!socketRef.current) {
      socketRef.current = initSocket();
    }

    if (meetingId) {
      socketRef.current.emit('join-meeting', { meetingId });
    }

    // Register event handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      socketRef.current?.on(event, handler);
    });

    return () => {
      Object.keys(handlers).forEach((event) => {
        socketRef.current?.off(event);
      });

      if (meetingId) {
        socketRef.current?.emit('leave-meeting', { meetingId });
      }
    };
  }, [meetingId, handlers]);

  const emit = (event, data) => {
    socketRef.current?.emit(event, data);
  };

  return { socket: socketRef.current, emit };
};
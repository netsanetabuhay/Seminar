import React, { useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';
import Peer from 'simple-peer';

const VideoPlayer = ({ stream, muted, username, userId }) => {
  const videoRef = useRef();
  const peerRef = useRef();

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();
    
    peerRef.current = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peerRef.current.on('signal', (data) => {
      socket.emit('signal', {
        to: userId,
        from: socket.id,
        signal: data
      });
    });

    socket.on('signal', ({ from, signal }) => {
      if (from === userId) {
        peerRef.current.signal(signal);
      }
    });

    return () => {
      peerRef.current?.destroy();
    };
  }, [userId]);

  return (
    <div className="relative bg-base-300 rounded-lg overflow-hidden aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-base-900/50 text-white px-2 py-1 rounded text-sm">
        {username}
      </div>
    </div>
  );
};

export default VideoPlayer;
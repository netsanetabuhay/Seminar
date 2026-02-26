import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getSocket } from '../services/socket';
import { endMeeting } from '../store/slices/meetingSlice';
import { 
  FiMic, FiMicOff, FiVideo, FiVideoOff, 
  FiPhone, FiMessageSquare, FiUsers,
  FiSettings, FiShare2
} from 'react-icons/fi';

const MeetingControls = ({ meetingId, isHost, localStream }) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = getSocket();

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const handleLeaveMeeting = () => {
    socket.emit('leave-meeting', { meetingId });
    navigate('/');
  };

  const handleEndMeeting = async () => {
    if (isHost) {
      await dispatch(endMeeting(meetingId));
      navigate('/');
    }
  };

  return (
    <div className="bg-base-100 border-t border-base-200 p-4">
      <div className="flex justify-center items-center gap-4">
        {/* Audio Control */}
        <button
          onClick={toggleAudio}
          className={`btn btn-circle ${audioEnabled ? 'btn-ghost' : 'btn-error'}`}
        >
          {audioEnabled ? <FiMic className="text-xl" /> : <FiMicOff className="text-xl" />}
        </button>

        {/* Video Control */}
        <button
          onClick={toggleVideo}
          className={`btn btn-circle ${videoEnabled ? 'btn-ghost' : 'btn-error'}`}
        >
          {videoEnabled ? <FiVideo className="text-xl" /> : <FiVideoOff className="text-xl" />}
        </button>

        {/* Share Screen */}
        <button className="btn btn-circle btn-ghost">
          <FiShare2 className="text-xl" />
        </button>

        {/* Participants */}
        <button className="btn btn-circle btn-ghost">
          <FiUsers className="text-xl" />
        </button>

        {/* Chat */}
        <button className="btn btn-circle btn-ghost">
          <FiMessageSquare className="text-xl" />
        </button>

        {/* Settings */}
        <button className="btn btn-circle btn-ghost">
          <FiSettings className="text-xl" />
        </button>

        {/* Leave/End Meeting */}
        {isHost ? (
          <button
            onClick={handleEndMeeting}
            className="btn btn-error"
          >
            <FiPhone className="mr-2 rotate-135" />
            End Meeting
          </button>
        ) : (
          <button
            onClick={handleLeaveMeeting}
            className="btn btn-warning"
          >
            <FiPhone className="mr-2 rotate-135" />
            Leave Meeting
          </button>
        )}
      </div>
    </div>
  );
};

export default MeetingControls;
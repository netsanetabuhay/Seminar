import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMeetingDetails, clearMeeting, addChat, addParticipant, removeParticipant } from '../store/slices/meetingSlice';
import VideoPlayer from '../components/VideoPlayer';
import Chat from '../components/Chat';
import ParticipantList from '../components/ParticipantList';
import MeetingControls from '../components/MeetingControls';
import { initSocket, getSocket } from '../services/socket';
import { FiMessageSquare, FiUsers } from 'react-icons/fi';

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentMeeting, participants, chats, loading } = useSelector((state) => state.meeting);
  const { user } = useSelector((state) => state.auth);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const socketInitialized = useRef(false);

  useEffect(() => {
    const initMeeting = async () => {
      // Initialize socket
      if (!socketInitialized.current) {
        initSocket(user?.token);
        socketInitialized.current = true;
      }

      const socket = getSocket();
      
      // Join meeting room
      socket.emit('join-meeting', {
        meetingId,
        userId: user?.id,
        username: user?.username
      });

      // Get meeting details
      await dispatch(getMeetingDetails(meetingId));

      // Socket listeners
      socket.on('user-joined', (data) => {
        dispatch(addParticipant(data));
      });

      socket.on('user-left', (data) => {
        dispatch(removeParticipant(data.userId));
      });

      socket.on('new-message', (data) => {
        dispatch(addChat(data));
      });

      socket.on('meeting-ended', () => {
        alert('Meeting ended by host');
        navigate('/');
      });

      // Get user media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    };

    initMeeting();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.emit('leave-meeting', { meetingId, userId: user?.id });
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('new-message');
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      dispatch(clearMeeting());
    };
  }, [meetingId]);

  if (loading || !currentMeeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-base-200">
      {/* Meeting Header */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Meeting: {currentMeeting?.meeting_code}</a>
        </div>
        <div className="flex-none gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`btn btn-circle ${showChat ? 'btn-primary' : 'btn-ghost'}`}
          >
            <FiMessageSquare className="text-xl" />
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`btn btn-circle ${showParticipants ? 'btn-primary' : 'btn-ghost'}`}
          >
            <FiUsers className="text-xl" />
          </button>
        </div>
      </div>

      {/* Main Meeting Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <VideoPlayer 
              stream={localStream} 
              muted 
              username={`${user?.username} (You)`}
            />
            {participants.map((participant) => (
              <VideoPlayer
                key={participant.userId}
                userId={participant.userId}
                username={participant.username}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex gap-2 p-2">
          {showParticipants && (
            <div className="w-64 bg-base-100 rounded-lg shadow-lg">
              <ParticipantList 
                participants={participants} 
                hostId={currentMeeting?.host_id}
                currentUser={user}
              />
            </div>
          )}
          {showChat && (
            <div className="w-80 bg-base-100 rounded-lg shadow-lg">
              <Chat 
                meetingId={meetingId}
                chats={chats}
                currentUser={user}
              />
            </div>
          )}
        </div>
      </div>

      {/* Meeting Controls */}
     <MeetingControls 
  meetingId={meetingId}
  isHost={currentMeeting?.host_id === user?.id}
  localStream={localStream}
  meetingCode={currentMeeting?.meeting_code}  // Add this line
/>
    </div>
  );
};

export default Meeting;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getSocket } from '../services/socket';
import { endMeeting } from '../store/slices/meetingSlice';
import { 
  FiMic, FiMicOff, FiVideo, FiVideoOff, 
  FiPhone, FiMessageSquare, FiUsers,
  FiSettings, FiShare2, FiSmile, FiMonitor,
  FiCopy, FiMail, FiMessageCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const MeetingControls = ({ meetingId, isHost, localStream, meetingCode }) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = getSocket();

  // Camera control like Google Meet
  const toggleVideo = async () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      
      if (videoEnabled) {
        // Turn off camera - freeze frame like Google Meet
        videoTracks.forEach(track => {
          track.enabled = false;
        });
        
        // Optional: Show a placeholder/avatar instead of black screen
        setVideoEnabled(false);
        toast.success('Camera turned off', { icon: '📹', duration: 1500 });
      } else {
        // Turn on camera
        try {
          // Get fresh camera stream
          const newStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            } 
          });
          
          const newVideoTrack = newStream.getVideoTracks()[0];
          
          // Replace old track with new one
          const oldTrack = videoTracks[0];
          if (oldTrack) {
            localStream.removeTrack(oldTrack);
            oldTrack.stop();
          }
          
          localStream.addTrack(newVideoTrack);
          setVideoEnabled(true);
          toast.success('Camera turned on', { icon: '📹', duration: 1500 });
        } catch (error) {
          console.error('Error accessing camera:', error);
          toast.error('Could not access camera');
        }
      }
    }
  };

  // Audio control
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled(!audioEnabled);
      toast.success(audioEnabled ? 'Muted' : 'Unmuted', { 
        icon: audioEnabled ? '🔇' : '🔊', 
        duration: 1500 
      });
    }
  };

  // Enhanced screen share
  const handleShareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: true 
      });
      
      const screenTrack = screenStream.getVideoTracks()[0];
      const videoTrack = localStream.getVideoTracks()[0];
      
      if (videoTrack) {
        localStream.removeTrack(videoTrack);
        videoTrack.stop();
      }
      
      localStream.addTrack(screenTrack);
      toast.success('Sharing screen', { icon: '🖥️', duration: 2000 });
      
      screenTrack.onended = () => {
        // Return to camera when screen share ends
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(cameraStream => {
            const newTrack = cameraStream.getVideoTracks()[0];
            localStream.addTrack(newTrack);
            toast.success('Stopped sharing', { icon: '📹', duration: 1500 });
          });
      };
    } catch (error) {
      console.error('Screen sharing failed:', error);
      toast.error('Failed to share screen');
    }
  };

  // Enhanced invitation with multiple options
  const handleInvite = () => {
    const inviteLink = `${window.location.origin}/join/${meetingCode}`;
    const meetingInfo = {
      code: meetingCode,
      link: inviteLink,
      message: `Join my meeting: ${inviteLink}\nMeeting code: ${meetingCode}`
    };
    
    // Show invite modal/dropdown instead of alert
    setShowInvite(!showInvite);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`, { 
      icon: '📋', 
      duration: 2000 
    });
    setShowInvite(false);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join my meeting');
    const body = encodeURIComponent(`Join my meeting using code: ${meetingCode}\n\nLink: ${window.location.origin}/join/${meetingCode}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShowInvite(false);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Join my meeting with code: ${meetingCode}\n${window.location.origin}/join/${meetingCode}`);
    window.open(`https://wa.me/?text=${text}`);
    setShowInvite(false);
  };

  // Reactions
  const handleReaction = (reaction) => {
    socket.emit('send-reaction', { meetingId, reaction });
    toast(reaction, { 
      duration: 1000,
      position: 'top-center',
      style: { fontSize: '2rem', background: 'transparent' }
    });
    setShowReactions(false);
  };

  const handleLeaveMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    socket.emit('leave-meeting', { meetingId });
    toast.success('Left meeting', { duration: 1500 });
    navigate('/');
  };

  const handleEndMeeting = async () => {
    if (isHost) {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      await dispatch(endMeeting(meetingId));
      toast.success('Meeting ended', { duration: 2000 });
      navigate('/');
    }
  };

  return (
    <div className="bg-base-100 border-t border-base-200 p-4 relative">
      <div className="flex justify-center items-center gap-2 flex-wrap">
        {/* Audio Control */}
        <button
          onClick={toggleAudio}
          className={`btn btn-circle ${audioEnabled ? 'btn-ghost' : 'btn-error'}`}
          title={audioEnabled ? 'Mute (Ctrl+D)' : 'Unmute (Ctrl+D)'}
        >
          {audioEnabled ? <FiMic className="text-xl" /> : <FiMicOff className="text-xl" />}
        </button>

        {/* Video Control */}
        <button
          onClick={toggleVideo}
          className={`btn btn-circle ${videoEnabled ? 'btn-ghost' : 'btn-error'}`}
          title={videoEnabled ? 'Turn off camera (Ctrl+E)' : 'Turn on camera (Ctrl+E)'}
        >
          {videoEnabled ? <FiVideo className="text-xl" /> : <FiVideoOff className="text-xl" />}
        </button>

        {/* Share Screen */}
        <button
          onClick={handleShareScreen}
          className="btn btn-circle btn-ghost"
          title="Share screen (Ctrl+Alt+S)"
        >
          <FiMonitor className="text-xl" />
        </button>

        {/* Invite Button with Dropdown */}
        <div className="dropdown dropdown-top">
          <button
            onClick={handleInvite}
            className="btn btn-circle btn-ghost"
            title="Invite others (Ctrl+I)"
          >
            <FiShare2 className="text-xl" />
          </button>
          {showInvite && (
            <ul className="dropdown-content menu p-3 shadow bg-base-100 rounded-box w-72 mb-2 border border-base-300">
              <li className="menu-title">Invite People</li>
              <li className="p-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-base-200 p-2 rounded">
                    <span className="font-mono text-lg">{meetingCode}</span>
                    <button 
                      onClick={() => copyToClipboard(meetingCode, 'Meeting code')}
                      className="btn btn-xs btn-ghost"
                    >
                      <FiCopy />
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-base-200 p-2 rounded text-sm truncate">
                    <span className="truncate">{window.location.origin}/join/{meetingCode}</span>
                    <button 
                      onClick={() => copyToClipboard(`${window.location.origin}/join/${meetingCode}`, 'Link')}
                      className="btn btn-xs btn-ghost"
                    >
                      <FiCopy />
                    </button>
                  </div>
                </div>
              </li>
              <div className="divider my-1">Share via</div>
              <li>
                <button onClick={shareViaEmail} className="flex items-center gap-2">
                  <FiMail className="text-lg" /> Email
                </button>
              </li>
              <li>
                <button onClick={shareViaWhatsApp} className="flex items-center gap-2">
                  <FiMessageCircle className="text-lg" /> WhatsApp
                </button>
              </li>
            </ul>
          )}
        </div>

        {/* Reactions */}
        <div className="dropdown dropdown-top">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="btn btn-circle btn-ghost"
            title="Send reaction"
          >
            <FiSmile className="text-xl" />
          </button>
          {showReactions && (
            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mb-2 grid grid-cols-3 gap-1">
              <li><button onClick={() => handleReaction('👍')} className="text-2xl hover:scale-125 transition">👍</button></li>
              <li><button onClick={() => handleReaction('👎')} className="text-2xl hover:scale-125 transition">👎</button></li>
              <li><button onClick={() => handleReaction('❤️')} className="text-2xl hover:scale-125 transition">❤️</button></li>
              <li><button onClick={() => handleReaction('😂')} className="text-2xl hover:scale-125 transition">😂</button></li>
              <li><button onClick={() => handleReaction('😮')} className="text-2xl hover:scale-125 transition">😮</button></li>
              <li><button onClick={() => handleReaction('🎉')} className="text-2xl hover:scale-125 transition">🎉</button></li>
            </ul>
          )}
        </div>

        {/* Settings */}
        <div className="dropdown dropdown-top">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-circle btn-ghost"
            title="Settings"
          >
            <FiSettings className="text-xl" />
          </button>
          {showSettings && (
            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-56 mb-2">
              <li><a><input type="checkbox" className="toggle toggle-sm mr-2" /> HD Video</a></li>
              <li><a><input type="checkbox" className="toggle toggle-sm mr-2" /> Noise suppression</a></li>
              <li><a><input type="checkbox" className="toggle toggle-sm mr-2" /> Echo cancellation</a></li>
              <li><a><input type="range" min="0" max="100" className="range range-xs" /> Mic volume</a></li>
            </ul>
          )}
        </div>

        {/* Participants */}
        <button className="btn btn-circle btn-ghost" title="Participants (Ctrl+Alt+P)">
          <FiUsers className="text-xl" />
        </button>

        {/* Chat */}
        <button className="btn btn-circle btn-ghost" title="Chat (Ctrl+Alt+C)">
          <FiMessageSquare className="text-xl" />
        </button>

        {/* Leave/End Meeting */}
        {isHost ? (
          <button
            onClick={handleEndMeeting}
            className="btn btn-error"
            title="End meeting for everyone"
          >
            <FiPhone className="mr-2 rotate-135" />
            End
          </button>
        ) : (
          <button
            onClick={handleLeaveMeeting}
            className="btn btn-warning"
            title="Leave meeting"
          >
            <FiPhone className="mr-2 rotate-135" />
            Leave
          </button>
        )}
      </div>
    </div>
  );
};

export default MeetingControls;
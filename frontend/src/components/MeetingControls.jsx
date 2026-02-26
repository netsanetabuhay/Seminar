import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getSocket } from '../services/socket';
import { endMeeting } from '../store/slices/meetingSlice';
import { 
  FiMic, FiMicOff, FiVideo, FiVideoOff, 
  FiPhone, FiMessageSquare, FiUsers,
  FiSettings, FiShare2, FiSmile, FiMonitor,
  FiCopy, FiMail, FiMessageCircle,
  FiCamera, FiVolume2, FiWifi, FiSun
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const MeetingControls = ({ meetingId, isHost, localStream, meetingCode }) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = getSocket();

  // Camera control with proper LED off
  const toggleVideo = async () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      
      if (videoEnabled) {
        videoTracks.forEach(track => {
          track.enabled = false;
          track.stop();
          localStream.removeTrack(track);
        });
        
        setVideoEnabled(false);
        toast.success('Camera turned off', { icon: '📹', duration: 1500 });
      } else {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            } 
          });
          
          const newVideoTrack = newStream.getVideoTracks()[0];
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

  // Screen share - works for any number of participants
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

  // Google Meet-like animated reactions - ONE reaction per click
  const handleReaction = (reaction) => {
    // Emit to socket
    socket.emit('send-reaction', { meetingId, reaction });
    
    // Create ONE floating reaction per click
    const id = Date.now();
    const angle = (Math.random() * 50) - 25; // -25 to 25 degrees
    const left = 45 + (Math.random() * 20 - 10); // Center-ish with variation
    const duration = 3;
    
    const newReaction = {
      id,
      reaction,
      left: `${left}%`,
      angle,
      duration,
      animation: `floatDiagonal ${duration}s ease-out forwards`
    };
    
    setFloatingReactions(prev => [...prev, newReaction]);
    
    // Remove after animation
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, duration * 1000);
    
    // Don't close the menu
  };

  // Listen for reactions from others
  React.useEffect(() => {
    if (socket) {
      socket.on('new-reaction', ({ username, reaction }) => {
        // Show ONE floating reaction for others
        const id = Date.now();
        const angle = (Math.random() * 50) - 25;
        const left = 45 + (Math.random() * 20 - 10);
        const duration = 3;
        
        const newReaction = {
          id,
          reaction,
          left: `${left}%`,
          angle,
          duration,
          animation: `floatDiagonal ${duration}s ease-out forwards`,
          username
        };
        
        setFloatingReactions(prev => [...prev, newReaction]);
        
        setTimeout(() => {
          setFloatingReactions(prev => prev.filter(r => r.id !== id));
        }, duration * 1000);
      });
    }
    
    return () => {
      if (socket) {
        socket.off('new-reaction');
      }
    };
  }, [socket]);

  // Toggle settings menu - only closes when clicking the settings button again
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Invite functions
  const handleInvite = () => {
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
      {/* Floating Reactions Container */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingReactions.map((item) => (
          <div
            key={item.id}
            className="absolute text-4xl z-50"
            style={{
              left: item.left,
              bottom: '15%',
              animation: item.animation,
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
              transformOrigin: 'center'
            }}
          >
            {item.reaction}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatDiagonal {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          25% {
            transform: translate(30px, -80px) rotate(10deg) scale(1.2);
            opacity: 0.9;
          }
          50% {
            transform: translate(10px, -160px) rotate(0deg) scale(1.1);
            opacity: 0.7;
          }
          75% {
            transform: translate(-20px, -240px) rotate(-10deg) scale(0.9);
            opacity: 0.4;
          }
          100% {
            transform: translate(0, -320px) rotate(0deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>

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

        {/* Share Screen - Works for any number of participants */}
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

        {/* Reactions Button */}
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="btn btn-circle btn-ghost"
            title="Send reaction"
          >
            <FiSmile className="text-xl" />
          </button>
          
          {/* Reactions Menu - Stays open for multiple clicks */}
          {showReactions && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-base-100 rounded-full shadow-2xl p-2 border border-base-300 flex gap-1 z-50">
              <button 
                onClick={() => handleReaction('👍')} 
                className="btn btn-circle btn-ghost hover:bg-primary/20 text-2xl hover:scale-125 transition-all"
                title="Like"
              >
                👍
              </button>
              <button 
                onClick={() => handleReaction('❤️')} 
                className="btn btn-circle btn-ghost hover:bg-primary/20 text-2xl hover:scale-125 transition-all"
                title="Love"
              >
                ❤️
              </button>
              <button 
                onClick={() => handleReaction('😂')} 
                className="btn btn-circle btn-ghost hover:bg-primary/20 text-2xl hover:scale-125 transition-all"
                title="Laugh"
              >
                😂
              </button>
              <button 
                onClick={() => handleReaction('😮')} 
                className="btn btn-circle btn-ghost hover:bg-primary/20 text-2xl hover:scale-125 transition-all"
                title="Wow"
              >
                😮
              </button>
              <button 
                onClick={() => handleReaction('😢')} 
                className="btn btn-circle btn-ghost hover:bg-primary/20 text-2xl hover:scale-125 transition-all"
                title="Sad"
              >
                😢
              </button>
              <button 
                onClick={() => handleReaction('🎉')} 
                className="btn btn-circle btn-ghost hover:bg-primary/20 text-2xl hover:scale-125 transition-all"
                title="Celebrate"
              >
                🎉
              </button>
              <button 
                onClick={() => handleReaction('👏')} 
                className="btn btn-circle btn-ghost hover:bg-primary/20 text-2xl hover:scale-125 transition-all"
                title="Applause"
              >
                👏
              </button>
            </div>
          )}
        </div>

        {/* Settings - Only toggles when clicking the settings button */}
        <div className="relative">
          <button
            onClick={toggleSettings}
            className="btn btn-circle btn-ghost"
            title="Settings"
          >
            <FiSettings className="text-xl" />
          </button>
          
          {showSettings && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-base-100 rounded-lg shadow-2xl p-4 border border-base-300 w-64 z-50">
              <h3 className="font-bold mb-3">Settings</h3>
              
              <div className="space-y-4">
                {/* Camera Settings */}
                <div>
                  <label className="flex items-center gap-2 text-sm mb-1">
                    <FiCamera /> Camera
                  </label>
                  <select className="select select-bordered select-sm w-full">
                    <option>Default Camera</option>
                    <option>HD Camera</option>
                    <option>External Camera</option>
                  </select>
                </div>
                
                {/* Microphone Settings */}
                <div>
                  <label className="flex items-center gap-2 text-sm mb-1">
                    <FiVolume2 /> Microphone
                  </label>
                  <select className="select select-bordered select-sm w-full">
                    <option>Default Microphone</option>
                    <option>External Microphone</option>
                  </select>
                </div>
                
                {/* Speaker Settings */}
                <div>
                  <label className="flex items-center gap-2 text-sm mb-1">
                    <FiWifi /> Speaker
                  </label>
                  <select className="select select-bordered select-sm w-full">
                    <option>Default Speaker</option>
                    <option>Headphones</option>
                  </select>
                </div>
                
                {/* Video Quality */}
                <div>
                  <label className="flex items-center gap-2 text-sm mb-1">
                    <FiSun /> Video Quality
                  </label>
                  <div className="flex gap-1">
                    <button className="btn btn-xs btn-outline btn-primary">Auto</button>
                    <button className="btn btn-xs btn-outline">HD</button>
                    <button className="btn btn-xs btn-outline">SD</button>
                  </div>
                </div>
                
                {/* Background Blur */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Blur</span>
                  <input type="checkbox" className="toggle toggle-sm" />
                </div>
                
                {/* Noise Suppression */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Noise Suppression</span>
                  <input type="checkbox" className="toggle toggle-sm" defaultChecked />
                </div>
                
                {/* Echo Cancellation */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Echo Cancellation</span>
                  <input type="checkbox" className="toggle toggle-sm" defaultChecked />
                </div>
              </div>
            </div>
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
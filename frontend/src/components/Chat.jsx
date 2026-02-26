import React, { useState, useRef, useEffect } from 'react';
import { getSocket } from '../services/socket';
import { FiSend } from 'react-icons/fi';

const Chat = ({ meetingId, chats, currentUser }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const socket = getSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket.emit('send-message', {
      meetingId,
      userId: currentUser.id,
      username: currentUser.username,
      message: message.trim()
    });

    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-base-200">
        <h3 className="font-bold">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`chat ${chat.userId === currentUser.id ? 'chat-end' : 'chat-start'}`}
          >
            <div className="chat-header">
              {chat.username}
              <time className="text-xs opacity-50 ml-2">
                {new Date(chat.sentAt).toLocaleTimeString()}
              </time>
            </div>
            <div className={`chat-bubble ${chat.userId === currentUser.id ? 'chat-bubble-primary' : ''}`}>
              {chat.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-base-200">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="input input-bordered flex-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-circle">
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
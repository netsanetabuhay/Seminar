const Chat = require('../models/Chat');
const Participant = require('../models/Participant');

const socketService = {
    initialize: (io) => {
        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            // Join meeting room
            socket.on('join-meeting', async ({ meetingId, userId, username }) => {
                socket.join(`meeting-${meetingId}`);
                console.log(`${username} joined meeting ${meetingId}`);

                // Notify others
                socket.to(`meeting-${meetingId}`).emit('user-joined', {
                    userId,
                    username,
                    socketId: socket.id
                });
            });

            // Handle WebRTC signaling
            socket.on('signal', ({ to, from, signal }) => {
                io.to(to).emit('signal', { from, signal });
            });

            // Handle chat messages
            socket.on('send-message', async ({ meetingId, userId, username, message }) => {
                try {
                    // Save to database
                    await Chat.create(meetingId, userId, message);

                    // Broadcast to meeting
                    io.to(`meeting-${meetingId}`).emit('new-message', {
                        userId,
                        username,
                        message,
                        sentAt: new Date()
                    });
                } catch (error) {
                    console.error('Error saving message:', error);
                }
            });

            // Handle user leaving
            socket.on('leave-meeting', async ({ meetingId, userId }) => {
                socket.leave(`meeting-${meetingId}`);
                await Participant.remove(meetingId, userId);
                
                socket.to(`meeting-${meetingId}`).emit('user-left', { userId });
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }
};

module.exports = socketService;
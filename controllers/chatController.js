const Chat = require('../models/Chat');

const chatController = {
    // Get chat messages for a meeting
    getMeetingChats: async (req, res) => {
        try {
            const { meetingId } = req.params;
            const messages = await Chat.getByMeeting(meetingId);
            res.json({ success: true, messages });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Send a message (HTTP fallback)
    sendMessage: async (req, res) => {
        try {
            const { meetingId, message } = req.body;
            const userId = req.user.id;

            const messageId = await Chat.create(meetingId, userId, message);

            res.status(201).json({
                success: true,
                messageId,
                message: 'Message sent'
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Delete a message
    deleteMessage: async (req, res) => {
        try {
            const { messageId } = req.params;
            const userId = req.user.id;

            const deleted = await Chat.delete(messageId, userId);
            if (!deleted) {
                return res.status(404).json({ message: 'Message not found or unauthorized' });
            }

            res.json({ success: true, message: 'Message deleted' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = chatController;
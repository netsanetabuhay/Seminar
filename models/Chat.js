const db = require('../config/database');

const Chat = {
    create: async (meetingId, userId, message) => {
        const [result] = await db.query(
            'INSERT INTO chat_messages (meeting_id, user_id, message) VALUES (?, ?, ?)',
            [meetingId, userId, message]
        );
        return result.insertId;
    },

    getByMeeting: async (meetingId) => {
        const [rows] = await db.query(
            `SELECT c.*, u.username 
             FROM chat_messages c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.meeting_id = ? 
             ORDER BY c.sent_at ASC`,
            [meetingId]
        );
        return rows;
    },

    delete: async (messageId, userId) => {
        const [result] = await db.query(
            'DELETE FROM chat_messages WHERE id = ? AND user_id = ?',
            [messageId, userId]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Chat;
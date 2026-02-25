const db = require('../config/database');

const Participant = {
    add: async (meetingId, userId) => {
        const [result] = await db.query(
            'INSERT INTO participants (meeting_id, user_id) VALUES (?, ?)',
            [meetingId, userId]
        );
        return result.insertId;
    },

    remove: async (meetingId, userId) => {
        await db.query(
            'UPDATE participants SET left_at = NOW() WHERE meeting_id = ? AND user_id = ? AND left_at IS NULL',
            [meetingId, userId]
        );
    },

    getByMeeting: async (meetingId) => {
        const [rows] = await db.query(
            `SELECT p.*, u.username, u.email 
             FROM participants p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.meeting_id = ? AND p.left_at IS NULL`,
            [meetingId]
        );
        return rows;
    },

    isInMeeting: async (meetingId, userId) => {
        const [rows] = await db.query(
            'SELECT * FROM participants WHERE meeting_id = ? AND user_id = ? AND left_at IS NULL',
            [meetingId, userId]
        );
        return rows.length > 0;
    }
};

module.exports = Participant;
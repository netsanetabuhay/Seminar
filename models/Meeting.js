const db = require('../config/database');

const Meeting = {
    create: async (meetingCode, hostId, title = 'Untitled Meeting') => {
        const [result] = await db.query(
            'INSERT INTO meetings (meeting_code, host_id, title) VALUES (?, ?, ?)',
            [meetingCode, hostId, title]
        );
        return result.insertId;
    },

    findByCode: async (meetingCode) => {
        const [rows] = await db.query(
            'SELECT * FROM meetings WHERE meeting_code = ? AND is_active = true',
            [meetingCode]
        );
        return rows[0];
    },

    findById: async (id) => {
        const [rows] = await db.query(
            `SELECT m.*, u.username as host_name 
             FROM meetings m 
             JOIN users u ON m.host_id = u.id 
             WHERE m.id = ?`,
            [id]
        );
        return rows[0];
    },

    endMeeting: async (id) => {
        await db.query('UPDATE meetings SET is_active = false WHERE id = ?', [id]);
    },

    getUserMeetings: async (userId) => {
        const [rows] = await db.query(
            `SELECT m.*, 
             (SELECT COUNT(*) FROM participants WHERE meeting_id = m.id) as participant_count 
             FROM meetings m 
             WHERE m.host_id = ? OR m.id IN (SELECT meeting_id FROM participants WHERE user_id = ?)
             ORDER BY m.created_at DESC`,
            [userId, userId]
        );
        return rows;
    }
};

module.exports = Meeting;
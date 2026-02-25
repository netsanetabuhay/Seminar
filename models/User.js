const db = require('../config/database');

const User = {
    create: async (username, email, password) => {
        const [result] = await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        return result.insertId;
    },

    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    findByUsername: async (username) => {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }
};

module.exports = User;
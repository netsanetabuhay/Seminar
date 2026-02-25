const db = require('../config/database');

const dbService = {
    // Test database connection
    testConnection: async () => {
        try {
            const connection = await db.getConnection();
            console.log('Database connected successfully');
            connection.release();
            return true;
        } catch (error) {
            console.error('Database connection failed:', error);
            return false;
        }
    },

    // Run query with error handling
    query: async (sql, params) => {
        try {
            const [results] = await db.query(sql, params);
            return results;
        } catch (error) {
            console.error('Query error:', error);
            throw error;
        }
    },

    // Transaction support
    transaction: async (callback) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = dbService;
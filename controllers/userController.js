const User = require('../models/User');
const Meeting = require('../models/Meeting');

const userController = {
    // Get user profile
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            res.json({ success: true, user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ success: true, user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Get user statistics
    getUserStats: async (req, res) => {
        try {
            const userId = req.user.id;
            const meetings = await Meeting.getUserMeetings(userId);
            
            const stats = {
                totalMeetings: meetings.length,
                activeMeetings: meetings.filter(m => m.is_active).length
            };

            res.json({ success: true, stats });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = userController;
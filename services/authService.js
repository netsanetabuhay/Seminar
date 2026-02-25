const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const authService = {
    registerUser: async (userData) => {
        const { username, email, password } = userData;

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const userId = await User.create(username, email, hashedPassword);
        const user = await User.findById(userId);

        // Generate token
        const token = generateToken(user);

        return { user, token };
    },

    loginUser: async (email, password) => {
        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Generate token
        const token = generateToken(user);

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        };
    }
};

module.exports = authService;
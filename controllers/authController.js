const db = require('../config/database');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const authController = {
    // Register new user
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // Check if user exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const existingUsername = await User.findByUsername(username);
            if (existingUsername) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const userId = await User.create(username, email, hashedPassword);

            // Get created user
            const user = await User.findById(userId);

            // Generate token
            const token = generateToken(user);

            res.status(201).json({
                success: true,
                token,
                user
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate token
            const token = generateToken(user);

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Get current user profile
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ success: true, user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = authController;
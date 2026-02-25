const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

// Import socket service
const socketService = require('./services/socketService');

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible
app.set('io', io);

// Initialize socket service
socketService.initialize(io);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Seminar API is running' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
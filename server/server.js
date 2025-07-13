// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const configurationRoutes = require('./routes/configurationRoutes');
const userRoutes = require('./routes/userRoutes');
const { startDeviceStatusScheduler } = require('./utils/deviceScheduler');

dotenv.config();

const app = express();

// Create an HTTP server instance from your Express app
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ["GET", "POST"]
    }
});

// Make io (Socket.IO instance) accessible to Express app and other modules
app.set('socketio', io);

// Middleware (Express CORS should match Socket.IO CORS for consistency)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Use API Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/configurations', configurationRoutes);
app.use('/api/users', userRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Basic Error Handling Middleware
// This will catch any errors thrown by routes or async middleware (like asyncHandler)
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    const statusCode = err.statusCode || 500; // Use custom status code if available, else 500
    res.status(statusCode).json({
        message: err.message || 'Server Error', // Send a user-friendly error message
        // Optionally, send the stack trace in development for debugging
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
});


const PORT = process.env.PORT || 5000;

// Main server startup function
const startApplication = async () => {
    try {
        // Connect to MongoDB and WAIT for it to complete
        await connectDB();
        console.log('MongoDB connection successfully established.'); // Optional: confirm connection here

        // Start the HTTP server (which Socket.IO is attached to)
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            // Start the scheduler AFTER the server is fully listening and DB is connected
            startDeviceStatusScheduler(io);
        });
    } catch (error) {
        console.error('Failed to start server due to database connection error:', error);
        process.exit(1); // Exit the process if unable to connect to DB
    }
};

// Call the async function to start the application
startApplication();
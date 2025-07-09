const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const deviceRoutes = require('./routes/deviceRoutes');
const configurationRoutes = require('./routes/configurationRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Body parser for JSON data

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Device Routes
app.use('/api/devices', deviceRoutes);

// Configuration Routes
app.use('/api/configurations', configurationRoutes);

// Define the port to listen on
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration
const corsOptions = {
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'https://prefai-assessment.vercel.app',
    'https://prefaiassessment.onrender.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions
});

// Override console.log to emit logs
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function(...args) {
  const logMessage = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' ');
  originalConsoleLog.apply(console, args);
  io.emit('serverLog', logMessage);
};

console.error = function(...args) {
  const logMessage = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' ');
  originalConsoleError.apply(console, args);
  io.emit('serverLog', `ERROR: ${logMessage}`);
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const logMessage = `${new Date().toISOString()} - ${req.method} ${req.url}`;
  console.log(logMessage);
  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected to WebSocket');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Database connection - only connect if not in test mode
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/api-evaluator')
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
}

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`CORS enabled for: ${corsOptions.origin}`);
  });
}

module.exports = app; 
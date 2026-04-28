const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const Message = require('./models/Message');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

// Initialize the Express application
const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('sendMessage', async (data) => {
    try {
      // Auto-save to MongoDB
      const newMessage = await Message.create({
        user: data.userId,
        name: data.name || 'Anonymous',
        text: data.text
      });

      // Broadcast the strictly saved object ensuring timestamp accuracy
      io.emit('receiveMessage', {
        _id: newMessage._id,
        user: newMessage.user,
        name: newMessage.name,
        text: newMessage.text,
        timestamp: newMessage.createdAt
      });
    } catch (error) {
      console.error("Message save error:", error);
    }
  });

  socket.on('deleteMessage', async ({ messageId, userId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message && message.user.toString() === userId.toString()) {
        await Message.findByIdAndDelete(messageId);
        io.emit('messageDeleted', messageId);
      }
    } catch (error) {
      console.error("Message delete error:", error);
    }
  });

  socket.on('typing', (name) => {
    socket.broadcast.emit('userTyping', name);
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('userStopTyping');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Attach io to app so controllers can access it
app.set('io', io);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
})); // Allow cross-origin requests (e.g., from our React frontend)
app.use(express.json()); // Allow parsing of incoming JSON payloads

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Simple message fetch API strictly for chat initialization
app.get('/api/messages', async (req, res) => {
  try {
    // Limits payload conservatively
    const messages = await Message.find().sort({ createdAt: 1 }).limit(100);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// A simple test route to ensure server is running
app.get('/', (req, res) => {
  res.send('Collaboration App API is running...');
});

// Error Middleware (keep at the end)
app.use(notFound);
app.use(errorHandler);

// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Start listening for incoming requests
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

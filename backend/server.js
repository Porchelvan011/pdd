import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';
import { dbHelper } from './utils/dbHelper.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable dynamic developer CORS
app.use(cors({
  origin: '*', // Allows testing anywhere
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Main Entry Base Logger
app.use((req, res, next) => {
  console.log(`📡 [Express Routing] ${req.method} ${req.url}`);
  next();
});

// REST routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Mentorix API Gateway',
    version: '1.0.0',
    database: global.isMockDatabase ? 'Memory-Fallback' : 'Mongoose-MongoDB',
    status: 'Operational'
  });
});

// ========================
// SOCKET.IO REAL-TIME CHAT
// ========================
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

  // Register user into their personal signaling room
  socket.on('register', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 [Socket.io] User registered to room: user_${userId}`);
  });

  // Handle direct text and file messages
  socket.on('send_message', async (data) => {
    const { senderId, receiverId, text, attachment } = data;
    try {
      console.log(`✉️ [Socket.io] Message from ${senderId} to ${receiverId}: "${text}"`);

      // Store in Mongoose or Mock database
      const savedMessage = await dbHelper.create('Message', {
        senderId,
        receiverId,
        text,
        attachment: attachment || null,
        isRead: false
      });

      // Dispatch real-time events to both partners
      io.to(`user_${receiverId}`).emit('receive_message', savedMessage);
      io.to(`user_${senderId}`).emit('receive_message', savedMessage);

      // Create and dispatch an instant notification
      const sender = await dbHelper.findById('User', senderId);
      const newNotify = await dbHelper.create('Notification', {
        userId: receiverId,
        title: `Message from ${sender ? sender.name : 'Peer'}`,
        message: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        type: 'info',
        isRead: false
      });

      io.to(`user_${receiverId}`).emit('new_notification', newNotify);

    } catch (err) {
      console.error('Socket Message Error:', err.message);
    }
  });

  // Handle typing alerts
  socket.on('typing', (data) => {
    const { senderId, receiverId, isTyping } = data;
    io.to(`user_${receiverId}`).emit('peer_typing', { senderId, isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Initialize database connection and boot server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 [Server] Mentorix Gateway running on port ${PORT}`);
    console.log(`🤖 [Server] Status check available at http://localhost:${PORT}/`);
  });
});

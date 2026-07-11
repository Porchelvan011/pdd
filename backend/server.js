import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';
import { dbHelper } from './utils/dbHelper.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Security headers (CSP, X-Frame-Options, HSTS, etc.)
app.use(helmet());

// CORS: restrict to an allowlist in production; permissive only in dev/demo.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (process.env.NODE_ENV !== 'production') return cb(null, true); // dev/demo: allow all
    if (!origin) return cb(null, true);
    if (
      ALLOWED_ORIGINS.includes(origin) || 
      origin.includes('onrender.com') || 
      origin.includes('localhost') ||
      ALLOWED_ORIGINS.length === 0
    ) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '100kb' })); // cap body size

// Rate limiting: protect auth endpoints from brute-force/credential-stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT || 20), // 20 requests / 15 min / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' }
});
app.use('/api/auth', authLimiter);

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

      // Store in Mongoose or Mock database (sanitize text to neutralize XSS)
      const savedMessage = await dbHelper.create('Message', {
        senderId,
        receiverId,
        text: typeof text === 'string' ? text.replace(/<[^>]*>/g, '').replace(/[<>]/g, '') : '',
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

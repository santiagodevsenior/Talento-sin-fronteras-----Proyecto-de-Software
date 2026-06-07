require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const jwt = require('jsonwebtoken');

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const apiRoutes = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { Message } = require('./models');

const app = express();
const server = http.createServer(app);

// ── Socket.IO ──────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true },
});

// Socket auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  onlineUsers.set(socket.user.id, socket.id);
  io.emit('online_users', Array.from(onlineUsers.keys()));

  socket.on('send_message', async ({ receiverId, content, mentorshipId }) => {
    if (!content?.trim()) return;
    const msg = await Message.create({
      senderId: socket.user.id, receiverId, content: content.trim(), mentorshipId,
    });
    const receiverSocket = onlineUsers.get(receiverId);
    const payload = { ...msg.toJSON(), senderId: socket.user.id };
    if (receiverSocket) io.to(receiverSocket).emit('receive_message', payload);
    socket.emit('message_sent', payload);
  });

  socket.on('typing', ({ receiverId, isTyping }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) io.to(receiverSocket).emit('user_typing', { userId: socket.user.id, isTyping });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.user.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

// ── Express Middleware ─────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Swagger ────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Talento Sin Frontera API', version: '1.0.0', description: 'REST API for TSF platform' },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

// ── Health check ───────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', apiRoutes);

// ── Error Handling ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── DB sync + Start ────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  console.log('✅ Database connected and synced');
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

start().catch((err) => { console.error('Failed to start server:', err); process.exit(1); });

module.exports = { app, server };

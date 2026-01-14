const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// IN-MEMORY DATA STORAGE
// ============================================

const services = [
  { id: 1, name: 'Fees Payment', counter: 'Counter 1' },
  { id: 2, name: 'Document Issuance', counter: 'Counter 2' },
  { id: 3, name: 'ID Card Generation', counter: 'Counter 3' },
  { id: 4, name: 'Approval Request', counter: 'Counter 4' },
  { id: 5, name: 'Grievance Registration', counter: 'Counter 5' },
];

let tokens = []; // In-memory token storage
let currentServingToken = null; // Currently being served token
let tokenCounter = 1000; // Unique token ID generator

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the queue for a specific service
 */
function getServiceQueue(serviceId) {
  return tokens.filter((t) => t.serviceId === serviceId && t.status !== 'completed');
}

/**
 * Get position of a token in its service queue
 */
function getTokenPosition(tokenId, serviceId) {
  const queue = getServiceQueue(serviceId);
  const position = queue.findIndex((t) => t.id === tokenId);
  return position !== -1 ? position : null;
}

/**
 * Broadcast queue updates to all connected clients
 */
function broadcastQueueUpdate() {
  const queueStatus = {
    tokens: tokens,
    currentServing: currentServingToken,
    queues: services.map((service) => ({
      serviceId: service.id,
      serviceName: service.name,
      queueCount: getServiceQueue(service.id).length,
    })),
  };
  io.emit('queueUpdate', queueStatus);
}

// ============================================
// REST API ROUTES
// ============================================

/**
 * GET /api/services
 * Retrieve all available services
 */
app.get('/api/services', (req, res) => {
  res.json(services);
});

/**
 * GET /api/tokens
 * Retrieve all tokens with their status
 */
app.get('/api/tokens', (req, res) => {
  res.json({
    tokens: tokens,
    currentServing: currentServingToken,
  });
});

/**
 * POST /api/tokens/generate
 * Generate a new token for a student
 * Body: { serviceId, studentName, studentId }
 */
app.post('/api/tokens/generate', (req, res) => {
  const { serviceId, studentName, studentId } = req.body;

  // Validate input
  if (!serviceId || !studentName || !studentId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if service exists
  const service = services.find((s) => s.id === parseInt(serviceId));
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  // Create new token
  const newToken = {
    id: ++tokenCounter,
    serviceId: parseInt(serviceId),
    serviceName: service.name,
    studentName,
    studentId,
    status: 'waiting', // waiting, serving, completed
    createdAt: new Date(),
  };

  tokens.push(newToken);

  // Broadcast update
  broadcastQueueUpdate();

  res.json({
    success: true,
    token: newToken,
    position: getTokenPosition(newToken.id, serviceId),
  });
});

/**
 * PUT /api/tokens/next
 * Call the next token to be served (Admin only)
 * Body: { serviceId }
 */
app.put('/api/tokens/next', (req, res) => {
  const { serviceId } = req.body;

  if (!serviceId) {
    return res.status(400).json({ error: 'Service ID required' });
  }

  // Get the queue for this service
  const queue = getServiceQueue(parseInt(serviceId));

  if (queue.length === 0) {
    return res.status(400).json({ error: 'No tokens in queue' });
  }

  // Mark previous serving token as completed if exists
  if (currentServingToken && currentServingToken.status === 'serving') {
    const prevToken = tokens.find((t) => t.id === currentServingToken.id);
    if (prevToken) {
      prevToken.status = 'completed';
    }
  }

  // Get the first token in the queue
  const nextToken = queue[0];
  nextToken.status = 'serving';
  currentServingToken = nextToken;

  // Broadcast update
  broadcastQueueUpdate();

  res.json({
    success: true,
    token: nextToken,
    message: `Token ${nextToken.id} is now being served`,
  });
});

/**
 * PUT /api/tokens/complete
 * Mark a token as completed (Admin only)
 * Body: { tokenId }
 */
app.put('/api/tokens/complete', (req, res) => {
  const { tokenId } = req.body;

  if (!tokenId) {
    return res.status(400).json({ error: 'Token ID required' });
  }

  const token = tokens.find((t) => t.id === parseInt(tokenId));

  if (!token) {
    return res.status(404).json({ error: 'Token not found' });
  }

  token.status = 'completed';

  // Clear current serving if this is the current token
  if (currentServingToken && currentServingToken.id === token.id) {
    currentServingToken = null;
  }

  // Broadcast update
  broadcastQueueUpdate();

  res.json({
    success: true,
    token: token,
    message: `Token ${tokenId} marked as completed`,
  });
});

/**
 * GET /api/queue/:serviceId
 * Get the queue status for a specific service
 */
app.get('/api/queue/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  const queue = getServiceQueue(parseInt(serviceId));

  res.json({
    serviceId: parseInt(serviceId),
    queueCount: queue.length,
    tokens: queue,
    currentServing: currentServingToken,
  });
});

/**
 * GET /api/token/:tokenId
 * Get details of a specific token
 */
app.get('/api/token/:tokenId', (req, res) => {
  const { tokenId } = req.params;
  const token = tokens.find((t) => t.id === parseInt(tokenId));

  if (!token) {
    return res.status(404).json({ error: 'Token not found' });
  }

  const position = getTokenPosition(token.id, token.serviceId);

  res.json({
    token: token,
    position: position,
    queueSize: getServiceQueue(token.serviceId).length,
    currentServing: currentServingToken,
  });
});

// ============================================
// SOCKET.IO REAL-TIME EVENTS
// ============================================

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Send current state to newly connected client
  socket.emit('queueUpdate', {
    tokens: tokens,
    currentServing: currentServingToken,
    queues: services.map((service) => ({
      serviceId: service.id,
      serviceName: service.name,
      queueCount: getServiceQueue(service.id).length,
    })),
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // Handle token status requests from student
  socket.on('getTokenStatus', (tokenId) => {
    const token = tokens.find((t) => t.id === parseInt(tokenId));
    if (token) {
      const position = getTokenPosition(token.id, token.serviceId);
      socket.emit('tokenStatus', {
        token: token,
        position: position,
        queueSize: getServiceQueue(token.serviceId).length,
        currentServing: currentServingToken,
      });
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Smart Queue Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket listening for real-time updates`);
  console.log(`✅ Ready for students and admins to connect`);
});

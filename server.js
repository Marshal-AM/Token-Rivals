const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store active rooms and their participants
const rooms = new Map();
const clients = new Map();

console.log('🚀 TokenRivals Room Server starting...');

// Generate a random room ID
function generateRoomId() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Log function with timestamps
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

wss.on('connection', (ws, req) => {
  const clientId = crypto.randomBytes(8).toString('hex');
  clients.set(ws, { id: clientId, roomId: null, isHost: false });
  
  log(`🔌 New client connected: ${clientId}`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      log(`📨 Received message from ${clientId}: ${data.type}`);
      
      switch (data.type) {
        case 'CREATE_ROOM':
          handleCreateRoom(ws, data);
          break;
        case 'GET_ROOM_INFO':
          handleGetRoomInfo(ws, data);
          break;
        case 'JOIN_ROOM':
          handleJoinRoom(ws, data);
          break;
        case 'HANDSHAKE_ACCEPT':
          handleHandshakeAccept(ws, data);
          break;
        case 'HANDSHAKE_REJECT':
          handleHandshakeReject(ws, data);
          break;
        case 'PLAYER_READY':
          handlePlayerReady(ws, data);
          break;
        default:
          log(`❌ Unknown message type: ${data.type}`, 'ERROR');
      }
    } catch (error) {
      log(`❌ Error parsing message: ${error.message}`, 'ERROR');
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    if (client) {
      log(`🔌 Client disconnected: ${client.id}`);
      
      // Clean up room if host disconnects
      if (client.roomId && client.isHost) {
        const room = rooms.get(client.roomId);
        if (room) {
          log(`🗑️ Host disconnected, cleaning up room: ${client.roomId}`);
          // Notify other participants
          if (room.guest) {
            room.guest.send(JSON.stringify({
              type: 'HOST_DISCONNECTED',
              roomId: client.roomId
            }));
          }
          rooms.delete(client.roomId);
        }
      }
      
      // Remove from room if guest
      if (client.roomId && !client.isHost) {
        const room = rooms.get(client.roomId);
        if (room && room.guest === ws) {
          log(`👤 Guest disconnected from room: ${client.roomId}`);
          room.guest = null;
          // Notify host
          if (room.host) {
            room.host.send(JSON.stringify({
              type: 'GUEST_DISCONNECTED',
              roomId: client.roomId
            }));
          }
        }
      }
      
      clients.delete(ws);
    }
  });

  ws.on('error', (error) => {
    log(`❌ WebSocket error for ${clientId}: ${error.message}`, 'ERROR');
  });
});

function handleCreateRoom(ws, data) {
  const client = clients.get(ws);
  const roomId = generateRoomId();
  
  log(`🏠 Creating room: ${roomId} for client: ${client.id}`);
  
  // Check if room already exists (very unlikely but possible)
  if (rooms.has(roomId)) {
    log(`⚠️ Room ID collision detected: ${roomId}`, 'WARN');
    ws.send(JSON.stringify({
      type: 'ROOM_CREATION_FAILED',
      error: 'Room ID collision, please try again'
    }));
    return;
  }
  
  // Create room
  const room = {
    id: roomId,
    host: ws,
    guest: null,
    hostData: data.hostData,
    status: 'waiting',
    createdAt: new Date(),
    requiredStake: data.hostData?.stake || 0,
    betType: data.hostData?.bet || 'LONG'
  };
  
  rooms.set(roomId, room);
  client.roomId = roomId;
  client.isHost = true;
  
  log(`✅ Room created successfully: ${roomId}`);
  
  // Send room creation confirmation
  ws.send(JSON.stringify({
    type: 'ROOM_CREATED',
    roomId: roomId,
    hostData: data.hostData
  }));
  
  log(`📊 Active rooms: ${rooms.size}`);
}

function handleGetRoomInfo(ws, data) {
  const roomId = data.roomId;
  
  log(`🔍 Client requesting room info for: ${roomId}`);
  
  const room = rooms.get(roomId);
  
  if (!room) {
    log(`❌ Room not found: ${roomId}`);
    ws.send(JSON.stringify({
      type: 'ROOM_INFO_FAILED',
      error: 'Room not found'
    }));
    return;
  }
  
  if (room.guest) {
    log(`❌ Room ${roomId} is full`);
    ws.send(JSON.stringify({
      type: 'ROOM_INFO_FAILED',
      error: 'Room is full'
    }));
    return;
  }
  
  // Send room information
  ws.send(JSON.stringify({
    type: 'ROOM_INFO_SUCCESS',
    roomId: roomId,
    requiredStake: room.requiredStake,
    betType: room.betType,
    hostData: room.hostData
  }));
  
  log(`✅ Room info sent for: ${roomId} (Stake: $${room.requiredStake}, Bet: ${room.betType})`);
}

function handleJoinRoom(ws, data) {
  const client = clients.get(ws);
  const roomId = data.roomId;
  
  log(`🚪 Client ${client.id} attempting to join room: ${roomId}`);
  
  const room = rooms.get(roomId);
  
  if (!room) {
    log(`❌ Room not found: ${roomId}`);
    ws.send(JSON.stringify({
      type: 'JOIN_ROOM_FAILED',
      error: 'Room not found'
    }));
    return;
  }
  
  if (room.guest) {
    log(`❌ Room ${roomId} is full`);
    ws.send(JSON.stringify({
      type: 'JOIN_ROOM_FAILED',
      error: 'Room is full'
    }));
    return;
  }

  // Validate stake amount
  const guestStake = data.guestData?.stake || 0;
  if (guestStake !== room.requiredStake) {
    log(`❌ Stake mismatch - Required: ${room.requiredStake}, Provided: ${guestStake}`);
    ws.send(JSON.stringify({
      type: 'JOIN_ROOM_FAILED',
      error: `Stake amount must be $${room.requiredStake}`
    }));
    return;
  }

  // Validate bet type
  const guestBet = data.guestData?.bet;
  if (guestBet !== room.betType) {
    log(`❌ Bet type mismatch - Required: ${room.betType}, Provided: ${guestBet}`);
    ws.send(JSON.stringify({
      type: 'JOIN_ROOM_FAILED',
      error: `This room requires ${room.betType} betting. Your bet will be automatically set to ${room.betType}.`
    }));
    return;
  }
  
  // Add guest to room
  room.guest = ws;
  room.guestData = data.guestData;
  client.roomId = roomId;
  client.isHost = false;
  
  log(`✅ Guest ${client.id} joined room: ${roomId}`);
  
  // Send join confirmation to guest
  ws.send(JSON.stringify({
    type: 'JOIN_ROOM_SUCCESS',
    roomId: roomId,
    hostData: room.hostData
  }));
  
  // Notify host about guest joining
  room.host.send(JSON.stringify({
    type: 'GUEST_JOINED',
    roomId: roomId,
    guestData: data.guestData
  }));
  
  // Initiate handshake
  log(`🤝 Initiating handshake for room: ${roomId}`);
  room.status = 'handshaking';
  
  // Send handshake request to host
  room.host.send(JSON.stringify({
    type: 'HANDSHAKE_REQUEST',
    roomId: roomId,
    guestData: data.guestData
  }));
}

function handleHandshakeAccept(ws, data) {
  const client = clients.get(ws);
  const roomId = data.roomId;
  
  log(`✅ Host accepted handshake for room: ${roomId}`);
  
  const room = rooms.get(roomId);
  if (!room || room.host !== ws) {
    log(`❌ Invalid handshake accept from non-host client`, 'ERROR');
    return;
  }
  
  room.status = 'accepted';
  
  // Notify guest about handshake acceptance
  if (room.guest) {
    room.guest.send(JSON.stringify({
      type: 'HANDSHAKE_ACCEPTED',
      roomId: roomId,
      hostData: room.hostData
    }));
  }
  
  // Notify host about successful handshake
  ws.send(JSON.stringify({
    type: 'HANDSHAKE_COMPLETE',
    roomId: roomId,
    guestData: room.guestData
  }));
  
  log(`🎉 Handshake completed for room: ${roomId}`);
}

function handleHandshakeReject(ws, data) {
  const client = clients.get(ws);
  const roomId = data.roomId;
  
  log(`❌ Host rejected handshake for room: ${roomId}`);
  
  const room = rooms.get(roomId);
  if (!room || room.host !== ws) {
    log(`❌ Invalid handshake reject from non-host client`, 'ERROR');
    return;
  }
  
  // Notify guest about handshake rejection
  if (room.guest) {
    room.guest.send(JSON.stringify({
      type: 'HANDSHAKE_REJECTED',
      roomId: roomId,
      reason: data.reason || 'Host rejected the connection'
    }));
    
    // Remove guest from room
    const guestClient = clients.get(room.guest);
    if (guestClient) {
      guestClient.roomId = null;
    }
    room.guest = null;
  }
  
  room.status = 'waiting';
  
  log(`🔄 Room ${roomId} reset to waiting state`);
}

function handlePlayerReady(ws, data) {
  const client = clients.get(ws);
  const roomId = data.roomId;
  
  log(`✅ Player ready in room: ${roomId} (${client.isHost ? 'host' : 'guest'})`);
  
  const room = rooms.get(roomId);
  if (!room) {
    log(`❌ Room not found for player ready: ${roomId}`, 'ERROR');
    return;
  }
  
  // Mark player as ready
  if (client.isHost) {
    room.hostReady = true;
  } else {
    room.guestReady = true;
  }
  
  // Check if both players are ready
  if (room.hostReady && room.guestReady) {
    log(`🎮 Both players ready, starting tournament for room: ${roomId}`);
    
    // Send tournament start notification to both players
    room.host.send(JSON.stringify({
      type: 'TOURNAMENT_START',
      roomId: roomId,
      hostData: room.hostData,
      guestData: room.guestData
    }));
    
    room.guest.send(JSON.stringify({
      type: 'TOURNAMENT_START',
      roomId: roomId,
      hostData: room.hostData,
      guestData: room.guestData
    }));
    
    room.status = 'tournament';
  }
}

// Health check endpoint
server.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      activeRooms: rooms.size,
      activeClients: clients.size,
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Start server
const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  log(`🎯 TokenRivals Room Server running on port ${PORT}`);
  log(`📊 Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  log('🛑 Shutting down server...');
  wss.close(() => {
    server.close(() => {
      log('✅ Server shutdown complete');
      process.exit(0);
    });
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  log(`💥 Uncaught Exception: ${error.message}`, 'ERROR');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`💥 Unhandled Rejection at: ${promise}, reason: ${reason}`, 'ERROR');
  process.exit(1);
}); 
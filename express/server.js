const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname)));

const clients = new Map();

wss.on('connection', (socket, req) => {
  console.log('Client connected');

  const clientId = Date.now();
  const clientInfo = {
    socket: socket,
    roomId: null,
  };

  clients.set(clientId, clientInfo);

  socket.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.type === 'join') {
      clientInfo.roomId = message.roomId;
      console.log(`Client ${clientId} joined room ${message.roomId}`);
    } else if (message.type === 'message') {
      broadcastMessage(clientId, message.content);
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');
    clients.delete(clientId);
  });
});

function broadcastMessage(senderId, message) {
  const senderInfo = clients.get(senderId);

  if (!senderInfo || !senderInfo.roomId) {
    return;
  }

  clients.forEach((clientInfo, clientId) => {
    if (clientId !== senderId && clientInfo.roomId === senderInfo.roomId) {
      clientInfo.socket.send(`${senderId}: ${message}`);
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
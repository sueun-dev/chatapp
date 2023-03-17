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
      updateUsersOnline(clientInfo.roomId);
    } else if (message.type === 'message') {
      const messageId = `${clientId}-${Date.now()}`;
      broadcastMessage(clientId, message.content, messageId);
    } else if (message.type === 'delete') {
      deleteMessage(clientId, message.messageId);
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');
    const roomId = clientInfo.roomId;
    clients.delete(clientId);
    updateUsersOnline(roomId);
  });
});

function broadcastMessage(senderId, message, messageId) {
  const senderInfo = clients.get(senderId);

  if (!senderInfo || !senderInfo.roomId) {
    return;
  }

  clients.forEach((clientInfo, clientId) => {
    if (clientInfo.roomId === senderInfo.roomId) {
      const messageType = (clientId === senderId) ? 'self' : 'other';
      clientInfo.socket.send(JSON.stringify({ type: 'message', senderId: messageType, content: message, messageId: messageId }));
    }
  });
}

function updateUsersOnline(roomId) {
  const usersOnline = Array.from(clients.values()).filter(client => client.roomId === roomId).length;

  clients.forEach((clientInfo) => {
    if (clientInfo.roomId === roomId) {
      clientInfo.socket.send(JSON.stringify({ type: 'usersOnline', count: usersOnline }));
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

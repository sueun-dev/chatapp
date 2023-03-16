const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 5500 });

const clients = new Map();

server.on('connection', (socket, req) => {
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

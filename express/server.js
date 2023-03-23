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
const activeRooms = new Set();

let currentUsername = null;

wss.on('connection', (socket, req) => {
  console.log('Client connected');

  const clientId = Date.now();
  const clientInfo = {
    socket: socket,
    roomId: null,
  };

  clients.set(clientId, clientInfo);

  //이부분에서 message.username 할때 이름이 사라짐
  socket.on('message', (data) => {
    const message = JSON.parse(data);
    console.log(currentUsername)
    currentUsername = message.username
    console.log('---')
    console.log(currentUsername)
    console.log('---')
    if (message.type === 'leave') {
      //console.log(`Client ${clientId} left room ${message.roomId}`);
      updateUsersOnline(clientInfo.roomId);
      return;
    }
    if (message.type === 'join') {
      clientInfo.roomId = message.roomId;
      clientInfo.username = currentUsername; // Store the username
      //console.log(currentUsername)
      activeRooms.add(clientInfo.roomId);
      //console.log(`Client ${clientId} joined room ${message.roomId}`);
      updateUsersOnline(clientInfo.roomId);
    } else if (message.type === 'message') {
      const messageId = `${clientId}-${Date.now()}`;
      broadcastMessage(clientId, message.content, messageId);
    } else if (message.type === 'delete') {
      deleteMessage(clientId, message.messageId);
    } else if (message.type === 'getRooms') {
      sendRoomsList(clientId);
    }
  });

  socket.on('close', () => {
    //console.log('Client disconnected');
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

  const username = senderInfo.username; // Get the username from the senderInfo

  clients.forEach((clientInfo, clientId) => {
    if (clientInfo.roomId === senderInfo.roomId) {
      const messageType = clientId === senderId ? 'self' : 'other';
      //console.log(username)
      //console.log(message)
      clientInfo.socket.send(
        JSON.stringify({
          type: 'message',
          senderId: messageType,
          content: message,
          messageId: messageId,
          username: username, // Include the username in the message
        })
      );
    }
  });
}

function updateUsersOnline(roomId) {
  const usersInRoom = Array.from(clients.values())
    .filter((client) => client.roomId === roomId)
    .map((client) => client.username);

  const usersOnline = usersInRoom.length;

  clients.forEach((clientInfo) => {
    if (clientInfo.roomId === roomId) {
      clientInfo.socket.send(
        JSON.stringify({
          type: 'usersOnline',
          count: usersOnline,
          users: usersInRoom,
        })
      );
    }
  });

  if (usersOnline === 0) {
    activeRooms.delete(roomId);
  }
}

function sendRoomsList(clientId) {
  const clientInfo = clients.get(clientId);

  if (clientInfo) {
    clientInfo.socket.send(
      JSON.stringify({ type: 'roomsList', rooms: Array.from(activeRooms) })
    );
  }
}

function deleteMessage(senderId, messageId) {
  const senderInfo = clients.get(senderId);

  if (!senderInfo || !senderInfo.roomId) {
    return;
  }

  clients.forEach((clientInfo, clientId) => {
    if (clientInfo.roomId === senderInfo.roomId) {
      clientInfo.socket.send(
        JSON.stringify({
          type: 'delete',
          messageId: messageId,
        })
      );
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  //console.log(`Server listening on port ${PORT}`);
});

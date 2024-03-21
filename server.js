// 필요한 모듈을 불러옵니다: Express, HTTP, WebSocket, Path
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// Express 애플리케이션을 초기화합니다.
const app = express();
// 정적 파일을 제공하는 미들웨어를 설정합니다. 여기서는 'public' 디렉토리를 사용합니다.
app.use(express.static(path.join(__dirname, 'public')));

// Create an HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname)));

// Store clients and active rooms
const clients = new Map();
const activeRooms = new Set();

let currentUsername = null;

wss.on('connection', (socket, req) => {
  isPrivate: false
  // Assign a unique ID for each client
  const clientId = Date.now();
  const clientInfo = {
    socket: socket,
    roomId: null,
  };
  

  clients.set(clientId, clientInfo);

  //방을 변경해도 currentUsername은 유지, priavte 버튼과 stop chat 버튼만 작동 안함. 다른 버튼은 모두 여길 통해서 작동됨
  socket.on('message', (data) => {
    const message = JSON.parse(data);
    
    currentUsername = message.username
    if (message.type === 'leave') {
      const roomId = clientInfo.roomId;
      clientInfo.roomId = null; // Set the client's roomId to null
      // 이부분이 실시간으로 방에  Users online 을 변경해주는곳
      updateUsersOnline(roomId);
      return;
    }
    if (message.type === "join") {
      checkEmptyRooms();
      clientInfo.roomId = message.roomId;
      clientInfo.username = message.username;
      clientInfo.isPrivate = message.isPrivate;
      activeRooms.add(clientInfo.roomId);
      //추가작동
      updateUsersOnline(clientInfo.roomId);
    } else if (message.type === 'message') {
      const messageId = `${clientId}-${Date.now()}`;
      broadcastMessage(clientId, message.content, messageId);
    } else if (message.type === 'delete') {
      deleteMessage(clientId, message.messageId);
    } else if (message.type === 'getRooms') {
      checkEmptyRooms();
      sendRoomsList(clientId);
    }
  });

// Update the 'close' event listener
// Add these lines at the beginning of the 'close' event listener
socket.on('close', () => {
  const roomId = clientInfo.roomId;
  clients.delete(clientId);

  if (roomId) {
    updateUsersOnline(roomId); // Update the users online count when a user leaves the chat room or closes the webpage
  }

  checkEmptyRooms(); // Add this line to check for empty rooms when a client disconnects
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
}


// Add this function
function checkEmptyRooms() {
  activeRooms.forEach((roomId) => {
    const usersInRoom = Array.from(clients.values()).filter(
      (client) => client.roomId === roomId
    );

    if (usersInRoom.length === 0) {
      activeRooms.delete(roomId);
    }
  });
}

// Update the sendRoomsList function to filter private rooms:
function sendRoomsList(clientId) {
  const clientInfo = clients.get(clientId);

  if (clientInfo) {
    const publicRooms = Array.from(activeRooms).map((roomId) => {
      const roomClients = Array.from(clients.values()).filter(
        (client) => client.roomId === roomId
      );

      return {
        id: roomId,
        isPrivate: roomClients.some((client) => client.isPrivate),
        usersCount: roomClients.length,
      };
    }).filter((room) => !room.isPrivate);

    clientInfo.socket.send(
      JSON.stringify({ type: "roomsList", rooms: publicRooms })
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
  console.log(`Server listening on port ${PORT}`);
});
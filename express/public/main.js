const startChatBtn = document.getElementById('startChat');
const stopChatBtn = document.getElementById('stopChat');
const chatArea = document.getElementById('chatArea');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
let socket = null;

startChatBtn.addEventListener('click', () => {
  const roomId = document.getElementById('roomId').value.trim();
  console.log(roomId)
  if (roomId) {
    startChat(roomId);
  }
});

stopChatBtn.addEventListener('click', () => {
  stopChat();
});

sendMessageBtn.addEventListener('click', () => {
  sendMessage();
});

messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

function startChat(roomId) {
  socket = new WebSocket('wss://port-0-chatapp-6g2llfb56c7n.sel3.cloudtype.app');

  socket.addEventListener('open', () => {
    onSocketOpen();
    joinRoom(roomId);
  });
  socket.addEventListener('message', onSocketMessage);
  socket.addEventListener('close', onSocketClose);
  socket.addEventListener('error', onSocketError);

  startChatBtn.disabled = true;
  stopChatBtn.disabled = false;
}

function stopChat() {
  if (socket) {
    socket.close();
  }

  startChatBtn.disabled = false;
  stopChatBtn.disabled = true;
  chatArea.style.display = 'none';
  messages.innerHTML = '';
}

function joinRoom(roomId) {
  if (socket) {
    socket.send(JSON.stringify({ type: 'join', roomId: roomId }));
  }
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message && socket) {
      socket.send(JSON.stringify({ type: 'message', content: message }));
      messageInput.value = '';
    }
  }
  

function onSocketOpen() {
  chatArea.style.display = 'block';
}

function onSocketMessage(event) {
  const message = event.data;
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messages.appendChild(messageElement);
}

function onSocketClose(event) {
  stopChat();
}

function onSocketError(event) {
  console.error('WebSocket error:', event);
}

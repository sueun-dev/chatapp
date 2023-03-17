const startChatBtn = document.getElementById('startChat');
const stopChatBtn = document.getElementById('stopChat');
const chatArea = document.getElementById('chatArea');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
const deleteMessageBtn = document.getElementById('deleteMessage');
const usersOnline = document.getElementById('usersOnline');
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

deleteMessageBtn.addEventListener('click', () => {
  deleteMessage();
});

messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

function startChat(roomId) {
  socket = new WebSocket('wss://port-0-chatapp-6g2llfb56c7n.sel3.cloudtype.app');
  //socket = new WebSocket('ws://localhost:3000/');

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

function deleteMessage() {
  if (messages.lastChild && messages.lastChild.classList.contains('outgoing')) {
    messages.removeChild(messages.lastChild);
  }
}

function onSocketOpen() {
  chatArea.style.display = 'block';
}


function onSocketMessage(event) {
  const messageData = JSON.parse(event.data);
  
  if (messageData.type === 'message') {
    const messageElement = document.createElement('div');
    messageElement.classList.add(messageData.senderId === 'self' ? 'outgoing' : 'incoming');
    messageElement.textContent = messageData.content;
    messageElement.dataset.messageId = messageData.messageId;
    messageElement.addEventListener('click', deleteSpecificMessage);
    messages.appendChild(messageElement);
  } else if (messageData.type === 'usersOnline') {
    usersOnline.textContent = `Users online: ${messageData.count}`;
  } else if (messageData.type === 'delete') {
    const messageToDelete = document.querySelector(`[data-message-id="${messageData.messageId}"]`);
    if (messageToDelete) {
      messages.removeChild(messageToDelete);
    }
  }
}

function deleteSpecificMessage(event) {
  const messageId = event.target.dataset.messageId;
  if (socket && messageId) {
    socket.send(JSON.stringify({ type: 'delete', messageId: messageId }));
  }
}



function onSocketClose(event) {
  stopChat();
}

function onSocketError(event) {
  console.error('WebSocket error:', event);
}

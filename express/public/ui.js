const startChatBtn = document.getElementById('startChat');
const stopChatBtn = document.getElementById('stopChat');
const chatArea = document.getElementById('chatArea');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
const deleteMessageBtn = document.getElementById('deleteMessage');
const usersOnline = document.getElementById('usersOnline');

startChatBtn.addEventListener('click', () => {
  const roomId = document.getElementById('roomId').value.trim();
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

function refreshRoomsList() {
  if (socket) {
    socket.send(JSON.stringify({ type: 'getRooms' }));
  }
}


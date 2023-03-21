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

function updateRoomsList(rooms) {
  const roomsList = document.getElementById('roomsList');
  roomsList.innerHTML = '';

  rooms.forEach((room) => {
    const roomElement = document.createElement('li');
    roomElement.textContent = room;
    roomElement.addEventListener('click', () => joinRoom(room));
    roomsList.appendChild(roomElement);
  });
}

function updateRoomNumber(roomId) {
  const roomNumber = document.getElementById('roomNumber');
  roomNumber.textContent = `You are in room ${roomId}`;
}


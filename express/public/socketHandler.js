

let socket = null;
let currentRoomId = null; // Add this line
let currentUsername = null;

//웹 시작할때 실행
function startChat(roomId) {
  socket = new WebSocket('wss://port-0-chatapp-6g2llfb56c7n.sel3.cloudtype.app');
  //socket = new WebSocket('ws://localhost:3000/');

  socket.addEventListener('open', () => {
    onSocketOpen();
    //처음 시작할때 username과 내가 지정한 roomId
    const username = document.getElementById('username').value.trim(); // Get the username from the input field
    //정상작동
    currentUsername = username;
    joinRoom(roomId, currentUsername); // Pass the username when joining the room
    socket.send(JSON.stringify({ type: 'getRooms' })); // Request the list of active chat rooms

    updateRoomNumber(roomId);
  });

  socket.addEventListener('message', onSocketMessage);
  socket.addEventListener('close', onSocketClose);
  socket.addEventListener('error', onSocketError);

  startChatBtn.disabled = true;
  stopChatBtn.disabled = false;
}

function updateRoomsList(rooms) {
  const roomsList = document.getElementById('roomsList');
  roomsList.innerHTML = '';

  rooms.forEach((room) => {
    const roomElement = document.createElement('li');
    roomElement.textContent = room;
    roomElement.addEventListener('click', () => joinRoom(room, currentUsername));
    roomsList.appendChild(roomElement);
  });
}

function updateRoomNumber(roomId) {
  const roomNumber = document.getElementById('roomNumber');
  roomNumber.textContent = `You are in room ${roomId}`;
}

//Stop Chat 눌렀을때
function stopChat() {
  if (socket) {
    socket.close();
  }

  startChatBtn.disabled = false;
  stopChatBtn.disabled = true;
  chatArea.style.display = 'none';
  messages.innerHTML = '';
}

//이게 위에 
function joinRoom(roomId, currentUsername) {
  if (socket) {
    updateRoomNumber(roomId);
    socket.send(JSON.stringify({ type: 'leave', roomId: currentRoomId })); // Leave the previous room
    socket.send(JSON.stringify({ type: 'join', roomId: roomId, username: currentUsername }));
    currentRoomId = roomId; // Update the currentRoomId
  }
}

//여기는 채팅창 변경해도 username 유지됌
function sendMessage() {
  const message = messageInput.value.trim();
  if (message && socket) {
    socket.send(
      JSON.stringify({ type: 'message', content: message, username: currentUsername })
    ); // Send the username with the message
    messageInput.value = '';
  }
}

//버튼 눌러야 내용이 삭제됌. 드레그해서 삭제되는 부분은 아님
function deleteMessage() {
  if (messages.lastChild && messages.lastChild.classList.contains('outgoing')) {
    messages.removeChild(messages.lastChild);
  }
}

//처음 실행할때 
function onSocketOpen() {
  chatArea.style.display = 'block';
}

//이부분에서 닉네임 소멸
function onSocketMessage(event) {
  const messageData = JSON.parse(event.data);
  console.log(messageData);

  switch (messageData.type) {
    case 'message':
      handleMessage(messageData);
      break;
    case 'usersOnline':
      handleUsersOnline(messageData);
      break;
    case 'delete':
      handleDelete(messageData);
      break;
    case 'roomsList':
      handleRoomsList(messageData);
      break;
    default:
      console.warn('Unknown message type:', messageData.type);
  }
}

function handleMessage(messageData) {
  const messageElement = document.createElement('div');
  messageElement.classList.add(
    messageData.senderId === 'self' ? 'outgoing' : 'incoming'
  );

  const usernameElement = document.createElement('small');
  usernameElement.textContent = messageData.username;
  usernameElement.classList.add('username');
  messageElement.appendChild(usernameElement);

  const contentElement = document.createElement('span');
  contentElement.textContent = messageData.content;
  messageElement.appendChild(contentElement);
  messageElement.dataset.messageId = messageData.messageId;
  messageElement.addEventListener('click', deleteSpecificMessage);
  messages.appendChild(messageElement);
}

//실시간 작동
function handleUsersOnline(messageData) {
  usersOnline.textContent = `Users online: ${messageData.count}`;
}

function handleDelete(messageData) {
  const messageToDelete = document.querySelector(
    `[data-message-id="${messageData.messageId}"]`
  );
  if (messageToDelete) {
    messages.removeChild(messageToDelete);
  }
}

function handleRoomsList(messageData) {
  updateRoomsList(messageData.rooms);
}

function deleteSpecificMessage(event) {
  const messageId = event.target.dataset.messageId;
  if (socket && messageId) {
    socket.send(JSON.stringify({ type: 'delete', messageId: messageId }));
  }
}

function onSocketClose() {
  stopChat();
}

function onSocketError(event) {
  console.error('WebSocket error:', event);
}

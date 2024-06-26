let socket = null;
let currentRoomId = null; // Add this line
let currentUsername = null;

//웹 시작할때 실행
function startChat(roomId) {
  //socket server 지정
  //ws 는 http, wss 는 https
  //socket = new WebSocket('wss://port-0-chatapp-6g2llfb56c7n.sel3.cloudtype.app');
  socket = new WebSocket('ws://localhost:3000/');

  socket.addEventListener('open', () => {
    chatArea.style.display = 'block'; // Start Chat 버튼 block
    //처음 시작할때 username과 내가 지정한 roomId
    const username = document.getElementById('username').value.trim(); // Get the username from the input field
    //정상작동
    currentUsername = username;


  const isPrivate = document.getElementById("privateRoom").checked; // Get the private checkbox value
  joinRoom(roomId, currentUsername, isPrivate); // Pass the isPrivate value to joinRoom
    //위에 체크
  socket.send(JSON.stringify({ type: 'getRooms' })); // Request the list of active chat rooms

    //You are in X 
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
    roomElement.textContent = `${room.id} (${room.usersCount})`; // Display the number of users in the room
    roomElement.addEventListener('click', () => joinRoom(room.id, currentUsername, room.isPrivate));
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

  //버튼 disabled
  startChatBtn.disabled = false;
  stopChatBtn.disabled = true;
  chatArea.style.display = 'none';
  messages.innerHTML = '';
}

//이게 위에 
function joinRoom(roomId, currentUsername, isPrivate) {
  if (socket) {
    if (currentRoomId) {
      socket.send(JSON.stringify({ type: "leave", roomId: currentRoomId }));
    }

    updateRoomNumber(roomId);
    socket.send(
      JSON.stringify({
        type: "join",
        roomId: roomId,
        username: currentUsername,
        isPrivate: isPrivate,
      })
    );
    currentRoomId = roomId;
  }
}

let isCountingDown = false;

function sendMessage() {
  const message = messageInput.value.trim();
  if (message && !isCountingDown) {
    startCountdown(3, message);
  }
}

function startCountdown(seconds, message) {
  let counter = seconds;
  sendMessageBtn.disabled = true;
  isCountingDown = true;

  const intervalId = setInterval(() => {
    if (counter > 0) {
      sendMessageBtn.innerText = `Send (${counter} sec)`;
      counter--;
    } else {
      clearInterval(intervalId);
      sendMessageBtn.innerText = 'Send';
      sendMessageBtn.disabled = false;
      isCountingDown = false;
      autoSendMessage(message);
    }
  }, 1000);
}

function autoSendMessage(message) {
  if (socket && message) {
    socket.send(JSON.stringify({ type: 'message', content: message, username: currentUsername }));
    messageInput.value = '';
  }
}

function deleteMessage() {
  if (messages.lastChild && messages.lastChild.classList.contains('outgoing')) {
    messages.removeChild(messages.lastChild);
  }
}


// user name 잘 작동됌
function onSocketMessage(event) {
  const messageData = JSON.parse(event.data);
  switch (messageData.type) {
    //메세지 보낼때만 작동
    case 'message':
      console.log('chat3')
      handleMessage(messageData);
      break;
    //Start Chat, 과 위 방 번호 눌렀을때 작동
    case 'usersOnline':

      handleUsersOnline(messageData);
      break;
    //드레그해서 지울때만 작동 
    case 'delete':
      handleDelete(messageData);
      break;
    //Start Chat 버튼 1번 Refresh Rooms List 누를때만 작동
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

  // Add a delete button for each message
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'X';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.addEventListener('click', () => {
    deleteSpecificMessage(messageData.messageId);
  });
  
  messageElement.appendChild(deleteBtn);

  messageElement.dataset.messageId = messageData.messageId;
  messages.appendChild(messageElement);
  scrollToBottom();
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

function deleteSpecificMessage(messageId) {
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

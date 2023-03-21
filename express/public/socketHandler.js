let socket = null;


function startChat(roomId) {
  //socket = new WebSocket('wss://port-0-chatapp-6g2llfb56c7n.sel3.cloudtype.app');
  socket = new WebSocket('ws://localhost:3000/');

  socket.addEventListener('open', () => {
    onSocketOpen();
    const username = document.getElementById('username').value.trim(); // Get the username from the input field
    joinRoom(roomId, username); // Pass the username when joining the room
    socket.send(JSON.stringify({ type: 'getRooms' })); // Request the list of active chat rooms

    updateRoomNumber(roomId);
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

function joinRoom(roomId, username) { // Add username parameter here
  if (socket) {
    socket.send(JSON.stringify({ type: 'join', roomId: roomId, username: username })); // Include the username in the join request
  }
}

function sendMessage() {
  const username = document.getElementById('username').value.trim(); // Get the username
  const message = messageInput.value.trim();
  if (message && socket) {
    socket.send(
      JSON.stringify({ type: 'message', content: message, username: username })
    ); // Send the username with the message
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
    messageElement.classList.add(
      messageData.senderId === 'self' ? 'outgoing' : 'incoming'
    );

    if (messageData.senderId === 'self' || messageData.senderId === 'other') {
      const usernameElement = document.createElement('small');
      usernameElement.textContent = messageData.username;
      usernameElement.classList.add('username');
      messageElement.appendChild(usernameElement);
    }

    const contentElement = document.createElement('span');
    contentElement.textContent = messageData.content;
    messageElement.appendChild(contentElement);
    messageElement.dataset.messageId = messageData.messageId;
    messageElement.addEventListener('click', deleteSpecificMessage);
    messages.appendChild(messageElement);
  } else if (messageData.type === 'usersOnline') {
    usersOnline.textContent = `Users online: ${messageData.count}`;
  } else if (messageData.type === 'delete') {
    const messageToDelete = document.querySelector(
      `[data-message-id="${messageData.messageId}"]`
    );
    if (messageToDelete) {
      messages.removeChild(messageToDelete);
    }
  } else if (messageData.type === 'roomsList') {
    updateRoomsList(messageData.rooms);
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

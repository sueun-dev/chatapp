/**
 * -----------------------------------------------
 * Chat Application Usage Guide
 * -----------------------------------------------
 * 1. Start Chat:
 *    - Input your desired room ID in the 'roomId' input field.
 *    - Input your username in the 'username' input field.
 *    - Click the 'Start Chat' button to join the chat room.
 * 
 * 2. Stop Chat:
 *    - Click the 'Stop Chat' button to leave the chat room.
 * 
 * 3. Send Message:
 *    - Type your message in the 'messageInput' input field.
 *    - Click the 'Send Message' button or press Enter to send your message.
 * 
 * 4. Delete Message:
 *    - Click the 'Delete Message' button to delete your last sent message.
 * 
 * 5. View Messages:
 *    - Messages will appear in the 'messages' section of the chat area.
 *    - The chat automatically scrolls to the bottom to display the latest messages.
 * 
 * 6. Refresh Rooms List:
 *    - (Optional) Implement a method to refresh or display the list of available rooms.
 *    - This requires handling with a server or socket connection.
 * 
 * 7. Users Online:
 *    - (Optional) Display the number of users online or in the same room.
 *    - This requires server-side functionality to track and send this information.
 * 
 * Note: Some functions like refreshing the rooms list or displaying users online
 *       require additional implementation on the server side and handling through
 *       websocket or similar real-time communication protocols.
 * -----------------------------------------------
 */

// Get references to DOM elements
const startChatBtn = document.getElementById('startChat');
const stopChatBtn = document.getElementById('stopChat');
const chatArea = document.getElementById('chatArea');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
const deleteMessageBtn = document.getElementById('deleteMessage');
const usersOnline = document.getElementById('usersOnline');

// Adds an event listener to the 'Start Chat' button
startChatBtn.addEventListener('click', () => {
  // Retrieve user inputs for room ID and username
  const roomId = document.getElementById('roomId').value.trim();
  const userName = document.getElementById('username').value.trim();
  // Validate inputs and start the chat if both inputs are provided
  if (roomId && userName) {
    startChat(roomId);
  } else if (!roomId && !userName) { // Alert if both inputs are missing
    alert("Write user name and room number");
  } else if (!roomId) { // Alert if room ID is missing
    alert("write your room number");
  } else { // Alert if username is missing
    alert("write your user name");
  }
});

// Adds an event listener to the 'Stop Chat' button
stopChatBtn.addEventListener('click', () => {
  stopChat(); // Function to stop the chat
});

// Adds an event listener to the 'Send Message' button
sendMessageBtn.addEventListener('click', () => {
  sendMessage(); // Function to send a message
});

// Adds an event listener to the 'Delete Message' button
deleteMessageBtn.addEventListener('click', () => {
  deleteMessage(); // Function to delete a message
});

// Adds an event listener for the 'Enter' key in the message input field
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevents the default action of the Enter key
    sendMessage(); // Sends the message
  }
});

// Function to refresh the list of chat rooms (assumes a 'socket' object is used for communication)
function refreshRoomsList() {
  if (socket) {
    socket.send(JSON.stringify({ type: 'getRooms' }));
  }
}

// Function to scroll the message view to the bottom
function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

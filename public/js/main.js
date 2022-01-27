const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const usersList = document.getElementById("users");

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();
// join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on("message", (message) => {
  // message from server
  console.log(message);
  outputMessage(message);
  // scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // catch message
  const msg = e.target.elements.msg.value;
  // emmit message to server
  socket.emit("chatMessage", msg);
  // clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// add outputMessage to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
<p class="text">
  ${message.text}
</p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  usersList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}

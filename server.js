// imports
const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/message");
const {
  userJoin,
  getCurrentUser,
  getRoomUsers,
  userLeave,
} = require("./utils/users");
// instances
const app = express();
const server = http.createServer(app);
const io = socketio(server);
// set static folder
app.use(express.static(path.join(__dirname, "public")));

// run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // welcome message to current user
    socket.emit("message", formatMessage("Chat Bot", "welcome to ChatCord"));
    // brodcast when a user join
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("Chat Bot", `${user.username} joined the chat`)
      );
    // send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen to chatMessage
  socket.on("chatMessage", (msg) => {
    const current_user = getCurrentUser(socket.id);
    io.to(current_user.room).emit(
      "message",
      formatMessage(current_user.username, msg)
    );
  });

  // runs when client dissconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    // messge to all users
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("Chat Bot", `${user.username} has left the chat`)
      );
      // send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// port
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`is running on port: ${PORT}`));

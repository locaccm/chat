const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // Serve frontend files

// Sample users with two types: "Loc" & "Pro"
const users = [
  { id: 1, name: "Alice", type: "Loc", linkedTo: [4, 5] },
  { id: 2, name: "Bob", type: "Loc", linkedTo: [4] },
  { id: 3, name: "Charlie", type: "Loc", linkedTo: [5] },
  { id: 4, name: "David", type: "Pro", linkedTo: [1, 2] },
  { id: 5, name: "Eve", type: "Pro", linkedTo: [1, 3] },
];

// Serve users list
app.get("/users", (req, res) => {
  res.json(users);
});

// Store active users
const activeUsers = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  // When a user logs in, store their socket
  socket.on("register user", (userId) => {
    activeUsers[userId] = socket;
    console.log(`User ${userId} connected.`);
  });

  socket.on("chat message", (data) => {
    const { to, message, from } = data;
    const sender = users.find((user) => user.id == from);
    const recipientSocket = activeUsers[to];
    const senderSocket = activeUsers[from];

    const senderName = sender ? sender.name : "Unknown";

    if (recipientSocket) {
        recipientSocket.emit("chat message", { message, from: senderName });
    }

    if (senderSocket) {
        senderSocket.emit("chat message", { message, from: senderName });
    }
});


  socket.on("disconnect", () => {
    let disconnectedUser = null;

    // Find the user who disconnected
    Object.keys(activeUsers).forEach((userId) => {
      if (activeUsers[userId] === socket) {
        disconnectedUser = users.find((u) => u.id == userId);
        delete activeUsers[userId];
      }
    });

    if (disconnectedUser) {
      console.log(
        `User ${disconnectedUser.name} (ID: ${disconnectedUser.id}) disconnected.`
      );
    } else {
      console.log("An unknown user disconnected.");
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

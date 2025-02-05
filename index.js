const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json()); // Middleware for JSON request body

// Sample users (Loc = Local User, Pro = Professional)
const users = [
  { id: 1, name: "Alice", type: "Loc", linkedTo: [4, 5] },
  { id: 2, name: "Bob", type: "Loc", linkedTo: [4] },
  { id: 3, name: "Charlie", type: "Loc", linkedTo: [5] },
  { id: 4, name: "David", type: "Pro", linkedTo: [1, 2] },
  { id: 5, name: "Eve", type: "Pro", linkedTo: [1, 3] },
];

// Store active users (Socket.IO connections)
const activeUsers = {};

// ** API ROUTES **

// Get all users
app.get("/users", (req, res) => {
  res.json(users);
});

// Get a single user by ID
app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// Get linked contacts for a user
app.get("/users/:id/contacts", (req, res) => {
  const user = users.find((u) => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const linkedContacts = users.filter((u) => user.linkedTo.includes(u.id));
  res.json(linkedContacts);
});

// ** WEBSOCKET EVENTS **
io.on("connection", (socket) => {
  console.log("A user connected");

  // Register user on WebSocket connection
  socket.on("register user", (userId) => {
    activeUsers[userId] = socket;
    console.log(`User ${userId} connected.`);
  });

  // Handle chat messages
  socket.on("chat message", (data) => {
    const { to, message, from } = data;
    const sender = users.find((user) => user.id == from);
    const recipientSocket = activeUsers[to];
    const senderSocket = activeUsers[from];

    if (!sender) return;

    const payload = { message, from: sender.name };

    // Send message to recipient (if online)
    if (recipientSocket) {
      recipientSocket.emit("chat message", payload);
    }

    // Send message back to sender (for display)
    if (senderSocket) {
      senderSocket.emit("chat message", payload);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    let disconnectedUser = null;

    // Remove user from activeUsers
    Object.keys(activeUsers).forEach((userId) => {
      if (activeUsers[userId] === socket) {
        disconnectedUser = users.find((u) => u.id == userId);
        delete activeUsers[userId];
      }
    });

    if (disconnectedUser) {
      console.log(`User ${disconnectedUser.name} (ID: ${disconnectedUser.id}) disconnected.`);
    } else {
      console.log("An unknown user disconnected.");
    }
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

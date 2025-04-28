const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend files
app.use(express.static("public")); // Si tu veux garder cette ligne de la branche fusionnée.

// Parse JSON request bodies
app.use(express.json()); // Si tu veux garder cette ligne également.

// Sample users
const users = [
  { id: 1, name: "Alice", type: "Loc", linkedTo: [4, 5] },
  { id: 2, name: "Bob", type: "Loc", linkedTo: [4] },
  { id: 3, name: "Charlie", type: "Loc", linkedTo: [5] },
  { id: 4, name: "David", type: "Pro", linkedTo: [1, 2] },
  { id: 5, name: "Eve", type: "Pro", linkedTo: [1, 3] },
];

// Store active users
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

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg); // Broadcast to all users
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

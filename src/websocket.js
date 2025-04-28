const { users, messages } = require("./database");

const activeUsers = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    // ­ƒö╣ Enregistrer un utilisateur sur WebSocket
    socket.on("register user", (userId) => {
      activeUsers[userId] = socket;
      console.log(`User ${userId} registered`);
    });

    // ­ƒö╣ Envoyer un message via WebSocket
    socket.on("chat message", (data) => {
      const { to, message, from } = data;
      const sender = users.find((o) => o.USEN_ID == from);
      const recipientSocket = activeUsers[to];

      if (!sender) return;

      const payload = {
        MESN_ID: messages.length + 1,
        MESN_SENDER: from,
        MESN_RECEIVER: to,
        MESC_CONTENT: message,
        MESD_DATE: new Date(),
        MESB_READ: 0,
      };

      messages.push(payload);

      if (recipientSocket) {
        recipientSocket.emit("chat message", payload);
      }

      if (activeUsers[from]) {
        activeUsers[from].emit("chat message", payload);
      }
    });

    // ­ƒö╣ G├®rer la d├®connexion
    socket.on("disconnect", () => {
      Object.keys(activeUsers).forEach((userId) => {
        if (activeUsers[userId] === socket) {
          delete activeUsers[userId];
        }
      });
    });
  });
};

// Ô£à Export `activeUsers` pour permettre les tests
module.exports.activeUsers = activeUsers;

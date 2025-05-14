import { Server, Socket } from "socket.io";

export type DBClient = {
  getUserById: (id: string) => Promise<any | null>;
  saveMessage: (from: string, to: string, message: string) => Promise<any>;
};

const activeUsers: Record<string, Socket> = {};

const setupWebSocket = (io: Server, db: DBClient): void => {
  if (!io) {
    throw new Error("io is not defined");
  }

  io.on("connection", (socket: Socket) => {
    socket.on("register user", async (userId: string) => {
      try {
        const user = await db.getUserById(userId);

        if (!user) {
          socket.emit("error", { error: "User not found" });
          return;
        }

        activeUsers[userId] = socket;
        socket.emit("user registered", { userId });
      } catch (err) {
        console.error("Error during registration:", err);
        socket.emit("error", { error: "Server error during registration" });
      }
    });

    socket.on(
      "chat message",
      async (data: { from: string; to: string; message: string }) => {
        const { from, to, message } = data;

        if (!from || !to || !message) {
          socket.emit("error", { error: "Invalid message data" });
          return;
        }

        try {
          const savedMessage = await db.saveMessage(from, to, message);

          const messageToSend = {
            from: savedMessage.MESN_SENDER,
            to: savedMessage.MESN_RECEIVER,
            message: savedMessage.MESC_CONTENT,
          };

          if (activeUsers[to]) {
            activeUsers[to].emit("chat message", messageToSend);
          }

          if (activeUsers[from]) {
            activeUsers[from].emit("chat message", messageToSend);
          }
        } catch (err) {
          console.error("Error saving message:", err);
          socket.emit("error", { error: "Could not send message" });
        }
      },
    );

    socket.on("disconnect", () => {
      for (const userId in activeUsers) {
        if (activeUsers[userId] === socket) {
          delete activeUsers[userId];
          break;
        }
      }
    });
  });
};

export { setupWebSocket, activeUsers };

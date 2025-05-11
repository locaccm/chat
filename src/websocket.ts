import { Server, Socket } from "socket.io";
import pool from "./db";

const activeUsers: Record<string, Socket> = {};

const setupWebSocket = (io: Server): void => {
  if (!io) {
    throw new Error("io is not defined");
  }

  io.on("connection", (socket: Socket) => {
    socket.on("register user", async (userId: string) => {
      try {
        const result = await pool.query(
          'SELECT * FROM "USER" WHERE "USEN_ID" = $1',
          [userId],
        );

        if (result.rows.length === 0) {
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
          const result = await pool.query(
            `INSERT INTO "MESSAGE" ("MESN_SENDER", "MESN_RECEIVER", "MESC_CONTENT", "MESD_DATE", "MESB_READ")
           VALUES ($1, $2, $3, NOW(), false)
           RETURNING *`,
            [from, to, message],
          );

          const savedMessage = result.rows[0];

          if (activeUsers[to]) {
            activeUsers[to].emit("chat message", savedMessage);
          }

          if (activeUsers[from]) {
            activeUsers[from].emit("chat message", savedMessage);
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

const closeServer = (io: Server, done: () => void): void => {
  if (io) {
    io.close(() => done());
  } else {
    done();
  }
};

export { setupWebSocket as default, activeUsers, closeServer };

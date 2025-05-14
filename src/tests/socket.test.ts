import { Server as IOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import { setupWebSocket } from "../websocket";
import mockAdapter from "../mockDbAdapter";
import prisma from "../prisma";

const {
  mockFindMany,
  mockFindFirst,
  mockFindUnique,
  mockCreate,
} = require("../prisma");

jest.mock("../prisma");

let ioServer: IOServer;
let httpServer: HTTPServer;
let clientSocket: ClientSocket;
let receiverSocket: ClientSocket;
const serverUrl = "http://localhost:3000";

const initSocketServer = () => {
  httpServer = createServer();
  ioServer = new IOServer(httpServer);

  setupWebSocket(ioServer, mockAdapter);

  return new Promise<void>((resolve) => {
    httpServer.listen(3000, () => resolve());
  });
};

beforeAll(async () => {
  await initSocketServer();
});

afterAll(async () => {
  if (clientSocket?.connected) {
    await new Promise((resolve) => {
      clientSocket.on("disconnect", resolve);
      clientSocket.disconnect();
    });
  }

  if (receiverSocket?.connected) {
    await new Promise((resolve) => {
      receiverSocket.on("disconnect", resolve);
      receiverSocket.disconnect();
    });
  }

  ioServer.close();
  httpServer.close();
});

beforeEach((done) => {
  clientSocket = ioClient(serverUrl);
  clientSocket.on("connect", done);
});

afterEach(async () => {
  if (clientSocket?.connected) {
    await new Promise<void>((resolve) => {
      clientSocket.on("disconnect", () => resolve());
      clientSocket.disconnect();
    });
  }

  if (receiverSocket?.connected) {
    await new Promise<void>((resolve) => {
      receiverSocket.on("disconnect", () => resolve());
      receiverSocket.disconnect();
    });
  }
});

describe("WebSocket Tests", () => {
  it("should register user successfully", (done) => {
    const fakeUser = { USEN_ID: "1" };

    mockFindUnique.mockResolvedValueOnce(fakeUser);

    clientSocket.emit("register user", "1");

    clientSocket.on("user registered", ({ userId }) => {
      expect(userId).toBe("1");
      done();
    });

    clientSocket.on("error", (err) => {
      done(new Error(`Error event received: ${err}`));
    });
  });

  it("should handle invalid user registration", (done) => {
    mockFindUnique.mockResolvedValueOnce(null);

    clientSocket.emit("register user", "9999");

    clientSocket.on("error", (err) => {
      expect(err.error).toBe("User not found");
      done();
    });
  });

  it("should send and receive a chat message", (done) => {
    jest.setTimeout(20000);

    const senderId = "1";
    const receiverId = "2";
    const message = "Hello, world!";

    receiverSocket = ioClient(serverUrl);

    mockFindUnique
      .mockResolvedValueOnce({ USEN_ID: senderId })
      .mockResolvedValueOnce({ USEN_ID: receiverId });

    mockFindFirst.mockResolvedValueOnce({ USEN_ID: receiverId });
    mockCreate.mockResolvedValueOnce({ message });

    receiverSocket.on("connect", () => {
      receiverSocket.emit("register user", receiverId);
    });

    receiverSocket.on("user registered", () => {
      mockFindUnique.mockResolvedValueOnce({ USEN_ID: senderId });
      clientSocket.emit("register user", senderId);
    });

    receiverSocket.on("chat message", (data) => {
      try {
        expect(data.message).toBe(message);
        receiverSocket.close();
        clientSocket.close();
        done();
      } catch (err) {
        receiverSocket.close();
        clientSocket.close();
        done(err);
      }
    });

    clientSocket.on("user registered", () => {
      clientSocket.emit("chat message", {
        from: senderId,
        to: receiverId,
        message,
      });
    });

    clientSocket.on("error", (err) => {
      receiverSocket.close();
      done(new Error(`Sender socket error: ${JSON.stringify(err)}`));
    });

    receiverSocket.on("error", (err) => {
      receiverSocket.close();
      done(new Error(`Receiver socket error: ${JSON.stringify(err)}`));
    });
  });

  it("should handle invalid chat message data", (done) => {
    clientSocket.emit("chat message", { from: "", to: "", message: "" });

    clientSocket.on("error", (err) => {
      expect(err.error).toBe("Invalid message data");
      done();
    });
  });

  it("should remove user on disconnect", (done) => {
    const userId = "1";
    const { activeUsers } = require("../websocket");

    mockFindUnique.mockResolvedValueOnce({ USEN_ID: userId });

    clientSocket.emit("register user", userId);

    clientSocket.on("user registered", () => {
      clientSocket.disconnect();

      setTimeout(() => {
        expect(activeUsers[userId]).toBeUndefined();
        done();
      }, 150);
    });
  });
});

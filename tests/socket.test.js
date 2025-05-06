const { Server } = require("socket.io");
const { createServer } = require("http");
const ioClient = require("socket.io-client");

let ioServer;
let httpServer;
let clientSocket;

beforeAll((done) => {
  httpServer = createServer();
  ioServer = new Server(httpServer);

  ioServer.on("connection", (socket) => {
    socket.on("register", (data) => {
      socket.emit("register_success", { userId: 123, username: data.username });
    });
  });

  httpServer.listen(3000, () => {
    done();
  });
});

afterAll((done) => {
  clientSocket.close();
  ioServer.close();
  httpServer.close(() => {
    done();
  });
});

test("User should be able to register on WebSocket", (done) => {
  clientSocket = ioClient("http://localhost:3000");

  clientSocket.on("connect", () => {
    clientSocket.emit("register", { username: "Léo" });
  });

  clientSocket.on("register_success", (data) => {
    expect(data).toEqual({ userId: 123, username: "Léo" });
    done();
  });

  clientSocket.on("connect_error", (err) => {
    done(err);
  });
});

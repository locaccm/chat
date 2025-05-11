import { Server as IOServer, Socket } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";

let ioServer: IOServer;
let httpServer: HTTPServer;
let clientSocket: ClientSocket;

beforeAll((done) => {
  httpServer = createServer();
  ioServer = new IOServer(httpServer);

  ioServer.on("connection", (socket: Socket) => {
    socket.on("register", (data: { username: string }) => {
      socket.emit("register_success", { userId: 123, username: data.username });
    });
  });

  httpServer.listen(3000, done);
});

afterAll((done) => {
  clientSocket.close();
  ioServer.close();
  httpServer.close(done);
});

test("User should be able to register on WebSocket", (done) => {
  clientSocket = ioClient("http://localhost:3000");

  clientSocket.on("connect", () => {
    clientSocket.emit("register", { username: "Léo" });
  });

  clientSocket.on(
    "register_success",
    (data: { userId: number; username: string }) => {
      expect(data).toEqual({ userId: 123, username: "Léo" });
      done();
    },
  );

  clientSocket.on("connect_error", (err: Error) => {
    done(err);
  });
});

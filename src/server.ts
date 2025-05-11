import express, { Application } from "express";
import http, { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import routes from "./routes";
import setupWebSocket from "./websocket";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";

const app: Application = express();
app.use(express.json());
app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const server: HTTPServer = http.createServer(app);
const io: SocketIOServer = new SocketIOServer(server);

setupWebSocket(io);

export { app, server, io };

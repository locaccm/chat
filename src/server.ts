import express, { Application } from "express";
import http, { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import routes from "./routes";
import { setupWebSocket } from "./websocket";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import pgAdapter from "./dbAdapter";

const app: Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization,user-id",
    credentials: true,
  }),
); //NOSONAR

app.use(express.json());
app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const server: HTTPServer = http.createServer(app);
const io: SocketIOServer = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupWebSocket(io, pgAdapter);

export { app, server, io };

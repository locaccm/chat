const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const routes = require("./routes");
const setupWebSocket = require("./websocket");

const app = express();
app.use(express.json());
app.use("/api", routes);

const server = http.createServer(app);
const io = new Server(server);
setupWebSocket(io);

module.exports = { app, server };

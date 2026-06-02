
require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const dbConnect = require("./config/mongoDB");

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 8000;

dbConnect();
app.use(express.json({ limit: "20mb" }));

const FishRouter = require("./routes/router")(wss);
app.use("/", FishRouter);

wss.on("connection", (ws) => {
  console.log("WebSocket 연결됨");
  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());
    console.log("받은 데이터:", data);
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
<<<<<<< HEAD
});

//npm install dotenv mongoose express ws
=======
});
>>>>>>> c32d83df01884dfe47a10dd2b72288d3a20ed92a

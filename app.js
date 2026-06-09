const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const cors = require("cors");
const dbConnect = require("./config/mongoDB");
const path = require("path");

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 8000;

dbConnect();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" }));

// 정적 파일 서빙 (대시보드)
app.use(express.static(path.join(__dirname, "public")));

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
});
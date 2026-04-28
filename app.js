const express = require("express");
const FishRouter = require("./routes/router");
const dbConnect = require("./config/mongoDB");

const { createServer } = require("http");
const { WebSocketServer } = require("ws");

const app = express();
const PORT = 8000;

// dbConnect();
app.use(express.json());

// API 라우터 연결
app.use("/", FishRouter);

// HTTP 서버 생성
const server = createServer(app);

// WebSocket 서버 붙이기
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("WebSocket 연결됨");

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());
    console.log("받은 데이터:", data);

    // 모든 클라이언트에게 전달
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

//npm install dotenv mongoose express ws

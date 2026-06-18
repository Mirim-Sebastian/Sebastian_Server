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
app.use(express.json({ limit: "50mb" }));
app.get("/favicon.ico", (req, res) => res.status(204).end());

// 정적 파일 서빙 (대시보드)
app.use(express.static(path.join(__dirname, "public")));

const FishRouter = require("./routes/router")(wss);
app.use("/", FishRouter);

app.use((error, req, res, next) => {
  if (!error) return next();

  const status = error.status || error.statusCode || 500;
  console.error(`[${req.method}] ${req.originalUrl}`, error);
  res.status(status).json({
    message:
      status === 413
        ? "요청 데이터가 너무 큽니다."
        : error.message || "서버 오류가 발생했습니다.",
  });
});

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

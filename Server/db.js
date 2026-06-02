require("dotenv").config({ path: "./config.env" });

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.DB_URI || process.env.DB_URL;
if (!uri) {
  console.error("DB 연결 실패: 환경변수 DB_URI 또는 DB_URL이 설정되어 있지 않습니다.");
  process.exit(1);
}

export const ServerClient = new MongoClient(uri);
export const dbName = "Sebastian";
export async function RunDB() {
  try {
    await ServerClient.connect();
    console.log("MongoDB 연결 완료");

    //api 쓸 때 const db = req.app.locals.db로 변수 생성하고 사용 가능
    app.locals.db = ServerClient.db(dbName);

    app.listen(5000, () => {
      console.log("서버 실행 중..");
    });
  } catch (e) {
    console.error("DB 연결 실패 : ", e);
    process.exit(1);
  }
}
RunDB();

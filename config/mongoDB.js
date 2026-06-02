const mongoose = require("mongoose");
require("dotenv").config(); // env 값 가져오기

const uri = process.env.DB_URI || process.env.DB_URL;

const dbConnect = async () => {
  if (!uri) {
    console.error("DB 연결 실패: 환경변수 DB_URI 또는 DB_URL이 설정되어 있지 않습니다.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("DB 연결 성공");
  } catch (error) {
    console.error("DB 연결 실패:", error);
    process.exit(1);
  }
};
module.exports = dbConnect;

require("dotenv").config({path: "./config.env"});

const express = require("express");
const cors = require('cors');
const {MongoClient} = require("mongodb");

const app = express();
app.use(express.json());
app.use(cors());

export const ServerClient = new MongoClient(process.env.DB_URI);
export const dbName = "Sebastian";
export  async function RunDB(){
    try{
        await ServerClient.connect();
        console.log("MongoDB 연결 완료");

        //api 쓸 때 const db = req.app.locals.db로 변수 생성하고 사용 가능
        app.locals.db = ServerClient.db(dbName);

        app.listen(5000, () => {
            console.log("서버 실행 중..");
        });
        
    } catch (e){
        console.error("DB 연결 실패 : ", e);
        process.exit(1);
    }
}
RunDB();